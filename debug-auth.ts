
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = 'admin'; // Changed to admin
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    console.log(`User ${username} not found in DB`);
    return;
  }

  console.log('User found:', {
    id: user.id,
    username: user.username,
    passwordHash: user.password,
  });

  const testPassword = 'wrongpassword';
  const isMatch = await bcrypt.compare(testPassword, user.password);
  console.log(`Comparing with '${testPassword}':`, isMatch);

  const correctPassword = 'admin123'; // Changed to admin default password
  const isMatchCorrect = await bcrypt.compare(correctPassword, user.password);
  console.log(`Comparing with '${correctPassword}':`, isMatchCorrect);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
