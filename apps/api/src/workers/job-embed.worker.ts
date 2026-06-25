import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { generateEmbedding, buildJobEmbeddingText } from "../services/openai";
import {
  QUEUE_NAMES,
  JobEmbedJobData,
  getConnection,
} from "../queues";

// ─── Worker ─────────────────────────────────────────────────────────────────────

export const jobEmbedWorker = new Worker<JobEmbedJobData>(
  QUEUE_NAMES.JOB_EMBED,
  async (job: Job<JobEmbedJobData>) => {
    const { jobId, title, description, skills } = job.data;

    console.log(`[job-embed] Embedding job ${jobId}: "${title}"`);

    // Build rich text for embedding
    const embeddingText = buildJobEmbeddingText(title, description, skills);

    // Generate embedding
    const embedding = await generateEmbedding(embeddingText);

    // Save vector to DB
    const vectorString = `[${embedding.join(",")}]`;
    await prisma.$executeRaw`
      UPDATE "jobs"
      SET "embedding" = ${vectorString}::vector
      WHERE "id" = ${jobId}
    `;

    console.log(`[job-embed] Saved job embedding for ${jobId}`);
    return { jobId };
  },
  {
    connection: getConnection(),
    concurrency: 10,
  }
);

jobEmbedWorker.on("completed", (job) => {
  console.log(`[job-embed] Job ${job.id} completed`);
});

jobEmbedWorker.on("failed", (job, err) => {
  console.error(`[job-embed] Job ${job?.id} failed:`, err.message);
});