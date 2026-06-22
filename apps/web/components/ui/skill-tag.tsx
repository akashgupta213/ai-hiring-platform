import { cn } from "@/lib/utils";

export function SkillTag({ skill, className }: { skill: string; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-md border border-inkLine bg-inkElevated px-2.5 py-1 font-mono text-[11px] text-inkMuted",
        className
      )}
    >
      {skill}
    </span>
  );
}