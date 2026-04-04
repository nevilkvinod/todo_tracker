require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tracker'
});
prisma.user.findUnique({ where: { email: 'admin@example.com' } })
  .then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
