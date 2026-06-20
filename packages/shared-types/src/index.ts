// Single source of truth for shapes shared between apps/web and apps/api.
// Both sides import the SAME schema, so a validation rule only has to be
// written once and the frontend form + backend route can never drift apart.
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
