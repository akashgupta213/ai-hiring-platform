import type { FastifyInstance, FastifyReply } from "fastify";
import { registerSchema, loginSchema, type AuthUser } from "@ai-hiring/shared-types";
import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../lib/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { requireAuth } from "../middleware/auth.middleware";
import { env } from "../env";

const COOKIE_OPTS = {
  httpOnly: true, // JS on the frontend can never read this — blocks XSS token theft
  secure: env.NODE_ENV === "production", // HTTPS-only once deployed
  sameSite: "lax" as const,
  path: "/",
};

// Issues both cookies and replies with the public user object.
// Centralized here so register/login/refresh all behave identically.
function issueSession(reply: FastifyReply, user: AuthUser) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user.id);

  return reply
    .setCookie("accessToken", accessToken, { ...COOKIE_OPTS, maxAge: 60 * 15 }) // 15 min
    .setCookie("refreshToken", refreshToken, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 }) // 7 days
    .status(200)
    .send({ user });
}

export async function authRoutes(app: FastifyInstance) {
  // Create account (candidate or company) → straight into a logged-in session
  app.post("/auth/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const { email, password, role, companyName } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ error: "An account with this email already exists" });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        ...(role === "company" && companyName
          ? { company: { create: { name: companyName } } }
          : {}),
      },
    });

    return issueSession(reply, { id: user.id, email: user.email, role: user.role });
  });

  // Email + password → session
  app.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    return issueSession(reply, { id: user.id, email: user.email, role: user.role });
  });

  // Access token expired (15 min)? Frontend calls this with the refresh
  // cookie to silently get a fresh access token, no re-login needed.
  app.post("/auth/refresh", async (request, reply) => {
    const token = request.cookies.refreshToken;
    if (!token) {
      return reply.status(401).send({ error: "No refresh token" });
    }
    try {
      const { id } = verifyRefreshToken(token);
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return reply.status(401).send({ error: "User not found" });
      }
      return issueSession(reply, { id: user.id, email: user.email, role: user.role });
    } catch {
      return reply.status(401).send({ error: "Refresh token expired, please log in again" });
    }
  });

  app.post("/auth/logout", async (_request, reply) => {
    reply.clearCookie("accessToken", COOKIE_OPTS);
    reply.clearCookie("refreshToken", COOKIE_OPTS);
    return { ok: true };
  });

  // Protected example route — proves requireAuth + cookies work end to end.
  app.get("/auth/me", { preHandler: requireAuth }, async (request) => {
    return { user: request.user };
  });
}
