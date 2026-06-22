"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@ai-hiring/shared-types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
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

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const dotsRef = useRef<GlowingDotsHandle>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "candidate" },
  });

  const role = watch("role");

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    try {
      const { user } = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(values),
      });
      router.push(user.role === "company" ? "/company/dashboard" : "/candidate/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
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
            Join the smarter
            <br />
            way to{" "}
            <span className="bg-gradient-to-r from-accentAmber to-accentTeal bg-clip-text text-transparent">
              <RotatingWord words={["hire.", "get hired.", "find fit."]} />
            </span>
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-inkMuted">
            Set up in under a minute. No credit card required. Whether you're hiring or job-seeking, one platform handles it all.
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
            Create your account.
          </h2>
          <p className="mt-2 animate-fade-up text-sm text-slate-500 [animation-delay:60ms]">
            Set up in under a minute — no credit card required.
          </p>

          {/* Candidate / Company toggle */}
          <div className="mt-6 animate-fade-up grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1 [animation-delay:100ms]">
            {(["candidate", "company"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setValue("role", r, { shouldValidate: true })}
                className={cn(
                  "rounded-md py-2 text-sm font-medium capitalize transition-all duration-200",
                  role === r ? "bg-inkBg text-white shadow-sm" : "text-slate-400 hover:text-slate-700"
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4 animate-fade-up [animation-delay:140ms]" noValidate>
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
              <label htmlFor="password" className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-slate-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-accentTeal focus:ring-2 focus:ring-accentTeal/20"
                {...register("password")}
              />
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {role === "company" && (
              <div className="animate-fade-up">
                <label htmlFor="companyName" className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-slate-400">
                  Company name
                </label>
                <input
                  id="companyName"
                  placeholder="Acme Inc."
                  autoComplete="organization"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-accentTeal focus:ring-2 focus:ring-accentTeal/20"
                  {...register("companyName")}
                />
                {errors.companyName && <p className="mt-1.5 text-xs text-red-500">{errors.companyName.message}</p>}
              </div>
            )}

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
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 animate-fade-up text-center text-sm text-slate-400 [animation-delay:200ms]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-inkBg hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}