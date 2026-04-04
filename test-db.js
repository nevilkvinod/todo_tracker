const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log("Database connected! User count:", userCount);
  } catch (err) {
    console.error("Prisma Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
