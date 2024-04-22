import { Barbershop } from "@prisma/client";
import { Prisma } from "../../../../config/expressConfig";
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { roles } from '../../../../utils/constants/roles';
import { ConflictError } from "../../../../errors/ConflictError";

class BarbershopService {
    async create(data: Omit<Barbershop, 'id'>, loggedUserId: string) {
        if (loggedUserId !== data.ownerId) {
            throw new PermissionError('You do not have permission to create a barbershop for another user.');
        }
        
        const owner = await Prisma.user.findUnique({
            where: {
                id: data.ownerId
            }
        });

        if (!owner) {
            throw new InvalidParamError(`User with id:${data.ownerId} not found.`);
        }

        if (owner.role !== roles.OWNER) {
            throw new ConflictError('A user with this role can not create a barbershop.');
        }

        const barbershop = await Prisma.barbershop.findUnique({
            where: {
                ownerId: data.ownerId
            }
        });

        if (barbershop) {
            throw new ConflictError('This user already has a registered barbershop.');
        }

        await Prisma.barbershop.create({
            data: {
                name: data.name,
                description: data.description,
                address: data.address,
                phone: data.phone,
                ownerId: data.ownerId
            },
            select: {
                id: true
            }
        });
    }

    async getBarbershopFromOwnerId (ownerId: string) {
        return await Prisma.barbershop.findFirstOrThrow({
            where: {
                ownerId: ownerId
            }
        }).catch(() => { throw new InvalidParamError(`Barbershop with owner ${ownerId} not found.`) });
    }

    async getAll() {
        return await Prisma.barbershop.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                address: true,
                phone: true,
                owner: {
                    select: {
                        name: true,
                        phone: true
                    }
                }
            }
        });
    }

    async getById(id: string) {
        const barbershop = await Prisma.barbershop.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                name: true,
                description: true,
                address: true,
                phone: true
            }
        });

        if (!barbershop) {
            throw new InvalidParamError(`Barbershop with: ${id} not found.`);
        }

        return barbershop;
    }

    async update(data: Omit<Barbershop, 'id' | 'ownerId'>, barbershopId: string, loggedUserId: string) {
        const barbershop = await Prisma.barbershop.findUnique({
            where: {
                id: barbershopId
            }
        });

        if (!barbershop) {
            throw new InvalidParamError(`Barbershop with: ${barbershopId} not found.`);
        }

        if (barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('You do no have permission to edit this barbershop.');
        }

        await Prisma.barbershop.update({
            where: {
                id: barbershopId
            },
            data: {
                name: data.name,
                description: data.description,
                address: data.address,
                phone: data.phone
            }
        });
    }

    async delete(barbershopId: string, loggedUserId: string, loggedUserRole: string) {
        const barbershop = await Prisma.barbershop.findUnique({
            where: {
                id: barbershopId
            }
        });

        if (!barbershop) {
            throw new InvalidParamError(`Barbershop with id:${barbershopId} not found.`);
        }

        if (loggedUserRole !== roles.ADMIN && barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('You do not have permission to delete this barbershop.');
        }

        await Prisma.barbershop.delete({
            where: {
                id: barbershopId
            }
        });
    }
}

export const barberShopService = new BarbershopService;