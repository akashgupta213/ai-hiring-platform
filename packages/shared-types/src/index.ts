import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["candidate", "company"]),
    companyName: z.string().min(2, "Company name is too short").optional(),
  })
  .refine((data) => data.role !== "company" || !!data.companyName, {
    message: "Company name is required",
    path: ["companyName"],
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthUser {
  id: string;
  email: string;
  role: "candidate" | "company";
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

export const createJobSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  description: z.string().min(10, "Description is too short"),
  skillsRequired: z.array(z.string()).min(1, "Add at least one skill"),
  status: z.enum(["draft", "open"]).default("open"),
});

export const updateJobStatusSchema = z.object({
  status: z.enum(["draft", "open", "closed"]),
});

export const jobsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["draft", "open", "closed"]).optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>;
export type JobsQuery = z.infer<typeof jobsQuerySchema>;