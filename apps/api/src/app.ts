import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { env } from "./env";
import { authRoutes } from "./routes/auth.routes";
import { jobRoutes } from "./routes/jobs.routes";
import { applicationRoutes } from "./routes/applications.routes";
import { conversationRoutes } from "./routes/conversations.routes";
import { resumeRoutes } from "./routes/resume.routes";
import { localUploadRoutes } from "./routes/local-upload.route";

export function buildApp() {
  const app = Fastify({ logger: true });

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.register(cors, {
    origin: env.WEB_ORIGIN,
    credentials: true,
  });

  app.register(cookie);

  // ── Raw body support for local file uploads ────────────────────────────────
  // This lets Fastify receive binary PDF data from the browser PUT request
  app.addContentTypeParser(
    "application/pdf",
    { parseAs: "buffer" },
    (_req, body, done) => {
      done(null, body);
    }
  );

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.get("/health", async () => ({ status: "ok" }));
  app.register(authRoutes);
  app.register(jobRoutes);
  app.register(applicationRoutes);
  app.register(conversationRoutes);
  app.register(resumeRoutes);
  app.register(localUploadRoutes); // ← handles browser → local disk uploads

  // ── Error Handler ──────────────────────────────────────────────────────────
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    reply.status(error.statusCode ?? 500).send({
      error: error.message ?? "Internal server error",
    });
  });

  return app;
}