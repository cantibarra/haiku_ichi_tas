# Haiku Ichi Tasu — Poem Generator

A web app that generates **haiku ichi tasu** ("haiku and one") poems with the
Claude API. A haiku ichi tasu is a haiku with one extra syllable per line —
a **6·8·6** pattern — and this app repeats that triplet as many times as you
ask for while keeping one coherent theme and through-line across the whole poem.

## How it works

- **Frontend** (`index.html`) — a single static page: a theme field, a
  triplet-count field, a rhyme toggle, and Compose / Copy buttons.
- **Backend** (`server.js`) — a small Express server that holds your
  `ANTHROPIC_API_KEY`, prompts Claude for the poem, and returns it as JSON. The
  key never reaches the browser.

The server asks Claude (via the official `@anthropic-ai/sdk`) for a poem in the
6·8·6 form using **structured outputs**, so the response is always valid JSON
the page can render. Adaptive thinking is enabled to help the model count
syllables accurately.

## Setup

Requires Node.js 18+.

```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # or copy .env.example to .env
npm start
```

Then open http://localhost:3000.

Set `PORT` to change the port. `.env.example` lists the environment variables.

## Inputs

- **Theme** — free text (e.g. *the quiet sea*, *winter*, *love*, *midnight*).
  The whole poem develops this one theme in sequence, rather than producing
  unrelated haiku that merely share a topic.
- **Number of triplets** — how many 6·8·6 stanzas to generate (1–20).
- **Rhyme** — a toggle. When on, lines 1 and 3 of each triplet (the two
  6-syllable lines) rhyme.

Press **Compose** to generate, **Copy** to put the poem on your clipboard.

## Notes

- The API key is read from the environment on the server side and is never
  exposed to the client. Don't commit `.env` (it's gitignored).
- Model: `claude-opus-4-8`. Change it in `server.js` if you prefer another
  Claude model.
