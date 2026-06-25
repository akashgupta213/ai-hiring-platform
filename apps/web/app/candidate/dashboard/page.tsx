"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getMyApplications,
  apiFetch,
  getMyResume,
  uploadResume,
  getResumeAIInsight,
  getRecommendedJobs,
} from "@/lib/api-client";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function matchIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("product")) return "analytics";
  if (t.includes("engineer") || t.includes("developer")) return "code";
  if (t.includes("design")) return "brush";
  if (t.includes("data") || t.includes("ml") || t.includes("ai")) return "psychology";
  if (t.includes("security")) return "security";
  if (t.includes("cloud") || t.includes("infra")) return "cloud_done";
  if (t.includes("manager") || t.includes("lead")) return "manage_accounts";
  return "work";
}

function getScoreLabel(score: number) {
  if (score >= 85) return "EXCELLENT";
  if (score >= 70) return "GOOD";
  if (score >= 50) return "FAIR";
  return "NEEDS WORK";
}

// SVG circle circumference for r=70 is 2π×70 ≈ 440
function scoreToOffset(score: number) {
  const circumference = 440;
  return circumference - (score / 100) * circumference;
}

export default function CandidateDashboardPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [resume, setResume] = useState<any>(null);
  const [insight, setInsight] = useState<any>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      getMyApplications(),
      apiFetch<any>("/auth/me"),
      getMyResume().catch(() => null),
      getResumeAIInsight().catch(() => null),
      getRecommendedJobs().catch(() => []),
    ])
      .then(([apps, me, res, ins, jobs]) => {
        setApplications(Array.isArray(apps) ? apps : []);
        setUser(me.user);
        setResume(res);
        setInsight(ins);
        setRecommendedJobs(Array.isArray(jobs) ? jobs : []);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);
    setResumeError(null);
    try {
      // Read file as text (works for .txt; for PDF use pdfjs in production)
      const text = await file.text();
      if (text.length < 50) {
        setResumeError("File appears empty. Please upload a text-based resume (.txt or copy-paste).");
        return;
      }
      const result = await uploadResume(text);
      setResume(result);
      // Refresh insight and recommended jobs
      const [ins, jobs] = await Promise.all([
        getResumeAIInsight().catch(() => null),
        getRecommendedJobs().catch(() => []),
      ]);
      setInsight(ins);
      setRecommendedJobs(Array.isArray(jobs) ? jobs : []);
    } catch (err: any) {
      setResumeError(err?.message ?? "Upload failed");
    } finally {
      setResumeUploading(false);
    }
  }

  const counts = {
    applied: applications.length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    hired: applications.filter((a) => a.status === "hired").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  // Build real activity feed from applications
  const recentActivity = applications
    .slice(0, 5)
    .map((a) => ({
      dot: a.status === "applied" ? "bg-blue-400" : a.status === "shortlisted" ? "bg-emerald-400" : a.status === "hired" ? "bg-green-500" : "bg-red-400",
      text: a.status === "applied"
        ? <span>Applied to <span className="font-bold">{a.job?.title}</span> at {a.job?.company?.name}</span>
        : a.status === "shortlisted"
        ? <span>Shortlisted by <span className="font-bold">{a.job?.company?.name}</span> for {a.job?.title}</span>
        : a.status === "hired"
        ? <span>Hired 🎉 at <span className="font-bold">{a.job?.company?.name}</span></span>
        : <span>Application closed at <span className="font-bold">{a.job?.company?.name}</span></span>,
      time: timeAgo(a.appliedAt),
    }));

  // Subtitle: real counts
  const notifText = counts.shortlisted > 0
    ? `You have ${counts.shortlisted} shortlisted application${counts.shortlisted > 1 ? "s" : ""} this week.`
    : counts.applied > 0
    ? `You have ${counts.applied} active application${counts.applied > 1 ? "s" : ""}. Keep applying!`
    : "Welcome! Start by browsing jobs and uploading your resume.";

  const scoreVal = resume?.score ?? 0;
  const readability = resume?.readability ?? 0;
  const keywordMatch = resume?.keywordMatch ?? 0;
  const scoreLabel = getScoreLabel(scoreVal);

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: "#0F172A", fontFamily: "system-ui, sans-serif" }}>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md"
        className="hidden"
        onChange={handleResumeUpload}
      />

      <main className="flex-1 max-w-[1440px] mx-auto px-margin-safe py-lg w-full">

        {/* Welcome Section */}
        <section className="mb-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
            <div>
              <span className="font-label-caps text-label-caps text-on-secondary-container mb-2 block uppercase">
                Dashboard Overview
              </span>
              <h1 className="font-headline-lg text-headline-lg text-slate-900">
                Welcome back, {loading ? "…" : user?.email?.split("@")[0]}
              </h1>
              <p className="font-body-lg text-body-lg text-slate-500 mt-1">
                {loading ? "Loading your dashboard…" : notifText}
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={resumeUploading}
              className="bg-primary text-on-primary px-md py-3 rounded-lg font-title-md text-[16px] hover:bg-slate-900 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              {resumeUploading ? "Analyzing…" : resume ? "Update Resume" : "Upload Resume"}
            </button>
          </div>
          {resumeError && (
            <div className="mt-2 text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
              {resumeError}
            </div>
          )}
          {resume && (
            <div className="mt-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg">
              ✓ Resume analyzed — {resume.skills.length} skills detected. Score: {resume.score}/100
            </div>
          )}
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-gutter">

          {/* LEFT COLUMN */}
          <div className="col-span-12 lg:col-span-8 space-y-gutter">

            {/* Status Counters — REAL */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
              {[
                { icon: "description", label: "APPLIED", value: counts.applied },
                { icon: "assignment_turned_in", label: "SHORTLISTED", value: counts.shortlisted },
                { icon: "celebration", label: "HIRED", value: counts.hired },
                { icon: "cancel", label: "NOT SELECTED", value: counts.rejected },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-slate-200 shadow-sm p-md rounded-xl hover:border-primary transition-all cursor-default group">
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
                <h2 className="font-display-lg text-headline-lg text-white mb-sm">
                  {resume
                    ? `Your resume has ${resume.skills.length} skills — let AI find your best matches`
                    : "Accelerate your career with AI-driven insights"}
                </h2>
                <p className="font-body-lg text-body-lg text-surface-container-highest mb-md opacity-90">
                  {resume
                    ? `We detected: ${resume.skills.slice(0, 5).join(", ")}${resume.skills.length > 5 ? ` and ${resume.skills.length - 5} more` : ""}. Upload a newer resume to keep matches fresh.`
                    : "Upload your resume to unlock AI-powered job matching, skill gap analysis, and personalized recommendations."}
                </p>
                <div className="flex gap-md">
                  <button
                    onClick={() => router.push("/candidate/jobs")}
                    className="bg-white text-primary px-md py-2 rounded-lg font-title-md text-[14px] hover:bg-slate-100 transition-all"
                  >
                    Browse Jobs
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-white/30 text-white px-md py-2 rounded-lg font-title-md text-[14px] hover:bg-white/10 transition-all"
                  >
                    {resume ? "Update Resume" : "Upload Resume"}
                  </button>
                </div>
              </div>
              <div className="absolute right-[-40px] bottom-[-40px] opacity-10">
                <span className="material-symbols-outlined text-[300px]">auto_awesome</span>
              </div>
            </div>

            {/* Recommended Jobs — REAL from DB */}
            <div>
              <div className="flex justify-between items-center mb-md">
                <h3 className="font-title-md text-title-md text-slate-900">
                  {resume ? "Matched for your skills" : "Latest open jobs"}
                </h3>
                <a className="text-primary font-label-caps text-label-caps border-b border-primary" href="/candidate/jobs">VIEW ALL JOBS</a>
              </div>

              {loading ? (
                <div className="space-y-sm">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-slate-100 animate-pulse h-20 rounded-xl" />
                  ))}
                </div>
              ) : recommendedJobs.length === 0 ? (
                <div className="bg-white border border-slate-200 shadow-sm p-md rounded-xl text-center text-slate-500 font-body-sm">
                  No open jobs yet. Check back soon or{" "}
                  <a href="/candidate/jobs" className="text-primary underline">browse all jobs</a>.
                </div>
              ) : (
                <div className="space-y-sm">
                  {recommendedJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => router.push("/candidate/jobs")}
                      className="bg-white border border-slate-200 shadow-sm p-md rounded-xl hover:border-primary transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-md group cursor-pointer"
                    >
                      <div className="flex items-center gap-md">
                        <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">{matchIcon(job.title)}</span>
                        </div>
                        <div>
                          <h4 className="font-title-md text-[18px] text-slate-900 group-hover:underline">{job.title}</h4>
                          <p className="font-body-sm text-body-sm text-slate-500">
                            {job.company?.name ?? "Company"} • {job.company?.industry ?? "Tech"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-xs">
                        {(job.skillsRequired ?? []).slice(0, 2).map((t: string) => (
                          <span key={t} className="bg-surface-container text-on-secondary-container px-3 py-1 rounded-full font-label-caps text-[10px]">{t}</span>
                        ))}
                        {job.matchScore > 0 && (
                          <span className="bg-yellow-50 text-yellow-800 border border-yellow-100 px-3 py-1 rounded-full font-label-caps text-[10px] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            {job.matchScore}% MATCH
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-12 lg:col-span-4 space-y-gutter">

            {/* Resume Score — REAL */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-md overflow-hidden relative group">
              <div className="flex justify-between items-center mb-md">
                <h3 className="font-title-md text-title-md text-slate-900">Resume Score</h3>
                <span className="material-symbols-outlined text-primary cursor-pointer hover:rotate-45 transition-transform">info</span>
              </div>

              {!resume && !loading ? (
                <div className="text-center py-md">
                  <span className="material-symbols-outlined text-slate-300 text-[60px]">description</span>
                  <p className="font-body-sm text-slate-400 mt-2">Upload your resume to see your score</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-md py-2 bg-primary text-white text-sm rounded-lg hover:opacity-90 transition-all"
                  >
                    Upload Now
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center py-sm">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                        <circle className="text-surface-container" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12" />
                        <circle
                          className="text-primary transition-all duration-1000 ease-out"
                          cx="80" cy="80" fill="transparent" r="70"
                          stroke="currentColor"
                          strokeDasharray="440"
                          strokeDashoffset={loading ? 440 : scoreToOffset(scoreVal)}
                          strokeWidth="12"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-display-lg text-[42px] leading-none">{loading ? "—" : scoreVal}</span>
                        <span className="font-label-caps text-label-caps text-on-secondary-container">{loading ? "" : scoreLabel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-md space-y-sm">
                    {[{ label: "Readability", v: readability }, { label: "Keyword Match", v: keywordMatch }].map((r) => (
                      <div key={r.label}>
                        <div className="flex items-center justify-between text-body-sm font-body-sm">
                          <span className="text-slate-500">{r.label}</span>
                          <span className="text-slate-900 font-bold">{loading ? "—" : `${r.v}%`}</span>
                        </div>
                        <div className="w-full bg-surface-container h-1 rounded-full mt-1">
                          <div className="bg-primary h-1 rounded-full transition-all duration-700" style={{ width: loading ? "0%" : `${r.v}%` }} />
                        </div>
                      </div>
                    ))}
                    {resume?.skills?.length > 0 && (
                      <div className="pt-sm border-t border-slate-100">
                        <span className="font-label-caps text-[10px] text-slate-400 uppercase block mb-1">Detected Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {resume.skills.slice(0, 6).map((s: string) => (
                            <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">{s}</span>
                          ))}
                          {resume.skills.length > 6 && (
                            <span className="px-2 py-0.5 text-slate-400 text-[10px]">+{resume.skills.length - 6} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mt-md border border-slate-200 bg-white shadow-sm py-2 rounded-lg font-label-caps text-label-caps text-primary hover:bg-surface-container transition-all"
                  >
                    {resume ? "UPDATE RESUME" : "VIEW FULL ANALYSIS"}
                  </button>
                </>
              )}
            </div>

            {/* AI Insight — REAL from skill gap analysis */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-md">
              <div className="flex items-center gap-2 mb-sm">
                <span className="material-symbols-outlined text-yellow-600" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="font-title-md text-title-md text-slate-900">AI Insight</h3>
              </div>
              <p className="font-body-sm text-body-sm text-slate-900 leading-relaxed mb-md">
                {loading
                  ? "Analyzing your profile…"
                  : insight?.insight
                  ? insight.insight.replace(/\*\*(.*?)\*\*/g, "$1") // strip markdown bold for plain render
                  : "Upload your resume to get personalized AI insights."}
              </p>
              {insight?.missingSkill && (
                <>
                  <p className="font-body-sm text-body-sm text-slate-900 leading-relaxed mb-md">
                    We noticed you may benefit from adding{" "}
                    <span className="font-bold underline decoration-yellow-500">{insight.missingSkill}</span>{" "}
                    which appears in {insight.trendingPercent}% of open job descriptions right now.
                  </p>
                  <div className="bg-surface-container p-sm rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-primary">school</span>
                      <span className="font-body-sm text-body-sm font-bold">Learn {insight.missingSkill}</span>
                    </div>
                    <span className="material-symbols-outlined text-primary cursor-pointer">arrow_forward</span>
                  </div>
                </>
              )}
            </div>

            {/* Activity Feed — REAL from applications */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-md">
              <h3 className="font-title-md text-title-md text-slate-900 mb-md">Recent Activity</h3>
              {loading ? (
                <div className="space-y-md">
                  {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-slate-100 animate-pulse rounded" />)}
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="font-body-sm text-slate-400 text-center py-md">
                  No activity yet. Apply to jobs to see your history here.
                </p>
              ) : (
                <div className="space-y-md">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="flex gap-sm">
                      <div className={`w-2 h-2 rounded-full ${a.dot} mt-2 flex-shrink-0`} />
                      <div>
                        <p className="font-body-sm text-body-sm text-slate-900">{a.text}</p>
                        <span className="text-[12px] text-slate-500">{a.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}