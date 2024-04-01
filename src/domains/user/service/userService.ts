import { User } from '@prisma/client'
import { Prisma } from '../../../../config/expressConfig';

class UserService {
    async create(data: Omit<User, 'id'>) {
        return Prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone,
                role: data.role
            }
        });
    }

    async get() {
        return Prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                password: false,
                role: true,
                phone: true
            }
        });
    }

    async put(data: Omit<User, 'password' | 'role'>) {
        return Prisma.user.update({
            where: {
                id: data.id
            },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
            }
        })
    }
};

export const userService = new UserService;