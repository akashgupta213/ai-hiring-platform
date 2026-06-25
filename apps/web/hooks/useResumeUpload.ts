import { useState, useCallback } from "react";

interface UploadResumeOptions {
  applicationId?: string;
  onProgress?: (percent: number) => void;
}

interface ResumeUploadState {
  status: "idle" | "uploading" | "parsing" | "done" | "error";
  progress: number;
  resumeId?: string;
  error?: string;
}

/**
 * Hook for the full resume upload + parse pipeline:
 * 1. Get presigned S3 URL from API
 * 2. Upload PDF directly to S3 from the browser
 * 3. Tell API to trigger the parse pipeline
 * 4. Poll for status until parsing is complete
 */
export function useResumeUpload(apiBaseUrl: string, token: string) {
  const [state, setState] = useState<ResumeUploadState>({
    status: "idle",
    progress: 0,
  });

  const uploadResume = useCallback(
    async (file: File, options: UploadResumeOptions = {}) => {
      if (file.type !== "application/pdf") {
        setState({ status: "error", progress: 0, error: "Only PDF files are accepted" });
        return;
      }

      try {
        // ── Step 1: Get presigned URL ─────────────────────────────────────────
        setState({ status: "uploading", progress: 5 });

        const urlRes = await fetch(`${apiBaseUrl}/resumes/upload-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: "application/pdf",
          }),
        });

        if (!urlRes.ok) {
          throw new Error("Failed to get upload URL");
        }

        const { presignedUrl, s3Key } = await urlRes.json();

        // ── Step 2: Upload PDF directly to S3 ────────────────────────────────
        setState({ status: "uploading", progress: 15 });
        options.onProgress?.(15);

        await uploadToS3WithProgress(presignedUrl, file, (percent) => {
          const mapped = 15 + Math.round(percent * 0.65); // 15–80%
          setState({ status: "uploading", progress: mapped });
          options.onProgress?.(mapped);
        });

        // ── Step 3: Trigger parse pipeline ───────────────────────────────────
        setState({ status: "parsing", progress: 82 });
        options.onProgress?.(82);

        const parseRes = await fetch(`${apiBaseUrl}/resumes/parse`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            s3Key,
            applicationId: options.applicationId,
          }),
        });

        if (!parseRes.ok) {
          throw new Error("Failed to start parse pipeline");
        }

        const { resumeId } = await parseRes.json();

        // ── Step 4: Poll for completion ───────────────────────────────────────
        setState({ status: "parsing", progress: 85, resumeId });
        options.onProgress?.(85);

        await pollUntilParsed(apiBaseUrl, token, resumeId, (progress) => {
          setState({ status: "parsing", progress, resumeId });
          options.onProgress?.(progress);
        });

        setState({ status: "done", progress: 100, resumeId });
        options.onProgress?.(100);

        return resumeId;
      } catch (err: any) {
        setState({ status: "error", progress: 0, error: err.message });
        throw err;
      }
    },
    [apiBaseUrl, token]
  );

  const reset = useCallback(() => {
    setState({ status: "idle", progress: 0 });
  }, []);

  return { ...state, uploadResume, reset };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function uploadToS3WithProgress(
  presignedUrl: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("S3 upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("S3 upload aborted")));

    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", "application/pdf");
    xhr.send(file);
  });
}

async function pollUntilParsed(
  apiBaseUrl: string,
  token: string,
  resumeId: string,
  onProgress: (progress: number) => void,
  maxAttempts = 30,
  intervalMs = 2000
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, intervalMs));

    const res = await fetch(`${apiBaseUrl}/resumes/${resumeId}/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) continue;

    const data = await res.json();

    if (data.status === "completed") {
      onProgress(100);
      return;
    }

    // Map polling progress: 85–99%
    const pollProgress = 85 + Math.round((attempt / maxAttempts) * 14);
    onProgress(pollProgress);
  }

  // Timeout — parsing may still be running in background
  console.warn(`[useResumeUpload] Polling timed out for resume ${resumeId}`);
}