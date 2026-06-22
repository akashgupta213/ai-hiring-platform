"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobSchema, type CreateJobInput } from "@ai-hiring/shared-types";
import { createJob } from "@/lib/api-client";
import { Spinner } from "@/components/ui/spinner";
import { X, Plus } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (job: any) => void;
}

export function CreateJobModal({ open, onClose, onCreated }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: { skillsRequired: [], status: "open" },
  });

  const skills = watch("skillsRequired");

  function addSkill() {
    const trimmed = skillInput.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setValue("skillsRequired", [...skills, trimmed]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setValue("skillsRequired", skills.filter((s) => s !== skill));
  }

  async function onSubmit(values: CreateJobInput) {
    setServerError(null);
    try {
      const job = await createJob(values);
      onCreated(job);
      reset();
      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to create job");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-inkLine bg-inkElevated shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-inkLine px-6 py-4">
          <h2 className="font-display text-lg font-semibold text-inkText">
            Post a new job
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-inkMuted transition-colors hover:bg-white/5 hover:text-inkText"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5" noValidate>
          {/* Title */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-inkMuted">
              Job Title
            </label>
            <input
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full rounded-lg border border-inkLine bg-inkBg px-3 py-2.5 text-sm text-inkText outline-none transition-colors placeholder:text-inkMuted/50 focus:border-accentTeal focus:ring-2 focus:ring-accentTeal/20"
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-inkMuted">
              Description
            </label>
            <textarea
              rows={5}
              placeholder="Describe the role, responsibilities, and what makes it exciting…"
              className="w-full resize-none rounded-lg border border-inkLine bg-inkBg px-3 py-2.5 text-sm text-inkText outline-none transition-colors placeholder:text-inkMuted/50 focus:border-accentTeal focus:ring-2 focus:ring-accentTeal/20"
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-inkMuted">
              Required Skills
            </label>
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addSkill(); }
                }}
                placeholder="e.g. TypeScript"
                className="flex-1 rounded-lg border border-inkLine bg-inkBg px-3 py-2.5 text-sm text-inkText outline-none transition-colors placeholder:text-inkMuted/50 focus:border-accentTeal focus:ring-2 focus:ring-accentTeal/20"
              />
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center gap-1.5 rounded-lg border border-inkLine bg-white/5 px-3 py-2.5 text-sm text-inkMuted transition-colors hover:border-accentTeal hover:text-accentTeal"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            {errors.skillsRequired && (
              <p className="mt-1 text-xs text-red-400">{errors.skillsRequired.message}</p>
            )}
            {skills.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 rounded-md border border-inkLine bg-inkBg px-2.5 py-1 font-mono text-[11px] text-inkMuted"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-inkMuted/60 transition-colors hover:text-red-400"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-inkMuted">
              Publish Status
            </label>
            <select
              className="w-full rounded-lg border border-inkLine bg-inkBg px-3 py-2.5 text-sm text-inkText outline-none transition-colors focus:border-accentTeal focus:ring-2 focus:ring-accentTeal/20"
              {...register("status")}
            >
              <option value="open">Open — visible to candidates</option>
              <option value="draft">Draft — hidden</option>
            </select>
          </div>

          {serverError && (
            <p className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-400">
              {serverError}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-inkLine pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-inkMuted transition-colors hover:bg-white/5 hover:text-inkText"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-accentAmber px-5 py-2 text-sm font-semibold text-inkBg transition-transform hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting && <Spinner className="h-4 w-4 text-inkBg" />}
              {isSubmitting ? "Posting…" : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}