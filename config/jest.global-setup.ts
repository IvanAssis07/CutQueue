import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = 'file:./test.db';

const prisma = new PrismaClient();

module.exports = async () => {
  execSync('npx prisma migrate dev --schema=./prisma/schema.prisma', {
    stdio: 'inherit',
  });

  await prisma.$disconnect();
};