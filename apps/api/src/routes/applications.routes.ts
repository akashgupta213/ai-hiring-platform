import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth.middleware";

const updateStatusSchema = z.object({
  status: z.enum(["shortlisted", "rejected", "hired"]),
});

export async function applicationRoutes(app: FastifyInstance) {
  // ── POST /applications/:jobId — Candidate applies ────────────────────────
  app.post(
    "/applications/:jobId",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      if (request.user.role !== "candidate") {
        return reply.status(403).send({ error: "Only candidates can apply" });
      }

      const { jobId } = request.params as { jobId: string };

      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job || job.status !== "open") {
        return reply.status(404).send({ error: "Job not found or not open" });
      }

      const existing = await prisma.application.findUnique({
        where: { jobId_candidateId: { jobId, candidateId: request.user.id } },
      });
      if (existing) {
        return reply.status(409).send({ error: "Already applied to this job" });
      }

      const application = await prisma.application.create({
        data: { jobId, candidateId: request.user.id },
        include: {
          job: {
            include: {
              company: { select: { id: true, name: true, industry: true } },
            },
          },
        },
      });

      return reply.status(201).send(application);
    }
  );

  // ── GET /applications/me — Candidate's own applications ──────────────────
  app.get(
    "/applications/me",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      if (request.user.role !== "candidate") {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const applications = await prisma.application.findMany({
        where: { candidateId: request.user.id },
        orderBy: { appliedAt: "desc" },
        include: {
          job: {
            include: {
              company: { select: { id: true, name: true, industry: true } },
              _count: { select: { applications: true } },
            },
          },
        },
      });

      return reply.send(applications);
    }
  );

  // ── GET /jobs/:jobId/applications — Company sees ranked candidates ────────
  app.get(
    "/jobs/:jobId/applications",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      if (request.user.role !== "company") {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const { jobId } = request.params as { jobId: string };

      const company = await prisma.company.findUnique({
        where: { userId: request.user.id },
      });

      const job = await prisma.job.findFirst({
        where: { id: jobId, companyId: company?.id },
      });
      if (!job) return reply.status(404).send({ error: "Job not found" });

      const applications = await prisma.application.findMany({
        where: { jobId },
        orderBy: { appliedAt: "desc" },
        include: {
          candidate: {
            select: { id: true, email: true, createdAt: true },
          },
        },
      });

      return reply.send(applications);
    }
  );

  // ── GET /applications/:id — Full detail (both sides) ─────────────────────
  app.get(
    "/applications/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          job: {
            include: {
              company: { select: { id: true, name: true, industry: true } },
            },
          },
          candidate: { select: { id: true, email: true } },
        },
      });

      if (!application) return reply.status(404).send({ error: "Not found" });

      // Access check: candidate sees their own; company sees their jobs only
      const company = request.user.role === "company"
        ? await prisma.company.findUnique({ where: { userId: request.user.id } })
        : null;

      const isOwner = application.candidateId === request.user.id;
      const isCompany = company && application.job.companyId === company.id;

      if (!isOwner && !isCompany) {
        return reply.status(403).send({ error: "Forbidden" });
      }

      return reply.send(application);
    }
  );

  // ── PATCH /applications/:id/status — Company shortlists / rejects ────────
  app.patch(
    "/applications/:id/status",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      if (request.user.role !== "company") {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const { id } = request.params as { id: string };
      const parsed = updateStatusSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const company = await prisma.company.findUnique({
        where: { userId: request.user.id },
      });

      const application = await prisma.application.findFirst({
        where: { id },
        include: { job: true },
      });

      if (!application || application.job.companyId !== company?.id) {
        return reply.status(404).send({ error: "Application not found" });
      }

      const updated = await prisma.application.update({
        where: { id },
        data: { status: parsed.data.status },
      });

      return reply.send(updated);
    }
  );
}