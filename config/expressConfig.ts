import dotenv from 'dotenv'
import express, { Express } from 'express'

dotenv.config();
export const app: Express = express();

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());