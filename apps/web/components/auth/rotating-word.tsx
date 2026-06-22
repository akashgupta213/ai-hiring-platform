"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function RotatingWord({
  words,
  intervalMs = 2600,
  className,
}: {
  words: string[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setInterval(() => {
      if (reduced) { setIndex((i) => (i + 1) % words.length); return; }
      setVisible(false);
      setTimeout(() => { setIndex((i) => (i + 1) % words.length); setVisible(true); }, 250);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs]);

  return (
    <span className={cn("inline-block transition-all duration-300 ease-out", visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0", className)}>
      {words[index]}
    </span>
  );
}