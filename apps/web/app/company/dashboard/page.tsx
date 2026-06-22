"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCompanyJobs } from "@/lib/api-client";
import { CreateJobModal } from "@/components/company/create-job-modal";
import { JobCard } from "@/components/company/job-card";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Briefcase, LogOut } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

const TABS = ["all", "open", "draft", "closed"] as const;
type Tab = (typeof TABS)[number];

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [showCreate, setShowCreate] = useState(false);

  async function load(status?: string) {
    setLoading(true);
    try {
      const res = await getCompanyJobs({ status: status === "all" ? undefined : status });
      setJobs(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(tab);
  }, [tab]);

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  }

  const counts = {
    all: jobs.length,
    open: jobs.filter((j) => j.status === "open").length,
    draft: jobs.filter((j) => j.status === "draft").length,
    closed: jobs.filter((j) => j.status === "closed").length,
  };

  return (
    <div className="min-h-screen bg-inkBg text-inkText">
      {/* ── Top Nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-inkLine bg-inkBg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accentAmber font-display text-xs font-bold text-inkBg">
              AI
            </div>
            <span className="font-mono text-sm font-medium tracking-wide text-inkMuted">
              Company Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-accentAmber px-4 py-2 text-sm font-semibold text-inkBg transition-transform hover:scale-[1.02]"
            >
              <Plus size={15} /> Post Job
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

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* ── Stats Bar ──────────────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(["all", "open", "draft", "closed"] as const).map((s) => (
            <div
              key={s}
              className="rounded-xl border border-inkLine bg-inkElevated px-5 py-4"
            >
              <p className="font-mono text-[11px] uppercase tracking-wide text-inkMuted">{s}</p>
              <p className="mt-1 font-display text-2xl font-bold text-inkText">
                {loading ? "—" : counts[s]}
              </p>
            </div>
          ))}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="mb-6 flex gap-1 rounded-xl border border-inkLine bg-inkElevated p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
                tab === t
                  ? "bg-accentAmber text-inkBg font-semibold"
                  : "text-inkMuted hover:text-inkText"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Job Grid ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="h-8 w-8 text-accentAmber" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-inkLine py-24 text-center">
            <Briefcase size={36} className="text-inkMuted/40" />
            <div>
              <p className="font-display text-lg font-semibold text-inkText">No jobs yet</p>
              <p className="mt-1 text-sm text-inkMuted">Post your first job to start finding candidates</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-2 flex items-center gap-2 rounded-lg bg-accentAmber px-5 py-2.5 text-sm font-semibold text-inkBg transition-transform hover:scale-[1.02]"
            >
              <Plus size={15} /> Post a Job
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onUpdated={(updated) =>
                  setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)))
                }
                onClick={() => router.push(`/company/jobs/${job.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <CreateJobModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(job) => {
          setJobs((prev) => [job, ...prev]);
        }}
      />
    </div>
  );
}