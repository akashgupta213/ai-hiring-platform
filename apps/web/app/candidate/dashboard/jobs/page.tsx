"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getJobs, applyToJob, getMyApplications } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/badge";
import { SkillTag } from "@/components/ui/skill-tag";
import { Spinner } from "@/components/ui/spinner";
import { Search, MapPin, Briefcase, CheckCircle2 } from "lucide-react";

export default function CandidateJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  async function loadJobs(q?: string, p = 1) {
    setLoading(true);
    try {
      const res = await getJobs({ search: q, page: p, limit: 12 });
      setJobs(res.data ?? []);
      setTotalPages(res.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }

  async function loadApplied() {
    try {
      const apps = await getMyApplications();
      setAppliedIds(new Set(apps.map((a: any) => a.job.id)));
    } catch {}
  }

  useEffect(() => {
    loadJobs();
    loadApplied();
  }, []);

  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      loadJobs(val, 1);
    }, 400);
  }

  async function handleApply(jobId: string) {
    setApplyingId(jobId);
    try {
      await applyToJob(jobId);
      setAppliedIds((prev) => new Set([...prev, jobId]));
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-inkBg text-inkText">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-inkLine bg-inkBg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accentAmber font-display text-xs font-bold text-inkBg">
              AI
            </div>
            <span className="font-mono text-sm font-medium tracking-wide text-inkMuted">
              Job Board
            </span>
          </div>
          <button
            onClick={() => router.push("/candidate/dashboard")}
            className="rounded-lg border border-inkLine px-3 py-1.5 font-mono text-xs text-inkMuted transition-colors hover:border-accentTeal hover:text-accentTeal"
          >
            My Applications
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Search */}
        <div className="relative mb-8">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inkMuted" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search jobs, skills, companies…"
            className="w-full rounded-xl border border-inkLine bg-inkElevated py-3 pl-10 pr-4 text-sm text-inkText outline-none transition-colors placeholder:text-inkMuted/50 focus:border-accentTeal focus:ring-2 focus:ring-accentTeal/20"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="h-8 w-8 text-accentAmber" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <Briefcase size={36} className="text-inkMuted/40" />
            <p className="text-inkMuted">No open jobs match your search.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => {
                const applied = appliedIds.has(job.id);
                return (
                  <div
                    key={job.id}
                    className="flex flex-col rounded-xl border border-inkLine bg-inkElevated p-5 transition-colors hover:border-inkLine/60 hover:bg-white/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-display text-sm font-semibold text-inkText">
                          {job.title}
                        </h3>
                        <p className="mt-0.5 font-mono text-[11px] text-inkMuted">
                          {job.company?.name}
                          {job.company?.industry && ` · ${job.company.industry}`}
                        </p>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>

                    <p className="mt-3 flex-1 line-clamp-3 text-sm leading-relaxed text-inkMuted">
                      {job.description}
                    </p>

                    {job.skillsRequired?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.skillsRequired.slice(0, 4).map((s: string) => (
                          <SkillTag key={s} skill={s} />
                        ))}
                        {job.skillsRequired.length > 4 && (
                          <span className="rounded-md border border-inkLine px-2 py-0.5 font-mono text-[10px] text-inkMuted/60">
                            +{job.skillsRequired.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-inkLine">
                      {applied ? (
                        <div className="flex items-center gap-2 justify-center font-mono text-xs text-accentTeal">
                          <CheckCircle2 size={14} />
                          Applied
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(job.id)}
                          disabled={applyingId === job.id}
                          className="w-full rounded-lg bg-accentAmber py-2 text-sm font-semibold text-inkBg transition-transform hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
                        >
                          {applyingId === job.id ? "Applying…" : "Apply Now"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  disabled={page === 1}
                  onClick={() => { setPage(page - 1); loadJobs(search, page - 1); }}
                  className="rounded-lg border border-inkLine px-4 py-2 font-mono text-xs text-inkMuted transition-colors hover:border-accentTeal hover:text-accentTeal disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="font-mono text-xs text-inkMuted">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => { setPage(page + 1); loadJobs(search, page + 1); }}
                  className="rounded-lg border border-inkLine px-4 py-2 font-mono text-xs text-inkMuted transition-colors hover:border-accentTeal hover:text-accentTeal disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}