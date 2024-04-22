import { Request, Response, Router, NextFunction } from "express";
import { checkRole, verifyJWT } from "../../../middlewares/auth";
import { statusCodes } from "../../../../utils/constants/statusCodes";
import { appointmentService } from "../service/appointmentService";
import { roles } from "../../../../utils/constants/roles";

export const router = Router();

router.post(
    '/',
    verifyJWT,
    checkRole([roles.CLIENT]),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.CREATED).json(await appointmentService.create(req.body, req.user.id));
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
            res.status(statusCodes.SUCCESS).json(await appointmentService.getAppointmentById(req.params.id, req.user.id));
        } catch (error) {
            next(error);
        }
    }
)

router.get(
    '/byCustomer/:customerId',
    verifyJWT,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.SUCCESS).json(await appointmentService.getAppointmentsByCustomerId(req.params.customerId));
        } catch (error) {
            next(error);
        }
    }
)

router.put(
    '/cancel/:appointmentId',
    verifyJWT,
    checkRole([roles.CLIENT]),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(statusCodes.SUCCESS).json(await appointmentService.cancelAppointment(req.params.appointmentId, req.user.id));
        } catch (error) {
            next(error);
        }
    }
)
