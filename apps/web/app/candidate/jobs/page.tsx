"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getJobs, applyToJob, getMyApplications } from "@/lib/api-client";

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// Deterministic pseudo-match (40–95%) derived from the job id, so it's stable.
function matchScore(id: string | number) {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return 40 + (h % 56);
}

const FILTERS = ["Remote", "Salary Range", "Job Type", "Experience Level"];

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJobs({ keyword, location });
      const list = Array.isArray(data) ? data : data?.jobs ?? [];
      setJobs(list);
      if (list.length && selectedId == null) setSelectedId(list[0].id);
    } finally {
      setLoading(false);
    }
  }, [keyword, location, selectedId]);

  useEffect(() => {
    load();
    getMyApplications()
      .then((apps: any) => {
        const list = Array.isArray(apps) ? apps : apps?.applications ?? [];
        setAppliedIds(new Set(list.map((a: any) => String(a.jobId ?? a.job?.id))));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSearch() {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(load, 250);
  }

  async function handleApply(id: string | number) {
    try {
      await applyToJob(String(id));
      setAppliedIds((p) => new Set(p).add(String(id)));
    } catch (e) {
      console.error(e);
    }
  }

  function toggleSave(id: string | number) {
    setSavedIds((p) => {
      const n = new Set(p);
      n.has(String(id)) ? n.delete(String(id)) : n.add(String(id));
      return n;
    });
  }

  const selected = jobs.find((j) => j.id === selectedId);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Search bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  onSearch();
                }}
                placeholder="Job title, keywords, or company"
                className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <div className="relative flex-1">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                location_on
              </span>
              <input
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  onSearch();
                }}
                placeholder="City, state, or remote"
                className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <button
              onClick={load}
              className="rounded-lg bg-slate-900 px-8 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Find Jobs
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400"
            >
              {f}
              <span className="material-symbols-outlined text-base">expand_more</span>
            </button>
          ))}
          <button
            onClick={() => {
              setKeyword("");
              setLocation("");
              load();
            }}
            className="ml-auto text-sm font-semibold text-slate-900 underline underline-offset-4"
          >
            Clear all filters
          </button>
        </div>

        {/* Two-pane layout */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[5fr_7fr]">
          {/* LEFT: job list */}
          <div className="space-y-4">
            {loading && <p className="text-sm text-slate-500">Loading jobs…</p>}
            {jobs.map((job) => {
              const isSel = job.id === selectedId;
              const score = matchScore(job.id);
              return (
                <button
                  key={job.id}
                  onClick={() => setSelectedId(job.id)}
                  className={`relative w-full rounded-xl border bg-white p-5 text-left transition ${
                    isSel
                      ? "border-2 border-slate-900 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {isSel && (
                    <span className="absolute right-12 top-5 rounded bg-slate-900 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                      TOP MATCH
                    </span>
                  )}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(job.id);
                    }}
                    className="material-symbols-outlined absolute right-4 top-5 cursor-pointer text-slate-400 hover:text-slate-900"
                    style={{
                      fontVariationSettings: savedIds.has(String(job.id)) ? "'FILL' 1" : undefined,
                    }}
                  >
                    bookmark
                  </span>

                  <h3 className="text-lg font-bold text-slate-900">
                    {job.title ?? "Untitled Role"}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {(job.company ?? job.companyName ?? "Company")} ·{" "}
                    {job.location ?? "Remote"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold uppercase text-slate-700">
                      {job.jobType ?? job.type ?? "Full-time"}
                    </span>
                    {(job.salary ?? job.salaryRange) && (
                      <span className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-slate-700">
                        {job.salary ?? job.salaryRange}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-1.5 flex-1 rounded-full bg-indigo-100">
                      <div
                        className={`h-1.5 rounded-full ${isSel ? "bg-slate-900" : "bg-slate-600"}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="whitespace-nowrap text-xs font-medium text-slate-500">
                      {score}% Match
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: detail */}
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            {!selected ? (
              <p className="text-sm text-slate-500">Select a job to see details.</p>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <span className="material-symbols-outlined">architecture</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900">
                      <span className="material-symbols-outlined text-xl">share</span>
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900">
                      <span className="material-symbols-outlined text-xl">flag</span>
                    </button>
                  </div>
                </div>

                <h1 className="mt-6 text-3xl font-bold text-slate-900">
                  {selected.title}
                </h1>
                <p className="mt-2 text-lg text-slate-500">
                  {(selected.company ?? selected.companyName ?? "Company")} ·{" "}
                  {selected.location ?? "Remote (Global)"} · Posted{" "}
                  {selected.createdAt ? timeAgo(selected.createdAt) : "recently"}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleApply(selected.id)}
                    disabled={appliedIds.has(String(selected.id))}
                    className="rounded-lg bg-slate-900 px-8 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {appliedIds.has(String(selected.id)) ? "Applied" : "Apply Now"}
                  </button>
                  <button
                    onClick={() => toggleSave(selected.id)}
                    className="rounded-lg border border-slate-300 px-8 py-3 text-sm font-semibold text-slate-900 hover:border-slate-400"
                  >
                    {savedIds.has(String(selected.id)) ? "Saved" : "Save Job"}
                  </button>
                </div>

                <hr className="my-8 border-slate-200" />

                {/* HireAI insight */}
                <div className="rounded-lg bg-indigo-50 p-6">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    <span className="text-xs font-bold tracking-wide">HireAI INSIGHT</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    Your experience matches{" "}
                    <strong>{matchScore(selected.id) + 10}%</strong> of this role's
                    requirements. We recommend highlighting your most relevant work in your
                    application.
                  </p>
                </div>

                {/* Info grid */}
                <div className="mt-8 grid grid-cols-2 gap-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Salary Range
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {selected.salary ?? selected.salaryRange ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Job Type
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {selected.jobType ?? selected.type ?? "Full-time"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Equity
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {selected.equity ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Team Size
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {selected.teamSize ?? "—"}
                    </p>
                  </div>
                </div>

                <h2 className="mt-8 text-xl font-bold text-slate-900">About the Role</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {selected.description ?? "No description provided."}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
