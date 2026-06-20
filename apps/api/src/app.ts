import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { env } from "./env";
import { authRoutes } from "./routes/auth.routes";

export function buildApp() {
  const app = Fastify({ logger: true });

  // Only the Next.js app's origin may call this API, and credentials:true
  // is required so the browser actually sends/receives our httpOnly cookies.
  app.register(cors, {
    origin: env.WEB_ORIGIN,
    credentials: true,
  });

  app.register(cookie);

  app.get("/health", async () => ({ status: "ok" }));

  app.register(authRoutes);

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    reply.status(error.statusCode ?? 500).send({
      error: error.message ?? "Internal server error",
    });
  });

  return app;
}
