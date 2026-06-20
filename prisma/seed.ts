// Quick local seed so you have two ready-made logins while building the UI.
// Run with: npm run db:seed
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const companyUser = await prisma.user.upsert({
    where: { email: "founder@acme.dev" },
    update: {},
    create: {
      email: "founder@acme.dev",
      passwordHash,
      role: UserRole.company,
      company: {
        create: {
          name: "Acme Inc.",
          industry: "Software",
        },
      },
    },
  });

  const candidateUser = await prisma.user.upsert({
    where: { email: "candidate@acme.dev" },
    update: {},
    create: {
      email: "candidate@acme.dev",
      passwordHash,
      role: UserRole.candidate,
    },
  });

  console.log("Seeded:");
  console.log(" company  ->", companyUser.email, "/ password123");
  console.log(" candidate->", candidateUser.email, "/ password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
