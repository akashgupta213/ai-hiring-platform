import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  isLocalStorage,
  getLocalUploadUrl,
  saveLocalFile,
  readLocalFile,
  deleteLocalFile,
} from "./local-storage";

// ─── S3 Client ────────────────────────────────────────────────────────────────

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "auto",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "placeholder",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "placeholder",
  },
  ...(process.env.S3_ENDPOINT
    ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true }
    : {}),
});

const BUCKET = process.env.S3_BUCKET_NAME ?? "local";

// ─── Presigned Upload URL ─────────────────────────────────────────────────────

/**
 * Generate a presigned URL for direct browser-to-S3 upload.
 * Falls back to local storage URL if no S3 keys configured.
 */
export async function getUploadPresignedUrl(
  key: string,
  contentType: string,
  expiresIn = 600
): Promise<string> {
  // ── Local storage fallback ──────────────────────────────────────────────────
  if (isLocalStorage()) {
    console.log(`[storage] Using local storage for key: ${key}`);
    return getLocalUploadUrl(key);
  }

  // ── Real S3/R2 ──────────────────────────────────────────────────────────────
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

// ─── Download File as Buffer ──────────────────────────────────────────────────

/**
 * Download a file from S3 or local disk and return it as a Buffer.
 */
export async function downloadFromS3(key: string): Promise<Buffer> {
  // ── Local storage fallback ──────────────────────────────────────────────────
  if (isLocalStorage()) {
    return readLocalFile(key);
  }

  // ── Real S3/R2 ──────────────────────────────────────────────────────────────
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const response = await s3.send(command);

  if (!response.Body) {
    throw new Error(`Empty response body for S3 key: ${key}`);
  }

  const chunks: Uint8Array[] = [];
  const stream = response.Body as NodeJS.ReadableStream;

  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

// ─── Upload Buffer ────────────────────────────────────────────────────────────

/**
 * Upload a buffer to S3 or local disk.
 */
export async function uploadToS3(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  // ── Local storage fallback ──────────────────────────────────────────────────
  if (isLocalStorage()) {
    return saveLocalFile(key, buffer);
  }

  // ── Real S3/R2 ──────────────────────────────────────────────────────────────
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await s3.send(command);
}

// ─── Delete Object ────────────────────────────────────────────────────────────

export async function deleteFromS3(key: string): Promise<void> {
  if (isLocalStorage()) {
    return deleteLocalFile(key);
  }

  const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
  await s3.send(command);
}

// ─── Key Generators ───────────────────────────────────────────────────────────

export function resumeS3Key(candidateId: string, filename: string): string {
  const timestamp = Date.now();
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `resumes/${candidateId}/${timestamp}_${safe}`;
}

export function videoS3Key(
  answerId: string,
  chunkIndex: number,
  extension = "webm"
): string {
  return `videos/${answerId}/chunk_${chunkIndex}.${extension}`;
}

export { s3, BUCKET };