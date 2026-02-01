
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const username = 'Traveler';
  const user = await prisma.user.findUnique({
    where: { username },
  });
  console.log(`Searching for '${username}':`, user ? 'Found' : 'Not Found');
  
  // Try case insensitive search if not found
  if (!user) {
    const allUsers = await prisma.user.findMany();
    console.log('All users:', allUsers.map(u => u.username));
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
