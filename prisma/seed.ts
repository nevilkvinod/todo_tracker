const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create initial MANAGER user
  const managerEmail = 'admin@example.com'
  const existingManager = await prisma.user.findUnique({
    where: { email: managerEmail }
  })

  if (!existingManager) {
    const hashedPassword = await bcrypt.hash('password123', 10)
    const manager = await prisma.user.create({
      data: {
        name: 'System Admin',
        email: managerEmail,
        password: hashedPassword,
        role: 'MANAGER',
      }
    })
    console.log(`Created manager user: ${manager.email}`)
  } else {
    console.log('Manager user already exists')
  }

  // Create initial USER
  const userEmail = 'user@example.com'
  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail }
  })

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('password123', 10)
    const user = await prisma.user.create({
      data: {
        name: 'Regular User',
        email: userEmail,
        password: hashedPassword,
        role: 'USER',
      }
    })
    console.log(`Created regular user: ${user.email}`)
  } else {
    console.log('Regular user already exists')
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
