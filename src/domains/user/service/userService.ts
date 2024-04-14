import { User } from '@prisma/client'
import { Prisma } from '../../../../config/expressConfig';
import { InvalidParamError } from '../../../../errors/InvalidParamError';
import { ConflictError } from '../../../../errors/ConflictError';
import { getEnv } from '../../../../utils/functions/getEnv';
import bcrypt from "bcrypt";
import { PermissionError } from '../../../../errors/PermissionError';
import { roles } from '../../../../utils/constants/roles';

class UserService {
    async create(data: Omit<User, 'id'>) {
        const user = await Prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (user) {
            throw new ConflictError('Email já existente no sistema!')
        }
  
        const hashedPassword = await bcrypt.hash(data.password, parseInt(getEnv('SALT_ROUNDS')))

        return Prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                phone: data.phone,
                role: data.role
            },
            select: {
                id: true
            }
        });
    }

    async get() {
        return Prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true
            }
        });
    }

    async getProfile(id: string) {
        return Prisma.user.findUniqueOrThrow({
            where: {
                id: id
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true
            }
        }).catch(() => { throw new InvalidParamError(`Usuário ${id} não encontrado.`) });
    }

    async update(data: Omit<User, 'role'| 'id'>, userId: string, loggedUserId: string) {
        const user = await Prisma.user.findUnique({
            where: {
                id: userId
            }
        });
    
        if (!user) {
            throw new InvalidParamError(`Usuário com id:${userId} não encontrado.`);
        }

        if (user.id !== loggedUserId) {
            throw new PermissionError('Você não tem permissão para executar esta ação.')
        } 

        if (data.password) {
            data.password = await bcrypt.hash(data.password, parseInt(getEnv('SALT_ROUNDS')))
        }

        Prisma.user.update({
            where: {
                id: userId
            },
            data: {
                name: data.name,
                password: data.password,
                email: data.email,
                phone: data.phone,
            }
        })
    }

    async delete(userId: string, loggedUserId: String, loggedUserRole: string) {
        const user = await Prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new InvalidParamError(`Usuário com id:${userId} não encontrado.`);
        }

        if (loggedUserRole !== roles.ADMIN && user.id !== loggedUserId) {
            throw new PermissionError('Você não tem permissão para executar esta ação.')
        } 

        await Prisma.user.delete({
            where: {
                id: userId
            }
        })
    }
};

export const userService = new UserService;