import { Prisma } from "../../../../config/expressConfig";
import { Service } from "@prisma/client";
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { generateJWT } from "../../../middlewares/auth";
import { ConflictError } from "../../../../errors/ConflictError";

class ServiceService {
    async create(data: Omit<Service, 'id'>, loggedUserId: string) {
        const barbershop = await Prisma.barbershop.findUnique({
            where: {
                id: data.barbershopId
            }
        });

        if (!barbershop) {
            throw new InvalidParamError(`Barbershop with id: ${data.barbershopId} not found.`);
        }

        if (barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('You do not have permission to create services for this barbershop.');
        }

        await Prisma.service.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                duration: data.duration,
                barbershopId: data.barbershopId
            },
            select: {
                id: true
            }
        });
    }

    async getAllServicesFromBarbershop(barbershopId: string) {
        const barbershop = await Prisma.barbershop.findUnique({
            where: {
                id: barbershopId
            }
        });

        if (!barbershop) {
            throw new InvalidParamError(`Barbershop with id: ${barbershopId} not found.`);
        }
        
        const services =  await Prisma.service.findMany({
            where: {
                barbershopId: barbershopId
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                duration: true
            }
        });

        return services;
    }

    async getServiceById(serviceId: string) {
        const service = await Prisma.service.findUnique({
            where: {
                id: serviceId
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                duration: true
            }
        });

        if (!service) {
            throw new InvalidParamError(`Service with id: ${serviceId} not found.`);
        }

        return service;
    }

    async updateService(data: Omit<Service, 'id'>, serviceId: string, loggedUserId: string) {
        const service = await Prisma.service.findUnique({
            where: {
                id: serviceId,
            },
            select:{
                id: true,
                barbershop: {
                    select: {
                        ownerId: true
                    }
                }
            }
        });

        if (!service) {
            throw new InvalidParamError(`Service with id: ${serviceId} not found.`);
        }

        if (service.barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('You do not have permission to edit this service.');
        }

        await Prisma.service.update({
            where: {
                id: serviceId
            },
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                duration: data.duration
            }
        });
    }

    async delete(serviceId: string, loggedUserId: string) {
        const service = await Prisma.service.findUnique({
            where: {
                id: serviceId
            },
            select: {
                id: true,
                barbershop: {
                    select: {
                        ownerId: true
                    }
                }
            }
        });

        if (!service) {
            throw new InvalidParamError(`Service with id: ${serviceId} not found.`);
        }

        if (service.barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('You do not have permission to delete this service.');
        }

        await Prisma.service.delete({
            where: {
                id: serviceId
            }
        });
    }
}

export const serviceService = new ServiceService;