import {Request, Response, Router, NextFunction} from 'express';
import { userService } from '../service/userService';
import { User } from '@prisma/client';
import { statusCodes } from '../../../../utils/constants/statusCodes';

export const router = Router();

router.post('/', async(req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(statusCodes.CREATED).json(await userService.create(req.body));
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userService.get();
        res.status(statusCodes.ACCEPTED).json(users);
    } catch (error) {
        next(error);
    }
});
