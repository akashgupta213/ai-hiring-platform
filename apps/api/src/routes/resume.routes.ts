import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getUploadPresignedUrl, resumeS3Key } from "../services/s3";
import {
  resumeParseQueue,
  ResumeParseJobData,
} from "../queues";
import { requireAuth } from "../middleware/auth.middleware";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const uploadUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z
    .string()
    .refine((v) => v === "application/pdf", "Only PDF files are accepted"),
});

const triggerParseSchema = z.object({
  s3Key: z.string().min(1),
  applicationId: z.string().uuid().optional(),
});

// ─── Routes ──────────────────────────────────────────────────────────────────

export async function resumeRoutes(fastify: FastifyInstance) {
  // ── GET /resumes/me - get current candidate's resume ───────────────────────
  fastify.get(
    "/resumes/me",
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as any).user.id;

      const resume = await prisma.resume.findFirst({
        where: { candidateId: userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          s3Key: true,
          parsedJson: true,
          rawText: true,
          createdAt: true,
          // Don't expose embedding vector to client
        },
      });

      if (!resume) {
        return reply.status(404).send({ error: "No resume found" });
      }

      return reply.send({ resume });
    }
  );

  // ── POST /resumes/upload-url - generate presigned S3 URL ───────────────────
  fastify.post(
    "/resumes/upload-url",
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as any).user.id;

      const body = uploadUrlSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }

      const { filename, contentType } = body.data;
      const s3Key = resumeS3Key(userId, filename);

      const presignedUrl = await getUploadPresignedUrl(s3Key, contentType);

      return reply.send({ presignedUrl, s3Key });
    }
  );

  // ── POST /resumes/parse - record resume in DB + trigger AI pipeline ─────────
  fastify.post(
    "/resumes/parse",
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as any).user.id;

      const body = triggerParseSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }

      const { s3Key, applicationId } = body.data;

      // Create resume record in DB
      const resume = await prisma.resume.create({
  data: {
    candidateId: userId,
    s3Key,
    rawText: "",
  },
});

      // If tied to an application, link it
      if (applicationId) {
        await prisma.application.update({
          where: { id: applicationId, candidateId: userId },
          data: { resumeId: resume.id },
        });
      }

      // Enqueue the parse job
      const jobData: ResumeParseJobData = {
        resumeId: resume.id,
        s3Key,
        candidateId: userId,
        applicationId,
      };

      const parseJob = await resumeParseQueue.add("parse-resume", jobData, {
        priority: 1,
        // Deduplicate: don't re-parse the same S3 key twice in 5 minutes
        jobId: `resume-${resume.id}`,
      });

      return reply.status(202).send({
        resumeId: resume.id,
        jobId: parseJob.id,
        message: "Resume received. Parsing pipeline started.",
      });
    }
  );

  // ── GET /resumes/:resumeId/status - check parse pipeline status ────────────
  fastify.get(
    "/resumes/:resumeId/status",
    { preHandler: [requireAuth] },
    async (
      request: FastifyRequest<{ Params: { resumeId: string } }>,
      reply: FastifyReply
    ) => {
      const userId = (request as any).user.id;
      const { resumeId } = request.params;

      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, candidateId: userId },
        select: {
          id: true,
          parsedJson: true,
          rawText: true,
          createdAt: true,
        },
      });

      if (!resume) {
        return reply.status(404).send({ error: "Resume not found" });
      }

      const isParsed = !!resume.parsedJson;
      const hasText = !!resume.rawText;

      return reply.send({
        resumeId,
        status: isParsed ? "completed" : hasText ? "embedding" : "parsing",
        isParsed,
        parsedJson: isParsed ? resume.parsedJson : null,
      });
    }
  );

  // ── GET /resumes/:resumeId - get full resume details (company view) ─────────
  fastify.get(
    "/resumes/:resumeId",
    { preHandler: [requireAuth] },
    async (
      request: FastifyRequest<{ Params: { resumeId: string } }>,
      reply: FastifyReply
    ) => {
      const { resumeId } = request.params;
      const userId = (request as any).user.id;
      const userRole = (request as any).user.role;

      const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
        select: {
          id: true,
          candidateId: true,
          parsedJson: true,
          s3Key: true,
          createdAt: true,
        },
      });

      if (!resume) {
        return reply.status(404).send({ error: "Resume not found" });
      }

      // Candidates can only see their own resumes
      if (userRole === "candidate" && resume.candidateId !== userId) {
        return reply.status(403).send({ error: "Access denied" });
      }

      return reply.send({ resume });
    }
  );
}