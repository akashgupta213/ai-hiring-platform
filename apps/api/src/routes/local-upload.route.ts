/**
 * Local upload route — only used in development when S3 is not configured.
 * Receives the PDF file from the browser and saves it to disk.
 *
 * In production this route is never hit — the browser uploads directly to S3.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { saveLocalFile } from "../services/local-storage";
import { isLocalStorage } from "../services/local-storage";

export async function localUploadRoutes(fastify: FastifyInstance) {
  // Only register this route in local storage mode
  if (!isLocalStorage()) return;

  fastify.put(
    "/local-upload/:key",
    {
      config: { rawBody: true },
    },
    async (
      request: FastifyRequest<{ Params: { key: string } }>,
      reply: FastifyReply
    ) => {
      const key = decodeURIComponent(request.params.key);

      // Get raw body as buffer
      const body = request.body as Buffer;

      if (!body || body.length === 0) {
        return reply.status(400).send({ error: "Empty file body" });
      }

      try {
        await saveLocalFile(key, body);
        console.log(`[local-upload] Saved ${body.length} bytes to key: ${key}`);
        return reply.status(200).send({ ok: true });
      } catch (err: any) {
        console.error(`[local-upload] Failed to save file:`, err.message);
        return reply.status(500).send({ error: "Failed to save file" });
      }
    }
  );
}