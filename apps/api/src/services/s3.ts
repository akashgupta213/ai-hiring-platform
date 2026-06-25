import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─── S3 Client ─────────────────────────────────────────────────────────────────

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // Support Cloudflare R2 or other S3-compatible stores
  ...(process.env.S3_ENDPOINT
    ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true }
    : {}),
});

const BUCKET = process.env.S3_BUCKET_NAME!;

// ─── Presigned Upload URL ───────────────────────────────────────────────────────

/**
 * Generate a presigned URL for direct browser-to-S3 upload.
 * Expires in 10 minutes by default.
 */
export async function getUploadPresignedUrl(
  key: string,
  contentType: string,
  expiresIn = 600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

// ─── Download File as Buffer ────────────────────────────────────────────────────

/**
 * Download a file from S3 and return it as a Buffer.
 * Used by workers that need to process files (resume PDF, video).
 */
export async function downloadFromS3(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const response = await s3.send(command);

  if (!response.Body) {
    throw new Error(`Empty response body for S3 key: ${key}`);
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  const stream = response.Body as NodeJS.ReadableStream;

  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

// ─── Upload Buffer to S3 ───────────────────────────────────────────────────────

/**
 * Upload a buffer directly to S3. Used for server-side uploads.
 */
export async function uploadToS3(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await s3.send(command);
}

// ─── Delete Object ─────────────────────────────────────────────────────────────

export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
  await s3.send(command);
}

// ─── Key Generators ────────────────────────────────────────────────────────────

/**
 * Generate a unique S3 key for a resume PDF.
 */
export function resumeS3Key(candidateId: string, filename: string): string {
  const timestamp = Date.now();
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `resumes/${candidateId}/${timestamp}_${safe}`;
}

/**
 * Generate a unique S3 key for a video answer chunk.
 */
export function videoS3Key(
  answerId: string,
  chunkIndex: number,
  extension = "webm"
): string {
  return `videos/${answerId}/chunk_${chunkIndex}.${extension}`;
}

export { s3, BUCKET };