import { buildApp } from "./app";
import { env } from "./env";
import { Server } from "socket.io";

async function main() {
  const app = buildApp();

  await app.ready();

  // Attach socket.io to the underlying Node http server
  const io = new Server(app.server, {
    cors: {
      origin: env.WEB_ORIGIN,
      credentials: true,
    },
  });

  // Make io accessible inside route handlers via app.io
  (app as any).io = io;

  io.on("connection", (socket) => {
    socket.on("conversation:join", ({ conversationId }: { conversationId: string }) => {
      socket.join(`conversation:${conversationId}`);
    });
    socket.on("conversation:leave", ({ conversationId }: { conversationId: string }) => {
      socket.leave(`conversation:${conversationId}`);
    });
  });

  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  console.log(`API running on http://localhost:${env.PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});