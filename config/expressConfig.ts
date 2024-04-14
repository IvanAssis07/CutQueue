import dotenv from 'dotenv'
import express, { Express } from 'express'
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';

dotenv.config();
export const app: Express = express();
export const Prisma: PrismaClient = new PrismaClient();

app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());
app.use(express.json());

import { router as userRouter } from '../src/domains/user/controller';
app.use('/api/users', userRouter);

import { router as barberShopRouter } from '../src/domains/barbershop/controller';
app.use('/api/barbershops', barberShopRouter);

import { router as serviceRouter } from '../src/domains/service/controller';
app.use('/api/services', serviceRouter)