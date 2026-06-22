"use client";

import { useEffect, useState } from "react";

export interface PipelineQuote { text: string; tag: string; }

export function QuoteRotator({ quotes, intervalMs = 4500 }: { quotes: PipelineQuote[]; intervalMs?: number; }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setInterval(() => {
      if (reduced) { setIndex((i) => (i + 1) % quotes.length); return; }
      setVisible(false);
      setTimeout(() => { setIndex((i) => (i + 1) % quotes.length); setVisible(true); }, 300);
    }, intervalMs);
    return () => clearInterval(id);
  }, [quotes.length, intervalMs]);

  return (
    <div className="w-full">
      <div className="min-h-[90px]">
        <blockquote className={`font-display text-lg font-medium leading-snug text-inkText/90 transition-all duration-300 ease-out sm:text-xl ${visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}>
          &ldquo;{quotes[index].text}&rdquo;
        </blockquote>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-wide text-accentTeal/80">{quotes[index].tag}</span>
        <div className="flex gap-1.5">
          {quotes.map((_, i) => (
            <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`Quote ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-accentAmber" : "w-1.5 bg-white/10 hover:bg-white/20"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}