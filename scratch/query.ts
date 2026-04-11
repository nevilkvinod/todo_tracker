import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'User';
    `);
    console.log("INDEXES ON USER TABLE:");
    console.log(result);
    
    const users = await prisma.user.findMany({ select: { id: true, email: true, deletedAt: true } });
    console.log("USERS:");
    console.log(users);
  } catch (error) {
    console.error("Error executing SQL:", error);
  }
}

main().finally(() => prisma.$disconnect());
