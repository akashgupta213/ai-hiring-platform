"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { SkillTag } from "@/components/ui/skill-tag";
import { updateJobStatus } from "@/lib/api-client";
import { Users, ChevronDown } from "lucide-react";

interface JobCardProps {
  job: any;
  onUpdated: (job: any) => void;
  onClick: () => void;
}

export function JobCard({ job, onUpdated, onClick }: JobCardProps) {
  const [loading, setLoading] = useState(false);

  async function toggleStatus() {
    setLoading(true);
    try {
      const next = job.status === "open" ? "closed" : "open";
      const updated = await updateJobStatus(job.id, next);
      onUpdated(updated);
    } finally {
      setLoading(false);
    }
  }

  const date = new Date(job.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="group rounded-xl border border-inkLine bg-inkElevated p-5 transition-colors hover:border-inkLine/60 hover:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <button
            onClick={onClick}
            className="text-left font-display text-base font-semibold text-inkText transition-colors group-hover:text-accentAmber"
          >
            {job.title}
          </button>
          <p className="mt-0.5 font-mono text-xs text-inkMuted">{date}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-inkMuted">
        {job.description}
      </p>

      {job.skillsRequired?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skillsRequired.slice(0, 5).map((s: string) => (
            <SkillTag key={s} skill={s} />
          ))}
          {job.skillsRequired.length > 5 && (
            <span className="rounded-md border border-inkLine px-2.5 py-1 font-mono text-[11px] text-inkMuted/60">
              +{job.skillsRequired.length - 5}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={onClick}
          className="flex items-center gap-1.5 font-mono text-xs text-inkMuted transition-colors hover:text-accentTeal"
        >
          <Users size={13} />
          {job._count?.applications ?? 0} applicants
        </button>

        <button
          onClick={toggleStatus}
          disabled={loading || job.status === "draft"}
          className="rounded-lg border border-inkLine px-3 py-1.5 font-mono text-[11px] text-inkMuted transition-colors hover:border-accentTeal hover:text-accentTeal disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "…" : job.status === "open" ? "Close" : "Reopen"}
        </button>
      </div>
    </div>
  );
}