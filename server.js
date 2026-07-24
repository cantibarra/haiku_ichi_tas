import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// The SDK reads ANTHROPIC_API_KEY from the environment. Don't hardcode a key.
const client = new Anthropic();

// Structured-output schema: a titled poem made of 6-8-6 triplets.
const POEM_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    triplets: {
      type: "array",
      items: {
        type: "object",
        properties: {
          lines: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["lines"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "triplets"],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `You are a poet who writes in the "haiku ichi tasu" form.

"Haiku ichi tasu" means "haiku and one": it is a haiku with exactly one extra
syllable on every line, giving each triplet a strict 6-8-6 syllable pattern
(line 1 = 6 syllables, line 2 = 8 syllables, line 3 = 6 syllables).

Rules you MUST follow:
- Count syllables carefully. Every triplet is exactly 6, 8, 6 syllables.
- The poem is a single coherent work: one consistent theme, imagery, mood, and
  through-line developing across ALL triplets in sequence — not a set of
  unrelated haiku that merely share a topic. Later triplets should build on,
  deepen, or turn from earlier ones.
- Write evocative, concrete, image-driven poetry. Avoid cliché.
- When rhyme is requested, lines 1 and 3 of each triplet (the two 6-syllable
  lines) must rhyme with each other. Line 2 is free.
- Do not add commentary. Return only the poem via the structured format.`;

app.post("/api/generate", async (req, res) => {
  const { theme, count, rhyme } = req.body ?? {};

  const cleanTheme = typeof theme === "string" ? theme.trim() : "";
  if (!cleanTheme) {
    return res.status(400).json({ error: "Please provide a theme." });
  }

  let n = Number.parseInt(count, 10);
  if (!Number.isFinite(n) || n < 1) n = 1;
  if (n > 20) n = 20;

  const wantRhyme = Boolean(rhyme);

  const userPrompt = [
    `Theme: ${cleanTheme}`,
    `Number of triplets: ${n}`,
    `Rhyme: ${wantRhyme ? "on — lines 1 and 3 of each triplet rhyme" : "off"}`,
    ``,
    `Write a haiku ichi tasu of exactly ${n} triplet${n === 1 ? "" : "s"} in the 6-8-6 pattern, `,
    `carrying one coherent theme and through-line across all ${n} triplet${n === 1 ? "" : "s"}.`,
  ].join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 8000,
      thinking: { type: "adaptive" }, // helps the model count syllables accurately
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
      output_config: {
        format: { type: "json_schema", schema: POEM_SCHEMA },
      },
    });

    // With structured outputs the first text block is guaranteed valid JSON.
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) {
      return res.status(502).json({ error: "The model returned no poem." });
    }

    const poem = JSON.parse(textBlock.text);
    return res.json({ ...poem, rhyme: wantRhyme });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return res
        .status(500)
        .json({ error: "Server is missing or has an invalid ANTHROPIC_API_KEY." });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res
        .status(429)
        .json({ error: "Rate limited by the Claude API. Please try again shortly." });
    }
    console.error("generate failed:", err);
    return res.status(500).json({ error: "Failed to generate the poem." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Haiku Ichi Tasu running at http://localhost:${PORT}`);
});
