"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJob, getJobApplications, updateApplicationStatus, updateJobStatus } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/badge";
import { SkillTag } from "@/components/ui/skill-tag";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Users, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = ["shortlisted", "rejected", "hired"] as const;

export default function CompanyJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [j, a] = await Promise.all([getJob(id), getJobApplications(id)]);
        setJob(j);
        setApplications(a);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleStatusChange(appId: string, status: string) {
    setUpdatingId(appId);
    try {
      const updated = await updateApplicationStatus(appId, status);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: updated.status } : a))
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleJobToggle() {
    if (!job) return;
    const next = job.status === "open" ? "closed" : "open";
    const updated = await updateJobStatus(job.id, next);
    setJob(updated);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-inkBg">
        <Spinner className="h-8 w-8 text-accentAmber" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-inkBg text-inkMuted">
        Job not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-inkBg text-inkText">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-inkLine bg-inkBg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-3.5">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 rounded-lg p-1.5 text-inkMuted transition-colors hover:bg-white/5 hover:text-inkText"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="flex-1 font-display font-semibold text-inkText truncate">{job.title}</span>
          <StatusBadge status={job.status} />
          <button
            onClick={handleJobToggle}
            className="rounded-lg border border-inkLine px-3 py-1.5 font-mono text-xs text-inkMuted transition-colors hover:border-accentTeal hover:text-accentTeal"
          >
            {job.status === "open" ? "Close Job" : "Reopen"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Job Details */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-inkLine bg-inkElevated p-5">
              <h2 className="font-display text-base font-semibold text-inkText">Job Details</h2>
              <p className="mt-3 text-sm leading-relaxed text-inkMuted">{job.description}</p>

              {job.skillsRequired?.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-inkMuted">
                    Required Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skillsRequired.map((s: string) => (
                      <SkillTag key={s} skill={s} />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 border-t border-inkLine pt-4">
                <div className="flex items-center gap-2 font-mono text-xs text-inkMuted">
                  <Users size={13} />
                  {applications.length} total applicants
                </div>
              </div>
            </div>
          </div>

          {/* Right: Applicants */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 font-display text-base font-semibold text-inkText">
              Applicants
            </h2>

            {applications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-inkLine py-16 text-center">
                <p className="text-inkMuted">No applications yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app: any) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-inkLine bg-inkElevated px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-inkText">
                        {app.candidate?.email}
                      </p>
                      <p className="font-mono text-[11px] text-inkMuted">
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={app.status} />

                      <select
                        value=""
                        disabled={updatingId === app.id}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="rounded-lg border border-inkLine bg-inkBg px-2.5 py-1.5 font-mono text-xs text-inkMuted outline-none transition-colors hover:border-accentTeal focus:border-accentTeal disabled:opacity-50"
                      >
                        <option value="" disabled>Move to…</option>
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}