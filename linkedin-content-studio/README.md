# LinkedIn Content Studio

A small, standalone content generator + scheduler for posting authentically on
LinkedIn as a builder — about the business you're building and the money
mindset that comes with it.

This is deliberately **not** an auto-poster. It won't touch your LinkedIn
account or post anything on your behalf. LinkedIn restricts automated posting
to apps approved through its Marketing Developer Platform, and — more
importantly — content about building wealth is worth more when it's true.
This tool exists to make it fast to turn what actually happened in your week
into a well-structured post, never to invent results you haven't had yet.

## How it works

1. **`plan`** — lays out your next few weeks of posting slots (which days,
   which content pillar for each) based on `config/schedule.json`, and
   creates a blank notes file per slot under `content/notes/`.
2. **You fill in the notes** — 2-5 honest, specific bullets per slot: what you
   actually built, decided, learned, or won that week. This is the only
   input the generator is allowed to treat as fact.
3. **`generate`** — turns filled-in notes into a draft post under
   `content/drafts/`, using the pillar's hook/structure/CTA templates (see
   `config/pillars.json`). If you set `ANTHROPIC_API_KEY` and install
   `@anthropic-ai/sdk`, it'll ask Claude to polish the draft — but it's told
   explicitly to use only the facts in your notes, nothing invented.
4. **You review and post it yourself** on LinkedIn, editing as you like.
5. **`mark-posted <slot-id>`** — archives the draft and marks it posted in
   the calendar.

## Quick start

```bash
cd linkedin-content-studio
node src/cli.js plan --weeks 2
# edit the files it created under content/notes/
node src/cli.js generate
node src/cli.js list
node src/cli.js mark-posted 2026-08-17-building-in-public
```

No `npm install` is required for the default (template-based) workflow — it
has zero required dependencies. `@anthropic-ai/sdk` is optional.

## Content pillars

Defined in `config/pillars.json`, rotated in `config/schedule.json`:

- **Building in Public** — real progress on what you're building
- **Money & Wealth Mindset** — genuine lessons about money and risk, not claims
- **Lessons Learned** — specific mistakes, told honestly
- **Wins & Milestones** — real, specific wins sized honestly
- **Behind the Scenes** — the unglamorous, ordinary reality of the work

Edit `config/pillars.json` to change hooks, structure, or add your own
pillars. Edit `config/schedule.json` to change posting days or the rotation.

## Extending to Instagram/Facebook or auto-posting

Out of scope for this first version on purpose — those platforms need their
own registered developer apps and review before they'll accept automated
posts, and voice/video "clone" content is a separate build on top of a
voice-cloning or avatar service. If you want either of those next, the
calendar/notes/draft pipeline here is designed to be reused: a `poster`
module could read from `content/drafts/` once you're ready to wire up real
API credentials.
