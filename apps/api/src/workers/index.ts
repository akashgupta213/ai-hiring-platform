/**
 * Worker Entry Point
 *
 * Start this process separately from the main API server.
 * It runs all BullMQ workers for the AI pipeline.
 *
 * Usage:
 *   npx tsx src/workers/index.ts
 *   (or add to package.json: "workers": "tsx src/workers/index.ts")
 */

import { resumeParseWorker } from "./resume.worker";
import { embedWorker } from "./embed.worker";
import { jobEmbedWorker } from "./job-embed.worker";

const workers = [resumeParseWorker, embedWorker, jobEmbedWorker];

console.log("🚀 AI Pipeline Workers started:");
console.log("  ✓ resume-parse worker");
console.log("  ✓ resume-embed worker");
console.log("  ✓ job-embed worker");

// Graceful shutdown
async function shutdown() {
  console.log("\n⏳ Shutting down workers...");
  await Promise.all(workers.map((w) => w.close()));
  console.log("✅ All workers closed");
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Keep process alive
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception in worker:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection in worker:", reason);
});