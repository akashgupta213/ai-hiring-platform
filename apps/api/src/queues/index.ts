import { Queue, QueueOptions } from "bullmq";

// ─── Redis Connection ───────────────────────────────────────────────────────────

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379"),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
};

// If using Upstash REDIS_URL, parse it
function getConnection() {
  if (process.env.REDIS_URL) {
    try {
      const url = new URL(process.env.REDIS_URL);
      return {
        host: url.hostname,
        port: parseInt(url.port) || 6380,
        password: url.password || url.username,
        tls: process.env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
      };
    } catch {
      return connection;
    }
  }
  return connection;
}

const queueOptions: QueueOptions = {
  connection: getConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 200,     // Keep last 200 failed jobs for debugging
  },
};

// ─── Queue Names ────────────────────────────────────────────────────────────────

export const QUEUE_NAMES = {
  RESUME_PARSE: "resume-parse",
  RESUME_EMBED: "resume-embed",
  JOB_EMBED: "job-embed",
  TRANSCRIBE: "transcribe",
  GRADE: "grade",
  SYNTHESIZE: "synthesize",
} as const;

// ─── Queue Instances ────────────────────────────────────────────────────────────

export const resumeParseQueue = new Queue(
  QUEUE_NAMES.RESUME_PARSE,
  queueOptions
);

export const resumeEmbedQueue = new Queue(
  QUEUE_NAMES.RESUME_EMBED,
  queueOptions
);

export const jobEmbedQueue = new Queue(QUEUE_NAMES.JOB_EMBED, queueOptions);

export const transcribeQueue = new Queue(QUEUE_NAMES.TRANSCRIBE, queueOptions);

export const gradeQueue = new Queue(QUEUE_NAMES.GRADE, queueOptions);

export const synthesizeQueue = new Queue(QUEUE_NAMES.SYNTHESIZE, queueOptions);

// ─── Job Data Types ─────────────────────────────────────────────────────────────

export interface ResumeParseJobData {
  resumeId: string;
  s3Key: string;
  candidateId: string;
  applicationId?: string;
}

export interface ResumeEmbedJobData {
  resumeId: string;
  rawText: string;
  applicationId?: string;
}

export interface JobEmbedJobData {
  jobId: string;
  title: string;
  description: string;
  skills: string[];
}

export interface TranscribeJobData {
  answerId: string;
  videoS3Key: string;
  applicationId: string;
}

export interface GradeJobData {
  answerId: string;
  question: string;
  rubric: string;
  transcript: string;
  applicationId: string;
}

export interface SynthesizeJobData {
  applicationId: string;
}

export { getConnection };