import { Request, Response, Router, NextFunction } from 'express';
import { userService } from '../service/userService';
import { statusCodes } from '../../../../utils/constants/statusCodes';
import { notLoggedIn, loginMiddleware, verifyJWT, checkRole } from '../../../middlewares/auth';
import { roles } from '../../../../utils/constants/roles';

export const router = Router();

router.post('/login', notLoggedIn, loginMiddleware);

router.post(
    '/logout', 
    verifyJWT, 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.clearCookie('jwt').status(statusCodes.NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    '/', 
    async(req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.CREATED).json(await userService.create(req.body));
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    '/', 
    verifyJWT,
    checkRole([roles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await userService.get();
            res.status(statusCodes.ACCEPTED).json(users);
        } catch (error) {
            next(error);
        }   
    }
);

router.get(
    '/:id',
    verifyJWT, 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await userService.getProfile(req.params.id);
            res.status(statusCodes.SUCCESS).json(users);
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    '/:id',
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await userService.update(req.body, req.params.id, req.user.id);
            res.status(statusCodes.NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
);

router.delete(
    '/:id',
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await userService.delete(req.params.id, req.user.id, req.user.role);
            res.status(statusCodes.NO_CONTENT).end();
        } catch (error) {
            next(error);
        }
    }
)