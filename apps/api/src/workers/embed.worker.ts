import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { generateEmbedding } from "../services/openai";
import {
  QUEUE_NAMES,
  ResumeEmbedJobData,
  getConnection,
} from "../queues";

// ─── Worker ─────────────────────────────────────────────────────────────────────

export const embedWorker = new Worker<ResumeEmbedJobData>(
  QUEUE_NAMES.RESUME_EMBED,
  async (job: Job<ResumeEmbedJobData>) => {
    const { resumeId, rawText, applicationId } = job.data;

    console.log(`[embed-resume] Starting embedding for resume ${resumeId}`);

    // ── Step 1: Generate 1536-dim embedding ───────────────────────────────────
    await job.updateProgress(20);
    let embedding: number[];
    try {
      embedding = await generateEmbedding(rawText);
    } catch (err) {
      throw new Error(`Failed to generate embedding: ${err}`);
    }

    // ── Step 2: Save vector to DB using pgvector raw SQL ──────────────────────
    // Prisma doesn't natively support vector type yet, so we use $executeRaw
    await job.updateProgress(50);
    try {
      const vectorString = `[${embedding.join(",")}]`;
      await prisma.$executeRaw`
        UPDATE "resumes"
        SET "embedding" = ${vectorString}::vector
        WHERE "id" = ${resumeId}
      `;
    } catch (err) {
      throw new Error(`Failed to save embedding to DB: ${err}`);
    }

    console.log(`[embed-resume] Saved embedding for resume ${resumeId}`);

    // ── Step 3: If tied to an application, compute semantic score ────────────
    if (applicationId) {
      await job.updateProgress(70);
      await updateSemanticScore(applicationId, resumeId);
    }

    await job.updateProgress(100);
    console.log(`[embed-resume] Completed for resume ${resumeId}`);

    return { resumeId, embeddingDimensions: embedding.length };
  },
  {
    connection: getConnection(),
    concurrency: 10,
  }
);

// ─── Semantic Score Calculation ───────────────────────────────────────────────

/**
 * Compute cosine similarity between resume embedding and job embedding,
 * then update the application's semantic_score.
 */
async function updateSemanticScore(
  applicationId: string,
  resumeId: string
): Promise<void> {
  try {
    // Get the application with its job
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        resume: true,
      },
    });

    if (!application) {
      console.warn(`[embed-resume] Application ${applicationId} not found`);
      return;
    }

    // Use pgvector cosine similarity operator <=>
    // Lower value = more similar (cosine distance), so we do 1 - distance
    const result = await prisma.$queryRaw<[{ similarity: number }]>`
      SELECT 1 - (r.embedding <=> j.embedding) as similarity
      FROM "resumes" r
      JOIN "jobs" j ON j.id = ${application.jobId}
      WHERE r.id = ${resumeId}
      AND r.embedding IS NOT NULL
      AND j.embedding IS NOT NULL
    `;

    if (result.length > 0 && result[0].similarity != null) {
      const semanticScore = Math.max(0, Math.min(1, result[0].similarity));

      // Also compute skill_score: overlap between parsed skills and job required skills
      const parsedResume = application.resume?.parsedJson as any;
      const candidateSkills: string[] = parsedResume?.skills ?? [];
      const jobSkills: string[] = application.job.skillsRequired ?? [];

      const skillScore = computeSkillScore(candidateSkills, jobSkills);

      await prisma.application.update({
        where: { id: applicationId },
        data: {
          semanticScore,
          skillScore,
        },
      });

      console.log(
        `[embed-resume] Updated scores for application ${applicationId}: ` +
        `semantic=${semanticScore.toFixed(3)}, skill=${skillScore.toFixed(3)}`
      );
    }
  } catch (err) {
    // Non-fatal: log but don't fail the job
    console.error(`[embed-resume] Failed to update semantic score: ${err}`);
  }
}

/**
 * Compute skill overlap score: |intersection| / |union|
 * Returns 0–1.
 */
function computeSkillScore(
  candidateSkills: string[],
  jobSkills: string[]
): number {
  if (jobSkills.length === 0) return 0;

  const normalize = (s: string) => s.toLowerCase().trim();
  const candidateSet = new Set(candidateSkills.map(normalize));
  const jobSet = new Set(jobSkills.map(normalize));

  let matchCount = 0;
  for (const skill of jobSet) {
    if (candidateSet.has(skill)) matchCount++;
  }

  // Jaccard-like: matches / total job skills required
  return matchCount / jobSet.size;
}

// ─── Event Handlers ──────────────────────────────────────────────────────────────

embedWorker.on("completed", (job) => {
  console.log(`[embed-resume] Job ${job.id} completed`);
});

embedWorker.on("failed", (job, err) => {
  console.error(`[embed-resume] Job ${job?.id} failed:`, err.message);
});