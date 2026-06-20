import "fastify";
import type { AuthUser } from "@ai-hiring/shared-types";

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
  }
}
