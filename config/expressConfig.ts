import dotenv from 'dotenv'
import express, { Express } from 'express'
import { PrismaClient } from '@prisma/client';

dotenv.config();
export const app: Express = express();
export const Prisma: PrismaClient = new PrismaClient();

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

import { router as userRouter } from '../src/domains/user/controller';
app.use('/api/users', userRouter);