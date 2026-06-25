import { Worker, Job } from "bullmq";
import pdfParse from "pdf-parse";
import { prisma } from "../lib/prisma";
import { downloadFromS3 } from "../services/s3";
import {
  parseResumeText,
  buildResumeEmbeddingText,
} from "../services/openai";
import {
  QUEUE_NAMES,
  ResumeParseJobData,
  resumeEmbedQueue,
  ResumeEmbedJobData,
  getConnection,
} from "../queues";

// ─── Worker ─────────────────────────────────────────────────────────────────────

export const resumeParseWorker = new Worker<ResumeParseJobData>(
  QUEUE_NAMES.RESUME_PARSE,
  async (job: Job<ResumeParseJobData>) => {
    const { resumeId, s3Key, candidateId, applicationId } = job.data;

    console.log(`[resume-parse] Starting job for resume ${resumeId}`);

    // ── Step 1: Download PDF from S3 ──────────────────────────────────────────
    await job.updateProgress(10);
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await downloadFromS3(s3Key);
    } catch (err) {
      throw new Error(`Failed to download PDF from S3 (key: ${s3Key}): ${err}`);
    }

    // ── Step 2: Extract raw text from PDF ────────────────────────────────────
    await job.updateProgress(25);
    let rawText: string;
    try {
      const parsed = await pdfParse(pdfBuffer);
      rawText = parsed.text.trim();
    } catch (err) {
      throw new Error(`Failed to parse PDF text: ${err}`);
    }

    if (!rawText || rawText.length < 50) {
      throw new Error("PDF appears to be empty or unreadable (< 50 chars extracted)");
    }

    console.log(
      `[resume-parse] Extracted ${rawText.length} chars from PDF for resume ${resumeId}`
    );

    // ── Step 3: Call GPT-4o-mini to structure the resume ─────────────────────
    await job.updateProgress(50);
    let parsedJson;
    try {
      parsedJson = await parseResumeText(rawText);
    } catch (err) {
      throw new Error(`Failed to parse resume with LLM: ${err}`);
    }

    // ── Step 4: Save raw text + parsed JSON to DB ─────────────────────────────
    await job.updateProgress(75);
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        rawText,
        parsedJson: parsedJson as any,
      },
    });

    console.log(`[resume-parse] Saved parsed resume for ${resumeId}`);

    // ── Step 5: Enqueue embedding job ─────────────────────────────────────────
    await job.updateProgress(90);
    const embeddingText = buildResumeEmbeddingText(parsedJson);

    const embedJobData: ResumeEmbedJobData = {
      resumeId,
      rawText: embeddingText,
      applicationId,
    };
    await resumeEmbedQueue.add("embed-resume", embedJobData, {
      priority: 1,
    });

    await job.updateProgress(100);
    console.log(`[resume-parse] Completed for resume ${resumeId}, embed job queued`);

    return { resumeId, parsedJson };
  },
  {
    connection: getConnection(),
    concurrency: 5, // Process up to 5 resumes in parallel
  }
);

// ─── Event Handlers ──────────────────────────────────────────────────────────────

resumeParseWorker.on("completed", (job) => {
  console.log(`[resume-parse] Job ${job.id} completed`);
});

resumeParseWorker.on("failed", (job, err) => {
  console.error(`[resume-parse] Job ${job?.id} failed:`, err.message);
});

resumeParseWorker.on("progress", (job, progress) => {
  console.log(`[resume-parse] Job ${job.id} progress: ${progress}%`);
});