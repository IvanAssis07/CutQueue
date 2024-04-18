import { Request, Response, Router, NextFunction } from 'express';
import { checkRole, verifyJWT } from '../../../middlewares/auth';
import { statusCodes } from "../../../../utils/constants/statusCodes";
import { openingHoursService } from "../service/openingHoursService";
import { roles } from "../../../../utils/constants/roles";

export const router = Router();

router.post(
    '/',
    verifyJWT,
    checkRole([roles.OWNER]),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.CREATED).json(await openingHoursService.create(req.body, req.user.id));
        } catch (error) {
            next (error);
        }
    }
)

router.get(
    '/:barbershopId',
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.SUCCESS).json(await openingHoursService.getOpeningHoursFromBarbershop(req.params.barbershopId));
        } catch (error) {
            next (error);
        }
    }
)

router.put(
    '/:openingHoursId',
    verifyJWT,
    checkRole([roles.OWNER]),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.NO_CONTENT).json(await openingHoursService.updateOpeningHours(req.body, req.params.openingHoursId, req.user.id));
        } catch (error) {
            next (error);
        }
    }
)

router.delete(
    '/:openingHoursId',
    verifyJWT,
    checkRole([roles.OWNER, roles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.NO_CONTENT).json(await openingHoursService.deleteOpeningHours(req.params.openingHoursId, req.user.id));
        } catch (error) {
            next (error);
        }
    }
)

