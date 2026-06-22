import { cn } from "@/lib/utils";

const variants = {
  open: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  draft: "bg-accentAmber/10 text-accentAmber border-accentAmber/20",
  applied: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shortlisted: "bg-accentTeal/10 text-accentTeal border-accentTeal/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  hired: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
} as const;

interface BadgeProps {
  status: keyof typeof variants;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide",
        variants[status],
        className
      )}
    >
      {status}
    </span>
  );
}