import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth.middleware";

const sendSchema = z.object({
  body: z.string().min(1).max(4000),
});

export async function conversationRoutes(app: FastifyInstance) {

  // GET /conversations — list my conversations with last message preview
  app.get("/conversations", { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = request.user.id;

    const participations = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            job: { select: { id: true, title: true } },
            participants: {
              where: { userId: { not: userId } },
              include: { user: { select: { id: true, email: true, role: true } } },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { conversation: { createdAt: "desc" } },
    });

    const result = participations.map((p) => {
      const conv = p.conversation;
      const other = conv.participants[0]?.user;
      const lastMsg = conv.messages[0];
      return {
        id: conv.id,
        jobId: conv.jobId,
        jobTitle: conv.job?.title ?? null,
        // The "other" participant — could be recruiter or candidate
        otherUserId: other?.id ?? null,
        otherUserEmail: other?.email ?? null,
        otherUserRole: other?.role ?? null,
        lastMessagePreview: lastMsg?.body?.slice(0, 80) ?? "",
        lastMessageAt: lastMsg?.createdAt ?? conv.createdAt,
        unreadCount: p.unreadCount,
      };
    });

    return reply.send(result);
  });

  // GET /conversations/:id/messages — messages in a conversation
  app.get("/conversations/:id/messages", { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.id;

    // verify participant
    const participation = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId } },
    });
    if (!participation) return reply.status(403).send({ error: "Forbidden" });

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, email: true, role: true } } },
    });

    return reply.send(
      messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        senderRole: m.sender.role,
        body: m.body,
        createdAt: m.createdAt,
        readAt: m.readAt,
      }))
    );
  });

  // POST /conversations/:id/messages — send a message
  app.post("/conversations/:id/messages", { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.id;

    const participation = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId } },
    });
    if (!participation) return reply.status(403).send({ error: "Forbidden" });

    const parsed = sendSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    const message = await prisma.message.create({
      data: { conversationId: id, senderId: userId, body: parsed.data.body },
      include: { sender: { select: { id: true, role: true } } },
    });

    // increment unread for all OTHER participants
    await prisma.conversationParticipant.updateMany({
      where: { conversationId: id, userId: { not: userId } },
      data: { unreadCount: { increment: 1 } },
    });

    // emit via socket if available
    const io = (app as any).io;
    if (io) {
      io.to(`conversation:${id}`).emit("message:new", {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderRole: message.sender.role,
        body: message.body,
        createdAt: message.createdAt,
        readAt: message.readAt,
      });
    }

    return reply.status(201).send(message);
  });

  // POST /conversations/:id/read — mark conversation as read
  app.post("/conversations/:id/read", { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.id;

    await prisma.conversationParticipant.updateMany({
      where: { conversationId: id, userId },
      data: { unreadCount: 0, lastReadAt: new Date() },
    });

    // also mark messages as read
    await prisma.message.updateMany({
      where: { conversationId: id, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });

    return reply.send({ ok: true });
  });

  // POST /conversations — start a conversation (company initiates with candidate)
  app.post("/conversations", { preHandler: [requireAuth] }, async (request, reply) => {
    const schema = z.object({
      otherUserId: z.string().uuid(),
      jobId: z.string().uuid().optional(),
      body: z.string().min(1).max(4000),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    const { otherUserId, jobId, body } = parsed.data;
    const userId = request.user.id;

    // Check if conversation already exists between these two for this job
    const existing = await prisma.conversation.findFirst({
      where: {
        jobId: jobId ?? null,
        participants: {
          every: { userId: { in: [userId, otherUserId] } },
        },
      },
      include: { participants: true },
    });

    let convId: string;

    if (existing && existing.participants.length === 2) {
      convId = existing.id;
    } else {
      const conv = await prisma.conversation.create({
        data: {
          jobId: jobId ?? null,
          participants: {
            createMany: {
              data: [{ userId }, { userId: otherUserId }],
            },
          },
        },
      });
      convId = conv.id;
    }

    const message = await prisma.message.create({
      data: { conversationId: convId, senderId: userId, body },
      include: { sender: { select: { id: true, role: true } } },
    });

    await prisma.conversationParticipant.updateMany({
      where: { conversationId: convId, userId: { not: userId } },
      data: { unreadCount: { increment: 1 } },
    });

    return reply.status(201).send({ conversationId: convId, message });
  });

  // GET /conversations/:id/smart-replies — AI-generated reply suggestions
  app.get("/conversations/:id/smart-replies", { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.id;

    const participation = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId } },
    });
    if (!participation) return reply.status(403).send({ error: "Forbidden" });

    const lastMessages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    if (!lastMessages.length) return reply.send({ replies: [] });

    const lastMsg = lastMessages[0];
    // Only suggest replies to messages you DIDN'T send
    if (lastMsg.senderId === userId) return reply.send({ replies: [] });

    // Simple context-based smart replies (no external AI needed)
    const body = lastMsg.body.toLowerCase();
    let replies: string[] = [];

    if (body.includes("interview") || body.includes("schedule")) {
      replies = [
        "That time works great for me!",
        "Could we reschedule to later in the week?",
        "I'll send a calendar invite shortly.",
      ];
    } else if (body.includes("offer") || body.includes("salary") || body.includes("compensation")) {
      replies = [
        "Thank you, I'll review the offer carefully.",
        "I'd like to discuss the compensation package further.",
        "Could we set up a call to go over the details?",
      ];
    } else if (body.includes("thank") || body.includes("appreciate")) {
      replies = [
        "Thank you for the opportunity!",
        "I really appreciate your time.",
        "Looking forward to next steps.",
      ];
    } else {
      replies = [
        "Thanks for reaching out!",
        "I'd love to learn more about this role.",
        "When would be a good time to connect?",
      ];
    }

    return reply.send({ replies });
  });
}