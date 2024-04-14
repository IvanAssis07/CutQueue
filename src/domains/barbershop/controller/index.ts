import { Request, Response, Router, NextFunction } from 'express';
import { notLoggedIn, loginMiddleware, verifyJWT, checkRole } from '../../../middlewares/auth';
import { statusCodes } from '../../../../utils/constants/statusCodes';
import { roles } from '../../../../utils/constants/roles';
import { barverShopService } from '../service/barberShopService';

export const router = Router();

router.post(
    '/',
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.CREATED).json(await barverShopService.create(req.body, req.user.id));
        } catch (error) {
            next(error);
        }
    }
)

router.get(
    '/',
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.SUCCESS).json(await barverShopService.getAll());
        } catch (error) {
            next(error);
        }
    }
)

router.get(
    '/:id',
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.SUCCESS).json(await barverShopService.getById(req.params.id));
        } catch (error) {
            next(error);
        }
    }
)

router.put(
    '/:id',
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.NO_CONTENT).json(await barverShopService.update(req.body, req.params.id, req.user.id));
        } catch (error) {
            next(error);
        }
    }
)

router.delete(
    '/:id',
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.NO_CONTENT).json(await barverShopService.delete(req.params.id, req.user.id));
        } catch (error) {
            next(error);
        }
    }
)