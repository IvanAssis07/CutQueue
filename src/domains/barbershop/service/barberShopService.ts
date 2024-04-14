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

        if (owner.role !== roles.OWNER) {
            throw new ConflictError('Este tipo de usuário não pode cadastrar barbearia.');
        }

        const barbershop = await Prisma.barbershop.findUnique({
            where: {
                ownerId: data.ownerId
            }
        });

        if (barbershop) {
            throw new ConflictError('Este usuário já possui uma barbearia cadastrada.');
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

    async delete(barbershopId: string, loggedUserId: string, loggedUserRole: string) {
        const barbershop = await Prisma.barbershop.findUnique({
            where: {
                id: barbershopId
            }
        });

        if (!barbershop) {
            throw new InvalidParamError(`Barbearia com id:${barbershopId} não encontrada.`);
        }

        if (loggedUserRole !== roles.ADMIN && barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('Você não tem permissão para deletar essa barbearia.');
        }

        await Prisma.barbershop.delete({
            where: {
                id: barbershopId
            }
        });
    }
}

export const barberShopService = new BarbershopService;