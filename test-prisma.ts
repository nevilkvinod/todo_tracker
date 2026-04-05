import { PrismaClient } from '@prisma/client';
console.log("Instantiating PrismaClient...");
const prisma = new PrismaClient();

async function main() {
  console.log("Keys in prisma:", Object.keys(prisma).filter(k => !k.startsWith('_')));
  if (typeof prisma.loginActivity !== 'undefined') {
    console.log("loginActivity exists!");
  } else {
    console.log("loginActivity DOES NOT EXIST.");
  }
}
main().catch(console.error);
