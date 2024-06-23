import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  if (process.env.DATABASE_URL?.includes('test.db')) {
    await prisma.$connect();
  }
});

export default prisma;