import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { env } from "./env";
import { authRoutes } from "./routes/auth.routes";
import { jobRoutes } from "./routes/jobs.routes";
import { applicationRoutes } from "./routes/applications.routes";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: env.WEB_ORIGIN,
    credentials: true,
  });

  app.register(cookie);

  app.get("/health", async () => ({ status: "ok" }));

  app.register(authRoutes);
  app.register(jobRoutes);
  app.register(applicationRoutes);

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    reply.status(error.statusCode ?? 500).send({
      error: error.message ?? "Internal server error",
    });
  });

  return app;
}