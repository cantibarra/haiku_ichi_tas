# Haiku Ichi Tasu — Poem Generator

A single-page web app that generates **haiku ichi tasu** ("haiku and one") poems.
A haiku ichi tasu is a haiku with one extra syllable per line, giving a
**6·8·6** syllabic pattern, and this app repeats that triplet as many times as
you ask for while keeping one coherent theme throughout.

## Use it

Open `index.html` in any browser. No build step, no server, no dependencies.

## Inputs

- **Theme** — free text (e.g. *the quiet sea*, *winter*, *love*, *midnight*).
  The words steer which themed vocabulary the poem is built from, so every
  triplet stays on one subject.
- **Number of triplets** — how many 6·8·6 stanzas to generate (1–20).
- **Rhyme** — a toggle. When on, lines 1 and 3 of each triplet (the two
  6-syllable lines) end on a shared rhyme.

Press **Compose** to generate, **Copy** to put the poem on your clipboard.

## How it works

Every word in the themed vocabulary is pre-tagged with its exact syllable
count. Grammatical line templates (sequences of parts of speech) are filled by
a small backtracking search that assembles words summing to exactly 6 or 8
syllables, so the meter is always correct. A few "anchor" nouns are weighted up
per poem to hold the theme together across stanzas. In rhyme mode, the ending
words of lines 1 and 3 are constrained to share a spelling-based rhyme key.

Themes recognized from your input: sea, love, night, winter, and a default
nature vocabulary.
