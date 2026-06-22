"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyApplications, apiFetch } from "@/lib/api-client";

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  applied:     { label: "Under Review",   dot: "#60a5fa", bg: "rgba(96,165,250,0.08)",  text: "#93c5fd" },
  shortlisted: { label: "Shortlisted 🎉", dot: "#3FD9C7", bg: "rgba(63,217,199,0.08)",  text: "#3FD9C7" },
  rejected:    { label: "Not Selected",   dot: "#f87171", bg: "rgba(248,113,113,0.08)", text: "#fca5a5" },
  hired:       { label: "Hired 🏆",       dot: "#4ade80", bg: "rgba(74,222,128,0.08)",  text: "#86efac" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function CandidateDashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      getMyApplications(),
      apiFetch<any>("/auth/me"),
    ])
      .then(([apps, me]) => {
        setApplications(apps);
        setUser(me.user);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  }

  const counts = {
    applied:     applications.length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    hired:       applications.filter((a) => a.status === "hired").length,
    rejected:    applications.filter((a) => a.status === "rejected").length,
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "ME";

  return (
    <div
  style={{
    minHeight: "100vh",
    background: "#FFFFFF",
    color: "#0F172A",
    fontFamily: "system-ui, sans-serif",
  }}
>

      
      {/* ── Main ────────────────────────────────────────────────────── */}
<main className="flex-1 max-w-[1440px] mx-auto px-margin-safe py-lg w-full">
  {/* Welcome Section */}
  <section className="mb-lg">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
      <div>
        <span className="font-label-caps text-label-caps text-on-secondary-container mb-2 block uppercase">
          Dashboard Overview
        </span>
        <h1 className="font-headline-lg text-headline-lg text-slate-900">
          Welcome back, {user?.email?.split("@")[0]}
        </h1>
        <p className="font-body-lg text-body-lg text-slate-500 mt-1">
          You have 3 new notifications and 2 interview requests this week.
        </p>
      </div>
      <button className="bg-primary text-on-primary px-md py-3 rounded-lg font-title-md text-[16px] hover:bg-slate-900 transition-all flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]">upload_file</span>
        Update Resume
      </button>
    </div>
  </section>

  {/* Main Bento Grid */}
  <div className="grid grid-cols-12 gap-gutter">
    {/* LEFT COLUMN */}
    <div className="col-span-12 lg:col-span-8 space-y-gutter">
      {/* Status Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {[
          { icon: "description", label: "APPLIED", value: counts.applied },
          { icon: "assignment_turned_in", label: "SHORTLISTED", value: counts.shortlisted },
          { icon: "celebration", label: "HIRED", value: counts.hired },
          { icon: "cancel", label: "NOT SELECTED", value: counts.rejected },
        ].map((s) => (
          <div key={s.label} className="bg-white
border
border-slate-200
shadow-sm p-md rounded-xl hover:border-primary transition-all cursor-default group">
            <div className="flex justify-between items-start mb-xs">
              <span className="material-symbols-outlined text-on-secondary-container group-hover:text-primary transition-colors">{s.icon}</span>
              <span className="text-primary font-bold font-title-md">{loading ? "—" : s.value}</span>
            </div>
            <span className="font-label-caps text-label-caps text-on-secondary-container">{s.label}</span>
          </div>
        ))}
      </div>

      {/* AI Discovery Hero Banner */}
      <div className="relative overflow-hidden rounded-xl bg-primary text-on-primary min-h-[300px] flex flex-col justify-center px-lg py-xl">
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 mb-sm">
            <span className="material-symbols-outlined text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <span className="font-label-caps text-label-caps tracking-[0.2em] text-surface-container-highest">HIREAI INTELLIGENCE</span>
          </div>
          <h2 className="font-display-lg text-headline-lg text-white mb-sm">Accelerate your career with AI-driven insights</h2>
          <p className="font-body-lg text-body-lg text-surface-container-highest mb-md opacity-90">
            Our proprietary algorithms analyze 500+ data points to match you with top-tier executive roles before they even hit public boards.
          </p>
          <div className="flex gap-md">
            <button className="bg-white text-primary px-md py-2 rounded-lg font-title-md text-[14px] hover:bg-slate-100 transition-all">Explore Insights</button>
            <button className="border border-white/30 text-white px-md py-2 rounded-lg font-title-md text-[14px] hover:bg-white/10 transition-all">Learn More</button>
          </div>
        </div>
        <div className="absolute right-[-40px] bottom-[-40px] opacity-10">
          <span className="material-symbols-outlined text-[300px]">auto_awesome</span>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div>
        <div className="flex justify-between items-center mb-md">
          <h3 className="font-title-md text-title-md text-slate-900">Recommended for you</h3>
          <a className="text-primary font-label-caps text-label-caps border-b border-primary" href="/candidate/jobs">VIEW ALL JOBS</a>
        </div>
        <div className="space-y-sm">
          {[
            { icon: "analytics", title: "Senior Product Manager", meta: "TechNexus • Remote • $160k - $210k", tags: ["PRODUCT", "STRATEGY"], match: 98 },
            { icon: "cloud_done", title: "Lead Solutions Architect", meta: "Aether Cloud • New York, NY • $190k - $240k", tags: ["AWS", "ENTERPRISE"], match: 92 },
            { icon: "security", title: "VP of Cybersecurity", meta: "SafeGuard Systems • Austin, TX • $250k+", tags: ["SECURITY", "LEADERSHIP"], match: 89 },
          ].map((job) => (
            <div key={job.title} className="bg-white
border
border-slate-200
shadow-sm p-md rounded-xl hover:border-primary transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-md group cursor-pointer">
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">{job.icon}</span>
                </div>
                <div>
                  <h4 className="font-title-md text-[18px] text-slate-900 group-hover:underline">{job.title}</h4>
                  <p className="font-body-sm text-body-sm text-slate-500">{job.meta}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-xs">
                {job.tags.map((t) => (
                  <span key={t} className="bg-surface-container text-on-secondary-container px-3 py-1 rounded-full font-label-caps text-[10px]">{t}</span>
                ))}
                <span className="bg-yellow-50 text-yellow-800 border border-yellow-100 px-3 py-1 rounded-full font-label-caps text-[10px] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  {job.match}% MATCH
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* RIGHT COLUMN */}
    <div className="col-span-12 lg:col-span-4 space-y-gutter">
      {/* Resume Score */}
      <div className="bg-white
border
border-slate-200
shadow-sm rounded-xl p-md overflow-hidden relative group">
        <div className="flex justify-between items-center mb-md">
          <h3 className="font-title-md text-title-md text-slate-900">Resume Score</h3>
          <span className="material-symbols-outlined text-primary cursor-pointer hover:rotate-45 transition-transform">info</span>
        </div>
        <div className="flex flex-col items-center py-sm">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle className="text-surface-container" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12" />
              <circle className="text-primary transition-all duration-1000 ease-out" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset="66" strokeWidth="12" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display-lg text-[42px] leading-none">85</span>
              <span className="font-label-caps text-label-caps text-on-secondary-container">EXCELLENT</span>
            </div>
          </div>
        </div>
        <div className="mt-md space-y-sm">
          {[{ label: "Readability", v: 92 }, { label: "Keyword Match", v: 78 }].map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between text-body-sm font-body-sm">
                <span className="text-slate-500">{r.label}</span>
                <span className="text-slate-900 font-bold">{r.v}%</span>
              </div>
              <div className="w-full bg-surface-container h-1 rounded-full mt-1">
                <div className="bg-primary h-1 rounded-full" style={{ width: `${r.v}%` }} />
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-md border bg-white shadoborder-slate-200w-sm py-2 rounded-lg font-label-caps text-label-caps text-primary hover:bg-surface-container transition-all">
          VIEW FULL ANALYSIS
        </button>
      </div>

      {/* AI Insight */}
      <div className="bg-white
border
border-slate-200
shadow-sm rounded-xl p-md">
        <div className="flex items-center gap-2 mb-sm">
          <span className="material-symbols-outlined text-yellow-600" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <h3 className="font-title-md text-title-md text-slate-900">AI Insight</h3>
        </div>
        <p className="font-body-sm text-body-sm text-slate-900 leading-relaxed mb-md">
          Based on your recent search for &ldquo;Product Director,&rdquo; we noticed you lack a{" "}
          <span className="font-bold underline decoration-yellow-500">Six Sigma certification</span>{" "}
          which is currently trending in 64% of top-paying job descriptions in your region.
        </p>
        <div className="bg-surface-container p-sm rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary">school</span>
            <span className="font-body-sm text-body-sm font-bold">Recommended Course</span>
          </div>
          <span className="material-symbols-outlined text-primary cursor-pointer">arrow_forward</span>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white
border
border-slate-200
shadow-sm rounded-xl p-md">
        <h3 className="font-title-md text-title-md text-slate-900 mb-md">Recent Activity</h3>
        <div className="space-y-md">
          {[
            { dot: "bg-primary", text: <>Application viewed by <span className="font-bold">Horizon Capital</span></>, time: "2 hours ago" },
            { dot: "bg-surface-dim", text: "Profile updated with new skills", time: "Yesterday" },
            { dot: "bg-surface-dim", text: <>New job match for <span className="font-bold">UX Director</span></>, time: "2 days ago" },
          ].map((a, i) => (
            <div key={i} className="flex gap-sm">
              <div className={`w-2 h-2 rounded-full ${a.dot} mt-2 flex-shrink-0`} />
              <div>
                <p className="font-body-sm text-body-sm text-slate-900">{a.text}</p>
                <span className="text-[12px] text-slate-500">{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</main>

    </div>
  );
}