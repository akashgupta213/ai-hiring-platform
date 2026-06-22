"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@ai-hiring/shared-types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { GlowingDots, type GlowingDotsHandle } from "@/components/auth/glowing-dots";
import { RotatingWord } from "@/components/auth/rotating-word";
import { QuoteRotator } from "@/components/auth/quote-rotator";


interface AuthResponse {
  user: { id: string; email: string; role: "candidate" | "company" };
}

const PIPELINE = ["Resume", "Interview", "Recommendation"];

const QUOTES = [
  { text: "Great hires don't happen by chance. They happen by design.", tag: "01 · Hiring" },
  { text: "Resumes ranked by semantic fit — not keyword overlap.", tag: "02 · Matching" },
  { text: "Every interview transcribed and graded automatically.", tag: "03 · Interviews" },
  { text: "One weighted score instead of a hundred open tabs.", tag: "04 · Decisions" },
];

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const dotsRef = useRef<GlowingDotsHandle>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    try {
      const { user } = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      router.push(user.role === "company" ? "/company/dashboard" : "/candidate/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Invalid email or password");
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden">

      {/* ── LEFT PANEL — 50% dark with glowing dots ── */}
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-inkBg px-12 py-14 text-inkText lg:flex"
        onMouseEnter={() => dotsRef.current?.setActive(true)}
        onMouseLeave={() => dotsRef.current?.setActive(false)}
      >
        {/* Glowing dot grid canvas */}
        <GlowingDots ref={dotsRef} />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-mono text-sm font-medium tracking-wide text-inkMuted">
  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accentAmber font-display text-xs font-bold text-inkBg">
    AI
  </span>
  HiringPlatform
</Link>

        {/* Middle — pipeline pill + headline + tagline */}
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs tracking-wide text-inkMuted">
            {PIPELINE.map((stage, i) => (
              <span key={stage} className="flex items-center gap-2">
                <span className={i === 0 ? "text-accentAmber" : ""}>{stage}</span>
                {i < PIPELINE.length - 1 && <span className="opacity-30">→</span>}
              </span>
            ))}
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight xl:text-5xl">
            Find the right hire,
            <br />
            not just a{" "}
            <span className="bg-gradient-to-r from-accentAmber to-accentTeal bg-clip-text text-transparent">
              <RotatingWord words={["keyword match.", "good resume.", "gut feeling."]} />
            </span>
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-inkMuted">
            Every resume gets embedded and ranked by real semantic fit. Every candidate ends up with one score you can actually trust.
          </p>
        </div>

        {/* Bottom — rotating quotes */}
        <div className="relative z-10 border-t border-white/10 pt-8">
          <QuoteRotator quotes={QUOTES} />
        </div>
      </div>

      {/* ── RIGHT PANEL — 50% plain white ── */}
      <div
        className="flex w-full flex-col items-center justify-center bg-white px-6 py-16 lg:w-1/2"
        onMouseEnter={() => dotsRef.current?.setActive(false)}
      >
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 font-mono text-sm font-medium tracking-wide text-slate-500 lg:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accentAmber font-display text-xs font-bold text-inkBg">AI</span>
            HiringPlatform
          </div>

          <h2 className="animate-fade-up font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome back.
          </h2>
          <p className="mt-2 animate-fade-up text-sm text-slate-500 [animation-delay:60ms]">
            Sign in to pick up your shortlist right where you left it.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 animate-fade-up [animation-delay:120ms]" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-slate-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-accentTeal focus:ring-2 focus:ring-accentTeal/20"
                {...register("email")}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="font-mono text-[11px] uppercase tracking-wide text-slate-400">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-slate-400 transition-colors hover:text-accentTeal">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-accentTeal focus:ring-2 focus:ring-accentTeal/20"
                {...register("password")}
              />
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {serverError && (
              <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-500">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-accentAmber px-4 py-2.5 text-sm font-semibold text-inkBg transition-transform hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 animate-fade-up text-center text-sm text-slate-400 [animation-delay:180ms]">
            New to the platform?{" "}
            <Link href="/register" className="font-medium text-inkBg hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}