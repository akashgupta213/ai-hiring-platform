import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../lib/jwt";

// Drop this in any route's `preHandler` to require a logged-in user.
// It reads the httpOnly "accessToken" cookie (never touched by frontend JS,
// which is what protects it from XSS token theft) and attaches the
// decoded user onto `request.user` for the route to use.
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies.accessToken;
  if (!token) {
    return reply.status(401).send({ error: "Not authenticated" });
  }
  try {
    request.user = verifyAccessToken(token);
  } catch {
    return reply.status(401).send({ error: "Session expired, please log in again" });
  }
}
