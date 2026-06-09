import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a financial technology industry analyst. Search for and return the 8-10 most significant recent announcements (last 7 days) from FinTech companies AND major traditional financial institutions (banks, asset managers, exchanges, insurers — e.g. Goldman Sachs, JPMorgan, Morgan Stanley, Citi, BlackRock, Visa, Mastercard, etc.) about using AI as part of their strategy, products, or operations.

Return ONLY a JSON array with no preamble or markdown fences. Each item must have:
- company (string)
- category (one of: TradFi, Banking, Payments, Lending, InsurTech, WealthTech, RegTech, Infrastructure) — use "TradFi" for traditional banks and financial institutions
- headline (string, max 15 words)
- summary (string, 2-3 sentences)
- significance (High, Medium, or Low)
- date (e.g. "Jun 9, 2026")
- tags (array of 2-4 short strings)

Return only the JSON array. No other text.`;

const USER_PROMPT =
  "Search for the latest AI strategy announcements from the past 7 days across FinTech companies AND major financial institutions like Goldman Sachs, JPMorgan, Morgan Stanley, Citi, BlackRock, Visa, Mastercard, and others. Return results as a JSON array.";

// Gemini free-tier model with Google Search grounding for live results.
const MODEL = "gemini-2.5-flash";

function parseStories(rawText: string) {
  // Try fenced JSON block first, then bare array
  const fenced = rawText.match(/```json\s*([\s\S]*?)```/);
  const bare = rawText.match(/(\[[\s\S]*\])/);
  const candidate = fenced?.[1] ?? bare?.[1];
  if (!candidate) return null;
  try {
    const parsed = JSON.parse(candidate);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set. Add it to your Vercel environment variables." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: USER_PROMPT }] }],
          // Enable Google Search grounding so the model uses live web results
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4000 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.error?.message ?? "Gemini API error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const textBlocks: string = (data.candidates?.[0]?.content?.parts ?? [])
      .filter((p: { text?: string }) => typeof p.text === "string")
      .map((p: { text: string }) => p.text)
      .join("\n");

    const stories = parseStories(textBlocks);
    if (!stories) {
      return NextResponse.json(
        { error: "Could not parse structured response from Gemini." },
     