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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set. Add it to your Vercel environment variables." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: USER_PROMPT }],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err?.error?.message ?? "Anthropic API error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const textBlocks: string = (data.content ?? [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n");

    const stories = parseStories(textBlocks);
    if (!stories) {
      return NextResponse.json(
        { error: "Could not parse structured response from Claude." },
        { status: 502 }
      );
    }

    return NextResponse.json({ stories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
