import prisma from "../../../../config/integration-setup";
import { userService } from "./userService";
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { ConflictError } from "../../../../errors/ConflictError";
import { roles } from "../../../../utils/constants/roles";

beforeEach(async () => {
    await prisma.user.deleteMany();
});

describe('Tests for create method', function () {
    test('should create an user', async () => {
        const userData = {
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            phone: '123456789',
            role: roles.ADMIN
        };

        const createdUser = await userService.create(userData);

        expect(createdUser).toBeDefined();
        expect(createdUser.id).toBeTruthy();

        const fetchedUser = await prisma.user.findUnique({ where: { id: createdUser.id } });
        expect(fetchedUser).toBeDefined();
        });

    test('should throw an error if email already exists', async () => {
        const userData = {
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            phone: '123456789',
            role: roles.ADMIN
        };

        await userService.create(userData);

        // Criando um usuário com o email já existente
        await expect(userService.create(userData)).rejects.toThrow(new ConflictError('Email já existente no sistema!'))
    })
});

describe('Tests getProfile method', function () {
    test('should return user profile', async () => {
        const userData = {
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            phone: '123456789',
            role: roles.ADMIN
        };

        const createdUser = await userService.create(userData);

        const fetchedUser = await userService.getProfile(createdUser.id);

        expect(fetchedUser).toBeDefined();
        expect(fetchedUser?.email).toBe(userData.email);

        const allUsers = await userService.get();
        expect(allUsers).toHaveLength(1);
    });
});

describe('Test for delete method', function () {
    test('should delete an user', async () => {
        const userData = {
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            phone: '123456789',
            role: roles.ADMIN
        };

        const createdUser = await userService.create(userData);

        await expect(userService.delete(createdUser.id, createdUser.id, roles.CLIENT)).resolves.not.toThrow();
    });

    test('should throw error when user not found', async () => {
        await expect(userService.delete('1', '1', roles.CLIENT)).rejects.toThrow(new InvalidParamError(`User with id:1 not found.`));
    });

    test('should throw error when user try to delete another user', async () => {
        const userData = {
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            phone: '123456789',
            role: roles.ADMIN
        };

        const createdUser = await userService.create(userData);

        await expect(userService.delete(createdUser.id, '2', roles.CLIENT)).rejects.toThrow(new PermissionError('You do not have permission to perform this action.'));
    })
});
