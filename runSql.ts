import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "User_email_key";`);
    console.log("Dropped standard index.");
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "User_email_key" ON "User"("email") WHERE "deletedAt" IS NULL;`);
    console.log("Created partial unique index.");
  } catch (error) {
    console.error("Error executing SQL:", error);
  }
}

main().finally(() => prisma.$disconnect());
