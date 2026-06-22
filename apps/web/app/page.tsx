import Link from "next/link";
import { AmbientScanner } from "@/components/landing/ambient-scanner";

const PIPELINE = ["Resume", "Interview", "Recommendation"];

const SIGNALS = [
  "Semantic resume matching",
  "AI-graded video interviews",
  "Live, re-ranked shortlist",
  "One weighted hiring score",
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-inkBg text-inkText">
      <AmbientScanner />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-8 flex animate-fade-up items-center gap-2 rounded-full border border-inkLine bg-white/5 px-4 py-1.5 font-mono text-xs tracking-wide text-inkMuted">
          {PIPELINE.map((stage, i) => (
            <span key={stage} className="flex items-center gap-2">
              <span className={i === 0 ? "text-accentAmber" : ""}>{stage}</span>
              {i < PIPELINE.length - 1 && <span className="text-inkLine">→</span>}
            </span>
          ))}
        </div>

        <h1 className="animate-fade-up font-display text-5xl font-bold leading-[1.05] tracking-tight [animation-delay:100ms] sm:text-6xl md:text-7xl">
          Find the right hire,
          <br />
          not just a{" "}
          <span className="bg-gradient-to-r from-accentAmber to-accentTeal bg-clip-text text-transparent">
            keyword match
          </span>
          .
        </h1>

        <p className="mt-6 max-w-xl animate-fade-up text-balance text-lg text-inkMuted [animation-delay:200ms]">
          Every resume gets embedded and ranked by real semantic fit. Every interview gets
          transcribed and graded. Every candidate ends up with one score you can actually trust.
        </p>

        <div className="mt-8 flex animate-fade-up flex-wrap items-center justify-center gap-2 [animation-delay:300ms]">
          {SIGNALS.map((signal) => (
            <span
              key={signal}
              className="rounded-full border border-inkLine bg-inkElevated px-4 py-2 text-sm text-inkMuted"
            >
              {signal}
            </span>
          ))}
        </div>

        <div className="mt-10 flex animate-fade-up flex-col gap-3 sm:flex-row [animation-delay:400ms]">
          <Link
            href="/register"
            className="rounded-md bg-accentAmber px-6 py-3 text-sm font-semibold text-inkBg transition-transform hover:scale-[1.03]"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-inkLine px-6 py-3 text-sm font-semibold text-inkText transition-colors hover:border-accentTeal hover:text-accentTeal"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}