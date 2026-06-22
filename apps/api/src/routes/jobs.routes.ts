import type { FastifyInstance } from "fastify";
import {
  createJobSchema,
  updateJobStatusSchema,
  jobsQuerySchema,
} from "@ai-hiring/shared-types";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth.middleware";

export async function jobRoutes(app: FastifyInstance) {
  // ── GET /jobs — Browse open jobs (candidates + public) ──────────────────
  app.get("/jobs", async (request, reply) => {
    const parsed = jobsQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const { page, limit, search } = parsed.data;
    const skip = (page - 1) * limit;

    const where = {
      status: "open" as const,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          { skillsRequired: { has: search } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          company: { select: { id: true, name: true, industry: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return reply.send({
      data: jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });

  // ── GET /jobs/:id — Single job detail ───────────────────────────────────
  app.get("/jobs/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, industry: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!job) return reply.status(404).send({ error: "Job not found" });
    return reply.send(job);
  });

  // ── POST /jobs — Create job (company only) ───────────────────────────────
  app.post("/jobs", { preHandler: [requireAuth] }, async (request, reply) => {
    if (request.user.role !== "company") {
      return reply.status(403).send({ error: "Only companies can post jobs" });
    }

    const parsed = createJobSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const company = await prisma.company.findUnique({
      where: { userId: request.user.id },
    });
    if (!company) {
      return reply.status(404).send({ error: "Company profile not found" });
    }

    const job = await prisma.job.create({
      data: {
        ...parsed.data,
        companyId: company.id,
      },
      include: {
        company: { select: { id: true, name: true, industry: true } },
        _count: { select: { applications: true } },
      },
    });

    return reply.status(201).send(job);
  });

  // ── PATCH /jobs/:id/status — Open / close job (company only) ────────────
  app.patch(
    "/jobs/:id/status",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      if (request.user.role !== "company") {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const { id } = request.params as { id: string };
      const parsed = updateJobStatusSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }

      const company = await prisma.company.findUnique({
        where: { userId: request.user.id },
      });

      const job = await prisma.job.findFirst({
        where: { id, companyId: company?.id },
      });
      if (!job) return reply.status(404).send({ error: "Job not found" });

      const updated = await prisma.job.update({
        where: { id },
        data: { status: parsed.data.status },
        include: {
          company: { select: { id: true, name: true, industry: true } },
          _count: { select: { applications: true } },
        },
      });

      return reply.send(updated);
    }
  );

  // ── GET /company/jobs — Company's own job list ───────────────────────────
  app.get(
    "/company/jobs",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      if (request.user.role !== "company") {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const parsed = jobsQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.flatten() });
      }
      const { page, limit, status } = parsed.data;

      const company = await prisma.company.findUnique({
        where: { userId: request.user.id },
      });
      if (!company) {
        return reply.status(404).send({ error: "Company profile not found" });
      }

      const where = {
        companyId: company.id,
        ...(status && { status }),
      };

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { applications: true } },
          },
        }),
        prisma.job.count({ where }),
      ]);

      return reply.send({
        data: jobs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }
  );
}