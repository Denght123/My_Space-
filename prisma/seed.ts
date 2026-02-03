import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      nickname: 'Admin User',
      slogan: 'Welcome to my minimal blog',
      aboutMe: '# About Me\n\nThis is the default about page.',
    },
  })

  console.log({ user })

  // 2. Create default site config
  const siteConfig = await prisma.siteConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      siteName: 'MySpace',
    },
  })

  console.log({ siteConfig })
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
