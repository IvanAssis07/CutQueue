import { Prisma } from "../../../../config/expressConfig";
import { Service } from "@prisma/client";
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { generateJWT } from "../../../middlewares/auth";
import { ConflictError } from "../../../../errors/ConflictError";

class ServiceService {
    async create(data: Omit<Service, 'id'>, ownerId: string) {
        const barbershop = await Prisma.barbershop.findUnique({
            where: {
                id: data.barbershopId
            }
        });

        if (!barbershop) {
            throw new InvalidParamError(`Barbearia com id: ${data.barbershopId} não encontrada.`);
        }

        if (barbershop.ownerId !== ownerId) {
            throw new PermissionError('Você não tem permissão para criar serviços nesta barbearia.');
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
            throw new InvalidParamError(`Barbearia com id: ${barbershopId} não encontrada.`);
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
            throw new InvalidParamError(`Serviço com id: ${serviceId} não encontrado.`);
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
            throw new InvalidParamError(`Serviço com id: ${serviceId} não encontrado.`);
        }

        if (!service.barbershop) {
            throw new ConflictError(`Barbearia com não encontrada.`);
        }

        if (service.barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('Você não tem permissão para editar este serviço.');
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
            throw new InvalidParamError(`Serviço com id: ${serviceId} não encontrado.`);
        }

        if (!service.barbershop) {
            throw new ConflictError(`Barbearia com não encontrada.`);
        }

        if (service.barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('Você não tem permissão para deletar este serviço.');
        }

        await Prisma.service.delete({
            where: {
                id: serviceId
            }
        });
    }
}

export const serviceService = new ServiceService;