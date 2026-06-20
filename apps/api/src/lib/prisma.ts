import { PrismaClient } from "@prisma/client";

// One PrismaClient instance for the whole process — avoids exhausting the
// Postgres connection pool by creating a new client per request.
export const prisma = new PrismaClient();
