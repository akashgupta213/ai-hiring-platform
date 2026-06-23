import { z } from "zod";

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  recruiterId: z.string().uuid(),
  recruiterName: z.string(),
  recruiterRole: z.string(),
  recruiterAvatar: z.string().url(),
  jobId: z.string().uuid().nullable(),
  lastMessagePreview: z.string(),
  lastMessageAt: z.string().datetime(),
  unreadCount: z.number().int().nonnegative(),
  online: z.boolean(),
});

export const MessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  senderRole: z.enum(["candidate", "recruiter"]),
  body: z.string(),
  createdAt: z.string().datetime(),
  readAt: z.string().datetime().nullable(),
});

export const SendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1).max(4000),
});

export type Conversation = z.infer<typeof ConversationSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type SendMessage = z.infer<typeof SendMessageSchema>;