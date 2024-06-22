import { execSync } from 'child_process';
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async () => {
  await prisma.$disconnect();

  // Resetando todas as tabelas no banco após rodar os testes
  execSync('npx prisma migrate reset --force', {
    stdio: 'ignore',
  });
};