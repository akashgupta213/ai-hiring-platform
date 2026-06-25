"use client";

import { useCallback, useRef, useState } from "react";
import { useResumeUpload } from "@/hooks/useResumeUpload";

interface ResumeUploadProps {
  apiBaseUrl: string;
  token: string;
  applicationId?: string;
  onComplete?: (resumeId: string) => void;
}

export function ResumeUpload({
  apiBaseUrl,
  token,
  applicationId,
  onComplete,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const { status, progress, error, uploadResume, reset } = useResumeUpload(
    apiBaseUrl,
    token
  );

  const handleFile = useCallback(
    async (file: File) => {
      const resumeId = await uploadResume(file, { applicationId });
      if (resumeId) onComplete?.(resumeId);
    },
    [uploadResume, applicationId, onComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // ── Status-specific UI ────────────────────────────────────────────────────

  if (status === "done") {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <p className="text-green-400 font-medium">Resume uploaded & parsed!</p>
        <p className="text-sm text-green-400/70 mt-1">
          AI has extracted your skills, experience, and education.
        </p>
        <button
          onClick={reset}
          className="mt-4 text-xs text-green-400/60 underline hover:text-green-400"
        >
          Upload a different resume
        </button>
      </div>
    );
  }

  if (status === "uploading" || status === "parsing") {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white">
            {status === "uploading" ? "Uploading resume…" : "AI is parsing your resume…"}
          </p>
          <span className="text-xs text-white/40">{progress}%</span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {status === "parsing" && (
          <p className="text-xs text-white/40 mt-3 text-center">
            Extracting skills, experience &amp; education with AI…
          </p>
        )}
      </div>
    );
  }

  // ── Idle / Error state = drag-and-drop zone ──────────────────────────────

  // Replace this in your return statement
return (
  <div>
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`
        relative rounded-xl border-2 border-dashed p-8 text-center
        transition-all duration-200
        ${dragOver
          ? "border-violet-400 bg-violet-500/10"
          : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        style={{ display: "none" }}
        onChange={handleChange}
      />

      <div className="text-4xl mb-3">📄</div>
      <p className="text-white font-medium">
        {dragOver ? "Drop your resume here" : "Upload your resume"}
      </p>
      <p className="text-white/40 text-sm mt-1">PDF only · Max 10MB</p>

      {/* Explicit button instead of div onClick */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
      >
        Browse files
      </button>

      <p className="text-white/30 text-xs mt-3">
        AI will extract skills, experience &amp; education automatically
      </p>
    </div>

    {error && (
      <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
    )}
  </div>
);
}