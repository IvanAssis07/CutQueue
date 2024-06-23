import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import { Prisma } from "./expressConfig";

jest.mock('./expressConfig', () => ({
  __esModule: true,
  Prisma: mockDeep<PrismaClient>()
}));

beforeEach(() => {
  mockReset(Prisma);
});

export const prismaMock = Prisma as unknown as DeepMockProxy<PrismaClient>;