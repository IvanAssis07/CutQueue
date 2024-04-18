import { Request, Response, Router, NextFunction } from 'express';
import { checkRole, verifyJWT } from '../../../middlewares/auth';
import { statusCodes } from '../../../../utils/constants/statusCodes';
import { barberShopService } from '../service/barberShopService';
import { roles } from '../../../../utils/constants/roles';

export const router = Router();

router.post(
    '/',
    verifyJWT,
    checkRole([roles.OWNER]),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.CREATED).json(await barberShopService.create(req.body, req.user.id));
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
            res.status(statusCodes.SUCCESS).json(await barberShopService.getAll());
        } catch (error) {
            next(error);
        }
    }
)

router.get(
    '/id/:id',
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.SUCCESS).json(await barberShopService.getById(req.params.id));
        } catch (error) {
            next(error);
        }
    }
)

router.get(
    '/owner/:ownerId',
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.SUCCESS).json(await barberShopService.getBarbershopFromOwnerId(req.params.ownerId));
        } catch (error) {
            next(error);
        }
    }
)

router.put(
    '/:id',
    verifyJWT,
    checkRole([roles.OWNER]),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.NO_CONTENT).json(await barberShopService.update(req.body, req.params.id, req.user.id));
        } catch (error) {
            next(error);
        }
    }
)

router.delete(
    '/:id',
    verifyJWT,
    checkRole([roles.OWNER, roles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.NO_CONTENT).json(await barberShopService.delete(req.params.id, req.user.id, req.user.role));
        } catch (error) {
            next(error);
        }
    }
)