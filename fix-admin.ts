import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function fix() {
  const hash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: hash, role: 'MANAGER' },
    create: { 
      name: 'System Admin', 
      email: 'admin@example.com', 
      password: hash, 
      role: 'MANAGER' 
    }
  });
  console.log('Admin user fixed/created');
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
