/**
 * Local file storage — used when S3/R2 is not configured.
 * Saves files to apps/api/uploads/ on your local machine.
 * Switch to real S3 by adding AWS keys to .env
 */

import fs from "node:fs";
import path from "node:path";

// Saves to apps/api/uploads/
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

// Make sure the uploads folder exists
function ensureUploadsDir(subDir?: string) {
  const dir = subDir ? path.join(UPLOADS_DIR, subDir) : UPLOADS_DIR;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Generate a fake presigned URL for local storage.
 * Returns a URL pointing to your local API upload endpoint.
 */
export function getLocalUploadUrl(key: string): string {
  // Encode the key so it's URL-safe
  const encoded = encodeURIComponent(key);
  return `http://localhost:3001/local-upload/${encoded}`;
}

/**
 * Save a buffer to local disk.
 * key format: "resumes/userId/timestamp_filename.pdf"
 */
export async function saveLocalFile(key: string, buffer: Buffer): Promise<void> {
  const parts = key.split("/");
  const filename = parts.pop()!;
  const subDir = parts.join("/");

  const dir = ensureUploadsDir(subDir);
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, buffer);
  console.log(`[local-storage] Saved file to ${filepath}`);
}

/**
 * Read a file from local disk by its key.
 */
export async function readLocalFile(key: string): Promise<Buffer> {
  const filepath = path.join(UPLOADS_DIR, key);

  if (!fs.existsSync(filepath)) {
    throw new Error(`Local file not found: ${filepath}`);
  }

  return fs.readFileSync(filepath);
}

/**
 * Delete a file from local disk.
 */
export async function deleteLocalFile(key: string): Promise<void> {
  const filepath = path.join(UPLOADS_DIR, key);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}

export function isLocalStorage(): boolean {
  return (
    !process.env.AWS_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID.trim() === "" ||
    process.env.USE_LOCAL_STORAGE === "true"
  );
}