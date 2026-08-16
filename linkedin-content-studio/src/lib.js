const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CONFIG_DIR = path.join(ROOT, "config");
const CONTENT_DIR = path.join(ROOT, "content");
const NOTES_DIR = path.join(CONTENT_DIR, "notes");
const DRAFTS_DIR = path.join(CONTENT_DIR, "drafts");
const POSTED_DIR = path.join(CONTENT_DIR, "posted");
const CALENDAR_PATH = path.join(CONTENT_DIR, "calendar.json");

const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function loadJSON(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveJSON(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function loadPillars() {
  const { pillars } = loadJSON(path.join(CONFIG_DIR, "pillars.json"), { pillars: [] });
  const byId = new Map(pillars.map((p) => [p.id, p]));
  return { pillars, byId };
}

function loadSchedule() {
  return loadJSON(path.join(CONFIG_DIR, "schedule.json"), {
    postingDays: ["Monday", "Wednesday", "Friday"],
    pillarRotation: [],
  });
}

function loadCalendar() {
  return loadJSON(CALENDAR_PATH, []);
}

function saveCalendar(calendar) {
  saveJSON(CALENDAR_PATH, calendar);
}

function dateToISO(d) {
  return d.toISOString().slice(0, 10);
}

function nextPostingDates(postingDays, count, startDate) {
  const wanted = new Set(postingDays.map((d) => WEEKDAYS.indexOf(d)));
  const dates = [];
  const cursor = new Date(startDate || Date.now());
  cursor.setUTCHours(0, 0, 0, 0);
  cursor.setUTCDate(cursor.getUTCDate() + 1); // start from tomorrow
  while (dates.length < count) {
    if (wanted.has(cursor.getUTCDay())) {
      dates.push(dateToISO(cursor));
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function slotId(date, pillarId) {
  return `${date}-${pillarId}`;
}

function notesPath(id) {
  return path.join(NOTES_DIR, `${id}.md`);
}

function draftPath(id) {
  return path.join(DRAFTS_DIR, `${id}.md`);
}

function postedPath(id) {
  return path.join(POSTED_DIR, `${id}.md`);
}

function scaffoldNotesFile(id, pillar) {
  const file = notesPath(id);
  if (fs.existsSync(file)) return false;
  const body = [
    `# Notes for ${id}`,
    "",
    `Pillar: ${pillar.name}`,
    "",
    `> ${pillar.notesPrompt}`,
    "",
    "Replace this with real, specific bullets. Nothing here gets posted until you write it.",
    "",
    "- ",
    "- ",
    "- ",
    "",
  ].join("\n");
  fs.mkdirSync(NOTES_DIR, { recursive: true });
  fs.writeFileSync(file, body);
  return true;
}

function notesAreFilledIn(id) {
  const file = notesPath(id);
  if (!fs.existsSync(file)) return false;
  const text = fs.readFileSync(file, "utf8");
  const bulletLines = text
    .split("\n")
    .filter((line) => /^\s*-\s+\S/.test(line));
  return bulletLines.length > 0;
}

function readNotesBullets(id) {
  const file = notesPath(id);
  const text = fs.readFileSync(file, "utf8");
  return text
    .split("\n")
    .filter((line) => /^\s*-\s+\S/.test(line))
    .map((line) => line.replace(/^\s*-\s+/, "").trim());
}

const LEADING_VERBS = /^(shipped|built|spent|decided|learned|launched|fixed|finished|started|closed|hit|reached|tried|tested)\s+/i;

function pickTopicWord(bullets) {
  if (!bullets.length) return "this";
  const first = bullets[0].replace(LEADING_VERBS, "");
  const words = first.split(/\s+/).slice(0, 6).join(" ");
  return words.toLowerCase() || bullets[0];
}

function templateDraft(pillar, bullets) {
  const topic = pickTopicWord(bullets);
  const hook = pillar.hooks[Math.floor(Math.random() * pillar.hooks.length)].replace(
    "{topic}",
    topic
  );
  const cta = pillar.ctas[Math.floor(Math.random() * pillar.ctas.length)];
  const body = bullets.map((b) => `${b}`).join("\n\n");
  return [hook, "", body, "", cta].join("\n");
}

async function claudeDraft(pillar, bullets) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  let Anthropic;
  try {
    Anthropic = require("@anthropic-ai/sdk");
  } catch {
    return null;
  }
  const client = new Anthropic();
  const prompt = [
    `You write LinkedIn posts for a founder in the voice/pillar "${pillar.name}": ${pillar.description}`,
    "Use ONLY the real facts below. Do not invent numbers, results, or claims that aren't in the notes.",
    "Structure loosely as: " + pillar.structure.join(" -> "),
    "Keep it under 200 words, no hashtags, no emojis, first person, plain and specific.",
    "",
    "Real notes for this post:",
    bullets.map((b) => `- ${b}`).join("\n"),
  ].join("\n");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });
  const text = msg.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  return text || null;
}

async function generateDraft(pillar, bullets) {
  const fromClaude = await claudeDraft(pillar, bullets).catch(() => null);
  return fromClaude || templateDraft(pillar, bullets);
}

module.exports = {
  ROOT,
  CONFIG_DIR,
  CONTENT_DIR,
  NOTES_DIR,
  DRAFTS_DIR,
  POSTED_DIR,
  CALENDAR_PATH,
  WEEKDAYS,
  loadJSON,
  saveJSON,
  loadPillars,
  loadSchedule,
  loadCalendar,
  saveCalendar,
  nextPostingDates,
  slotId,
  notesPath,
  draftPath,
  postedPath,
  scaffoldNotesFile,
  notesAreFilledIn,
  readNotesBullets,
  generateDraft,
};
