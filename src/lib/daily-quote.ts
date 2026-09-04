import "server-only";

import type { DailyQuote } from "@/lib/types";

type ZenQuote = {
  q?: unknown;
  a?: unknown;
};

const FALLBACK_QUOTES: Omit<DailyQuote, "source">[] = [
  {
    text: "A gentle answer turns away wrath.",
    author: "Proverbs 15:1",
  },
  {
    text: "The best among you are those who are best to their families.",
    author: "Jami at-Tirmidhi 3895",
  },
  {
    text: "Hatred does not cease by hatred, but only by love.",
    author: "Dhammapada 5",
  },
  {
    text: "The world stands on three things: justice, truth, and peace.",
    author: "Pirkei Avot 1:18",
  },
  {
    text: "No act of kindness, no matter how small, is ever wasted.",
    author: "Aesop",
  },
  {
    text: "Alone we can do so little; together we can do so much.",
    author: "Helen Keller",
  },
  {
    text: "Peace begins with a smile.",
    author: "Mother Teresa",
  },
];

function fallbackQuote(dateKey: string): DailyQuote {
  const dateNumber = Number(dateKey.replaceAll("-", ""));
  const index = Number.isFinite(dateNumber)
    ? dateNumber % FALLBACK_QUOTES.length
    : 0;

  return { ...FALLBACK_QUOTES[index], source: "fallback" };
}

export async function getDailyQuote(dateKey: string): Promise<DailyQuote> {
  try {
    const response = await fetch("https://zenquotes.io/api/today", {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      return fallbackQuote(dateKey);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return fallbackQuote(dateKey);
    }

    const quote = data[0] as ZenQuote;
    const text = typeof quote.q === "string" ? quote.q.trim() : "";
    const author = typeof quote.a === "string" ? quote.a.trim() : "";

    if (!text || text.length > 500 || !author || author.length > 120) {
      return fallbackQuote(dateKey);
    }

    return { text, author, source: "zenquotes" };
  } catch {
    return fallbackQuote(dateKey);
  }
}
