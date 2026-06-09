"use client";

import { useState } from "react";

const CATEGORIES = [
  "All",
  "TradFi",
  "Banking",
  "Payments",
  "Lending",
  "InsurTech",
  "WealthTech",
  "RegTech",
  "Infrastructure",
];

type Significance = "High" | "Medium" | "Low";

interface Story {
  company: string;
  category: string;
  headline: string;
  summary: string;
  significance: Significance;
  date: string;
  tags: string[];
}

const SAMPLE_STORIES: Story[] = [
  {
    company: "Goldman Sachs",
    category: "TradFi",
    headline: "Goldman Sachs embeds AI copilot across its global trading desks",
    summary:
      "Goldman Sachs announced a firm-wide rollout of an AI-powered trading assistant built on internal LLMs, giving traders real-time market analysis, risk summaries, and execution recommendations. The initiative is part of Goldman's broader $500M AI infrastructure investment.",
    significance: "High",
    date: "Jun 6, 2026",
    tags: ["Trading AI", "LLM", "Capital Markets"],
  },
  {
    company: "Stripe",
    category: "Payments",
    headline: "Stripe deploys LLM-based fraud detection across 200+ markets",
    summary:
      "Stripe announced a new AI-native fraud prevention layer that uses large language models to analyze transaction context in real time, reducing false positives by 40% while catching sophisticated fraud rings.",
    significance: "High",
    date: "Jun 6, 2026",
    tags: ["Fraud Detection", "LLM", "Payments Infrastructure"],
  },
  {
    company: "JPMorgan Chase",
    category: "TradFi",
    headline: "JPMorgan expands IndexGPT to institutional clients globally",
    summary:
      "Following its internal success, JPMorgan is rolling out its AI-powered investment thematic index service to institutional clients worldwide, marking a major step in AI-driven financial product creation.",
    significance: "High",
    date: "Jun 5, 2026",
    tags: ["Investment AI", "Institutional", "Global Expansion"],
  },
  {
    company: "Plaid",
    category: "Infrastructure",
    headline: "Plaid introduces AI-powered data enrichment pipeline for open banking",
    summary:
      "Plaid's new enrichment layer uses machine learning to categorize and contextualize transaction data with 98% accuracy, enabling downstream FinTech apps to deliver richer personal finance insights.",
    significance: "Medium",
    date: "Jun 4, 2026",
    tags: ["Open Banking", "Data Enrichment", "ML"],
  },
];

function SignificanceBadge({ level }: { level: Significance }) {
  const styles: Record<Significance, string> = {
    High: "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50",
    Medium: "bg-amber-900/60 text-amber-300 border border-amber-700/50",
    Low: "bg-slate-800 text-slate-400 border border-slate-600/50",
  };
  return (
    <span
      className={`text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded ${styles[level]}`}
    >
      {level}
    </span>
  );
}

function StoryCard({ story }: { story: Story }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="group border border-slate-700/60 rounded-lg p-5 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer bg-slate-900/50 hover:bg-slate-900/80"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
            {story.category}
          </span>
          <SignificanceBadge level={story.significance} />
        </div>
        <span className="text-xs text-slate-500 whitespace-nowrap font-mono">{story.date}</span>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-cyan-300 font-bold text-sm">{story.company}</span>
        <span className="text-slate-500 text-xs">—</span>
      </div>

      <h3 className="text-slate-100 font-semibold text-[15px] leading-snug mb-3 group-hover:text-white transition-colors">
        {story.headline}
      </h3>

      {expanded && (
        <p className="text-slate-400 text-sm leading-relaxed mb-3 border-t border-slate-700/40 pt-3">
          {story.summary}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mt-2">
        {story.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] text-slate-500 bg-slate-800/60 border border-slate-700/40 px-2 py-0.5 rounded font-mono"
          >
            #{tag.replace(/\s+/g, "")}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [stories, setStories] = useState<Story[]>(SAMPLE_STORIES);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState(
    "Sample data — click Refresh to fetch live news"
  );
  const [progress, setProgress] = useState("");

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    setProgress("Searching for latest FinTech & Finance AI announcements...");

    try {
      const res = await fetch("/api/news");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "API error");

      setProgress("Parsing results...");
      setStories(data.stories);
      const now = new Date();
      setLastRefreshed(
        `Last refreshed ${now.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStories(SAMPLE_STORIES);
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const filtered =
    activeCategory === "All"
      ? stories
      : stories.filter((s) => s.category === activeCategory);

  const highCount = stories.filter((s) => s.significance === "High").length;
  const categoryCount = new Set(stories.map((s) => s.category)).size;

  return (
    <main
      style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif" }}
      className="min-h-screen bg-[#080c14] text-slate-100 px-4 py-8 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono text-cyan-400 tracking-widest uppercase">
            Weekly Intelligence
          </span>
        </div>
        <h1
          style={{ letterSpacing: "-0.03em" }}
          className="text-3xl font-black text-white mb-1"
        >
          FinTech <span className="text-cyan-400">× AI</span> Digest
        </h1>
        <p className="text-slate-500 text-sm">
          AI strategy announcements across FinTech and traditional financial institutions
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Stories", value: stories.length },
          { label: "High Signal", value: highCount },
          { label: "Categories", value: categoryCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 text-center"
          >
            <div className="text-2xl font-black text-cyan-300 tabular-nums">{stat.value}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 font-mono">{lastRefreshed}</span>
          <button
            onClick={fetchNews}
            disabled={loading}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold text-xs px-4 py-2 rounded-lg transition-all duration-200"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Fetching...
              </>
            ) : (
              <>↻ Refresh News</>
            )}
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[11px] font-mono px-3 py-1 rounded-md border transition-all duration-150 ${
                activeCategory === cat
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                  : "bg-transparent border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <div className="text-xs text-cyan-400 font-mono mb-4 animate-pulse">{progress}</div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-950/40 border border-red-800/40 text-red-400 text-xs rounded-lg px-4 py-3 mb-4 font-mono">
          {error}
        </div>
      )}

      {/* Stories */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center text-slate-600 py-12 font-mono text-sm">
            No stories in this category yet.
          </div>
        ) : (
          filtered.map((story, i) => <StoryCard key={i} story={story} />)
        )}
      </div>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-slate-800 text-center text-[11px] text-slate-600 font-mono">
        Powered by Claude + Web Search · Click any card to expand · Filter by category above
      </div>
    </main>
  );
}
