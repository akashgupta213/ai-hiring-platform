"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyApplications, apiFetch } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/badge";
import { SkillTag } from "@/components/ui/skill-tag";
import { Spinner } from "@/components/ui/spinner";
import { Briefcase, LogOut, ArrowRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  applied: "text-blue-400",
  shortlisted: "text-accentTeal",
  rejected: "text-red-400",
  hired: "text-emerald-400",
};

export default function CandidateDashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then(setApplications)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  }

  const counts = {
    total: applications.length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    hired: applications.filter((a) => a.status === "hired").length,
  };

  return (
    <div className="min-h-screen bg-inkBg text-inkText">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-inkLine bg-inkBg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accentAmber font-display text-xs font-bold text-inkBg">
              AI
            </div>
            <span className="font-mono text-sm font-medium tracking-wide text-inkMuted">
              Candidate Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/candidate/jobs")}
              className="flex items-center gap-2 rounded-lg border border-inkLine px-3 py-1.5 font-mono text-xs text-inkMuted transition-colors hover:border-accentAmber hover:text-accentAmber"
            >
              Browse Jobs <ArrowRight size={12} />
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-inkMuted transition-colors hover:bg-white/5 hover:text-inkText"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-inkLine bg-inkElevated px-5 py-4">
            <p className="font-mono text-[11px] uppercase tracking-wide text-inkMuted">Applied</p>
            <p className="mt-1 font-display text-2xl font-bold text-inkText">{loading ? "—" : counts.total}</p>
          </div>
          <div className="rounded-xl border border-inkLine bg-inkElevated px-5 py-4">
            <p className="font-mono text-[11px] uppercase tracking-wide text-inkMuted">Shortlisted</p>
            <p className="mt-1 font-display text-2xl font-bold text-accentTeal">{loading ? "—" : counts.shortlisted}</p>
          </div>
          <div className="rounded-xl border border-inkLine bg-inkElevated px-5 py-4">
            <p className="font-mono text-[11px] uppercase tracking-wide text-inkMuted">Hired</p>
            <p className="mt-1 font-display text-2xl font-bold text-emerald-400">{loading ? "—" : counts.hired}</p>
          </div>
        </div>

        {/* Applications List */}
        <h2 className="mb-4 font-display text-base font-semibold text-inkText">My Applications</h2>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="h-8 w-8 text-accentAmber" />
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-inkLine py-24 text-center">
            <Briefcase size={36} className="text-inkMuted/40" />
            <div>
              <p className="font-display text-lg font-semibold text-inkText">No applications yet</p>
              <p className="mt-1 text-sm text-inkMuted">Browse open jobs and apply to get started</p>
            </div>
            <button
              onClick={() => router.push("/candidate/jobs")}
              className="mt-2 flex items-center gap-2 rounded-lg bg-accentAmber px-5 py-2.5 text-sm font-semibold text-inkBg transition-transform hover:scale-[1.02]"
            >
              Browse Jobs <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app: any) => (
              <div
                key={app.id}
                className="rounded-xl border border-inkLine bg-inkElevated p-5 transition-colors hover:border-inkLine/60 hover:bg-white/[0.03]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-semibold text-inkText">
                      {app.job?.title}
                    </h3>
                    <p className="mt-0.5 font-mono text-[11px] text-inkMuted">
                      {app.job?.company?.name}
                      {app.job?.company?.industry && ` · ${app.job.company.industry}`}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                {app.job?.skillsRequired?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {app.job.skillsRequired.slice(0, 5).map((s: string) => (
                      <SkillTag key={s} skill={s} />
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-inkLine pt-3">
                  <p className="font-mono text-[11px] text-inkMuted">
                    Applied {new Date(app.appliedAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </p>
                  <span className={`font-mono text-[11px] font-medium ${STATUS_COLORS[app.status]}`}>
                    {app.status === "applied" && "Awaiting review"}
                    {app.status === "shortlisted" && "🎉 You're shortlisted!"}
                    {app.status === "rejected" && "Not selected"}
                    {app.status === "hired" && "🏆 Hired!"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}