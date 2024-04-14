import { Barbershop } from "@prisma/client";
import { Prisma } from "../../../../config/expressConfig";
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { roles } from '../../../../utils/constants/roles';
import { ConflictError } from "../../../../errors/ConflictError";

class BarbershopService {
    async create(data: Omit<Barbershop, 'id'>, loggedUserId: string) {
        if (loggedUserId !== data.ownerId) {
            throw new PermissionError('Você não tem permissão para criar uma barbearia para outro usuário.');
        }
        
        const owner = await Prisma.user.findUnique({
            where: {
                id: data.ownerId
            }
        });

        if (!owner) {
            throw new InvalidParamError(`Usuário com id:${data.ownerId} não encontrado.`);
        }

        if (owner.role === roles.OWNER) {
            throw new ConflictError('Um usuário só pode ser dono de uma barbearia.');
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

        await Prisma.user.update({
            where: {
                id: data.ownerId
            },
            data: {
                role: roles.OWNER
            }
        });
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
                id
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
            throw new InvalidParamError(`Barbearia com id: ${id} não encontrada.`);
        }
    }

    async update(data: Omit<Barbershop, 'id' | 'ownerId'>, barbershopId: string, loggedUserId: string) {
        const barbershop = await Prisma.barbershop.findUnique({
            where: {
                id: barbershopId
            }
        });

        if (!barbershop) {
            throw new InvalidParamError(`Barbearia com id:${barbershopId} não encontrada.`);
        }

        if (barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('Você não tem permissão para editar essa barbearia.');
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

    async delete(barbershopId: string, loggedUserId: string) {
        const barbershop = await Prisma.barbershop.findUnique({
            where: {
                id: barbershopId
            }
        });

        if (!barbershop) {
            throw new InvalidParamError(`Barbearia com id:${barbershopId} não encontrada.`);
        }

        if (barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('Você não tem permissão para deletar essa barbearia.');
        }

        await Prisma.barbershop.delete({
            where: {
                id: barbershopId
            }
        });

        await Prisma.user.update({
            where: {
                id: loggedUserId
            },
            data: {
                role: roles.CLIENT
            }
        });
    }
}

export const barverShopService = new BarbershopService;