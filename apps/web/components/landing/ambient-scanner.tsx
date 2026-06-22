"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const PIPELINE_TAGS = [
  { label: "Resume parsing", top: "12%", left: "8%", delay: "0s" },
  { label: "pgvector match", top: "22%", left: "78%", delay: "1.2s" },
  { label: "Whisper transcript", top: "68%", left: "12%", delay: "2.4s" },
  { label: "GPT-4o grading", top: "78%", left: "70%", delay: "0.6s" },
  { label: "Weighted score", top: "40%", left: "90%", delay: "1.8s" },
  { label: "Semantic fit", top: "55%", left: "3%", delay: "3s" },
];

// The hero's signature element: a cursor-tracked spotlight sweeping over a
// faint field of real pipeline-stage tags — an ambient, literal echo of
// what the product actually does (find signal in noisy candidate data).
export function AmbientScanner() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return; // keep the static default position, skip JS tracking

    let frame = 0;
    function handleMove(e: MouseEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        scene?.style.setProperty("--mx", `${x}%`);
        scene?.style.setProperty("--my", `${y}%`);
      });
    }

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ "--mx": "70%", "--my": "30%" } as CSSProperties}
    >
      {/* faint row grid — standing in for a list of ranked candidates */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 63px, rgba(255,255,255,0.6) 64px)",
        }}
      />

      {/* drifting pipeline-stage tags */}
      {PIPELINE_TAGS.map((tag) => (
        <span
          key={tag.label}
          className="absolute animate-drift rounded-full border border-inkLine px-3 py-1 font-mono text-[11px] tracking-wide text-inkMuted/70"
          style={{ top: tag.top, left: tag.left, animationDelay: tag.delay }}
        >
          {tag.label}
        </span>
      ))}

      {/* the scanner: a soft two-tone glow that follows the cursor */}
      <div
        className="absolute inset-0 transition-[background] duration-300 ease-out"
        style={{
          background:
            "radial-gradient(640px circle at var(--mx) var(--my), rgba(242,184,75,0.16), rgba(63,217,199,0.10) 38%, transparent 62%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}