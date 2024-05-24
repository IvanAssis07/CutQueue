import { userService } from "./userService";
import { prismaMock } from "../../../../config/singleton";
import { Prisma } from '@prisma/client';
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { ConflictError } from "../../../../errors/ConflictError";
import { roles } from "../../../../utils/constants/roles";

describe('Tests for create method', function () {
    test('shouldnt create user with email already registred', async () => {

        const user = {
            id: '1',
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            phone: '123456789',
            role: roles.ADMIN,
        };

        const userRegistry = {
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            phone: '123456789',
            role: roles.ADMIN
        };

        prismaMock.user.findUnique.mockResolvedValue(user);

        await expect(userService.create(userRegistry)).rejects.toThrow(new ConflictError('Email já existente no sistema!'));
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: user.email } });
    });
    test('should create user', async () => {
        require('dotenv').config();

        const userRegistry = {
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            phone: '123456789',
            role: roles.ADMIN
        };


        await expect(userService.create(userRegistry)).resolves.not.toThrow();
    
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: userRegistry.email } });
        expect(prismaMock.user.create).toHaveBeenCalledWith({
            data: {
                name: userRegistry.name,
                email: userRegistry.email,
                password: expect.any(String),
                phone: userRegistry.phone,
                role: userRegistry.role
            },
            select: {
                id: true,
            },
        });
    }); 
});

describe('Tests for update profile method', function () {
    beforeAll(() => {
        require('dotenv').config();
    });
    test('should throw error when user not found', async () => {

        const userId = '1';
        const loggedUserId = '1';

        const user = {
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            phone: '123456789',
        };

        prismaMock.user.findUnique.mockResolvedValue(null);

        await expect(userService.update(user,userId,loggedUserId)).rejects.toThrow(new InvalidParamError(`User with ${userId} not found..`));
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    });

    test('should throw error when user try to update another user', async () => {

        const userId = '1';
        const loggedUserId = '2';

        const user = {
            id: '1',
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            phone: '123456789',
            role: roles.ADMIN,
        };

        prismaMock.user.findUnique.mockResolvedValue(user);

        await expect(userService.update(user,userId,loggedUserId)).rejects.toThrow(new PermissionError('You do not have permission to perform this action.'));
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    });

    test('should be able to update himself', async () => {

        const userId = '1';
        const loggedUserId = '1';

        const user = {
            id: '1',
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            phone: '123456789',
            role: roles.ADMIN,
        };

        prismaMock.user.findUnique.mockResolvedValue(user);

        await expect(userService.update(user,userId,loggedUserId)).resolves.not.toThrow();
        expect(prismaMock.user.update).toHaveBeenCalledWith({
            where: {
                id: userId
            },
            data: {
                name: user.name,
                email: user.email,
                password: expect.any(String),
                phone: user.phone,
            },
        });
    });
});
describe('Tests for delete method', function () {
    beforeAll(() => {
        require('dotenv').config();
    });
    test('should throw error when user not found', async () => {

        const userId = '1';
        const loggedUserId = '1';
        const loggedUserRole = roles.ADMIN;

        prismaMock.user.findUnique.mockResolvedValue(null);

        await expect(userService.delete(userId,loggedUserId,loggedUserRole)).rejects.toThrow(new InvalidParamError(`User with id:${userId} not found.`));
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    });

    test('should throw error when user is not admin', async () => {

        const userId = '1';
        const loggedUserId = '2';
        const loggedUserRole = roles.CLIENT;

        const user = {
            id: '1',
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            phone: '123456789',
            role: roles.ADMIN,
        };

        prismaMock.user.findUnique.mockResolvedValue(user);

        await expect(userService.delete(userId,loggedUserId,loggedUserRole)).rejects.toThrow(new PermissionError('You do not have permission to perform this action.'));
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    });

    test('shouldnt throw error when admin tries to delete himself', async () => {

        const userId = '1';
        const loggedUserId = '1';
        const loggedUserRole = roles.ADMIN;

        const user = {
            id: '1',
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            phone: '123456789',
            role: roles.ADMIN,
        };

        prismaMock.user.findUnique.mockResolvedValue(user);
        
        await expect(userService.delete(userId,loggedUserId,loggedUserRole)).resolves.not.toThrow();
        
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
        expect(prismaMock.user.delete).toHaveBeenCalledWith({
            where: {
                id: userId
            },
        });
    });

    test('should delete other user', async () => {

        const userId = '1';
        const loggedUserId = '2';
        const loggedUserRole = roles.ADMIN;

        const user = {
            id: '1',
            name: 'Test User',
            email: 'testeUser@mail.com',
            password: '123456',
            phone: '123456789',
            role: roles.ADMIN,
        };

        prismaMock.user.findUnique.mockResolvedValue(user);

        
        await expect(userService.delete(userId,loggedUserId,loggedUserRole)).resolves.not.toThrow();
        
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
        expect(prismaMock.user.delete).toHaveBeenCalledWith({
            where: {
                id: userId
            },
        });
    });
});