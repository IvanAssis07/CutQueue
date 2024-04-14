import { Request, Response, Router, NextFunction } from 'express';
import { serviceService } from "../service/serviceService";
import { checkRole, verifyJWT } from '../../../middlewares/auth';
import { statusCodes } from "../../../../utils/constants/statusCodes";
import { roles } from '../../../../utils/constants/roles';

export const router = Router();

router.post(
    '/',
    verifyJWT,
    checkRole([roles.OWNER]),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.CREATED).json(await serviceService.create(req.body, req.user.id));
        } catch (error) {
            next(error);
        }
    }
)

router.get(
    '/servicesFromBarbershop/:barbershopId', // TODO: pensar num nome melhor para a rota
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.SUCCESS).json(await serviceService.getAllServicesFromBarbershop(req.params.barbershopId));
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
            res.status(statusCodes.SUCCESS).json(await serviceService.getServiceById(req.params.id));
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
            res.status(statusCodes.SUCCESS).json(await serviceService.updateService(req.body, req.params.id, req.user.id));
        } catch (error) {
            next(error);
        }
    }
)

router.delete(
    '/:id',
    verifyJWT,
    checkRole([roles.OWNER]),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await serviceService.delete(req.params.id, req.user.id);
            res.status(statusCodes.NO_CONTENT).send();
        } catch (error) {
            next(error);
        }
    }
)