#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const lib = require("./lib");

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const flags = {};
  const positional = [];
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = rest[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }
  return { command, flags, positional };
}

function cmdPlan(flags) {
  const weeks = Number(flags.weeks || 2);
  const { pillars, byId } = lib.loadPillars();
  const schedule = lib.loadSchedule();
  if (!pillars.length) {
    console.error("No pillars configured in config/pillars.json");
    process.exit(1);
  }
  const postsPerWeek = schedule.postingDays.length;
  const count = postsPerWeek * weeks;
  const dates = lib.nextPostingDates(schedule.postingDays, count);
  const calendar = lib.loadCalendar();
  const existingIds = new Set(calendar.map((s) => s.id));

  let rotationIndex = calendar.length % schedule.pillarRotation.length;
  let added = 0;
  for (const date of dates) {
    const pillarId = schedule.pillarRotation[rotationIndex % schedule.pillarRotation.length];
    rotationIndex++;
    const id = lib.slotId(date, pillarId);
    if (existingIds.has(id)) continue;
    const pillar = byId.get(pillarId);
    if (!pillar) continue;
    lib.scaffoldNotesFile(id, pillar);
    calendar.push({
      id,
      date,
      pillarId,
      status: "planned",
      notesFile: path.relative(lib.ROOT, lib.notesPath(id)),
    });
    added++;
  }
  calendar.sort((a, b) => a.date.localeCompare(b.date));
  lib.saveCalendar(calendar);
  console.log(`Planned ${added} new slot(s) across ${weeks} week(s).`);
  console.log(`Fill in the notes files under content/notes/ with what's actually true, then run "generate".`);
}

async function cmdGenerate() {
  const { byId } = lib.loadPillars();
  const calendar = lib.loadCalendar();
  let generated = 0;
  let skipped = 0;
  for (const slot of calendar) {
    if (slot.status !== "planned") continue;
    if (!lib.notesAreFilledIn(slot.id)) {
      skipped++;
      continue;
    }
    const pillar = byId.get(slot.pillarId);
    const bullets = lib.readNotesBullets(slot.id);
    const draft = await lib.generateDraft(pillar, bullets);
    fs.mkdirSync(lib.DRAFTS_DIR, { recursive: true });
    fs.writeFileSync(
      lib.draftPath(slot.id),
      `<!-- pillar: ${pillar.name} | date: ${slot.date} | status: draft -->\n\n${draft}\n`
    );
    slot.status = "drafted";
    generated++;
  }
  lib.saveCalendar(calendar);
  console.log(`Generated ${generated} draft(s). ${skipped} slot(s) still need notes filled in.`);
}

function cmdList() {
  const calendar = lib.loadCalendar();
  if (!calendar.length) {
    console.log('No calendar entries yet. Run "plan" first.');
    return;
  }
  for (const slot of calendar) {
    console.log(`${slot.date}  [${slot.status.padEnd(8)}]  ${slot.pillarId}  (${slot.id})`);
  }
}

function cmdMarkPosted(positional) {
  const id = positional[0];
  if (!id) {
    console.error("Usage: mark-posted <slot-id>");
    process.exit(1);
  }
  const calendar = lib.loadCalendar();
  const slot = calendar.find((s) => s.id === id);
  if (!slot) {
    console.error(`No calendar entry with id ${id}`);
    process.exit(1);
  }
  const from = lib.draftPath(id);
  const to = lib.postedPath(id);
  if (fs.existsSync(from)) {
    fs.mkdirSync(lib.POSTED_DIR, { recursive: true });
    fs.renameSync(from, to);
  }
  slot.status = "posted";
  slot.postedAt = new Date().toISOString();
  lib.saveCalendar(calendar);
  console.log(`Marked ${id} as posted.`);
}

function printHelp() {
  console.log(`LinkedIn Content Studio

Usage:
  node src/cli.js plan [--weeks N]      Plan the next N weeks (default 2) of posting
                                          slots and scaffold notes files for each.
  node src/cli.js generate               Turn filled-in notes into draft posts.
  node src/cli.js list                   List all calendar slots and their status.
  node src/cli.js mark-posted <slot-id>  Mark a draft as posted and archive it.

Workflow:
  1. plan       -> creates content/notes/<slot-id>.md placeholders
  2. (you edit) -> fill in 2-5 real, honest bullets per notes file
  3. generate   -> writes content/drafts/<slot-id>.md
  4. (you review, edit, and post it yourself on LinkedIn)
  5. mark-posted <slot-id>

Optional: set ANTHROPIC_API_KEY and install @anthropic-ai/sdk to have
"generate" draft posts with Claude instead of the built-in templates.
Either way, only what you write in the notes file is used as fact.
`);
}

async function main() {
  const { command, flags, positional } = parseArgs(process.argv.slice(2));
  switch (command) {
    case "plan":
      cmdPlan(flags);
      break;
    case "generate":
      await cmdGenerate();
      break;
    case "list":
      cmdList();
      break;
    case "mark-posted":
      cmdMarkPosted(positional);
      break;
    default:
      printHelp();
      if (command && command !== "help") process.exitCode = 1;
  }
}

main();
