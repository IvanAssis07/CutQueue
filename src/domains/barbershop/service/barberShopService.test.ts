import { prismaMock } from "../../../../config/singleton";
import { Prisma } from '@prisma/client';
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { ConflictError } from "../../../../errors/ConflictError";
import { ForbiddenError } from "../../../../errors/ForbiddenError";
import { barberShopService } from "./barberShopService";
import { roles } from '../../../../utils/constants/roles';

describe('Tests for create method', () => {
    test('Should create a barbershop', async () => {
        const loggedUserId = '1';

        const data = {
            name: 'Test barbershop',
            description: 'Test description',
            phone: '99999-9999',
            address: 'Test address',
            ownerId: loggedUserId
        }

        const owner = {
            id: loggedUserId,
            name: 'Owner',
            email: 'owner@email',
            password: 'password',
            phone: '99999-9999',
            role: roles.OWNER,
        }

        prismaMock.user.findUnique.mockResolvedValue(owner);
        prismaMock.barbershop.findUnique.mockResolvedValue(null);

        await expect(barberShopService.create(data, loggedUserId)).resolves.not.toThrow();

        expect(prismaMock.barbershop.create).toHaveBeenCalledWith({
            data: {
                name: data.name,
                description: data.description,
                phone: data.phone,
                address: data.address,
                ownerId: data.ownerId
            },
            select: {
                id: true
            }
        });
    });

    test('Should throw PermissionError if user tries to create a barbershop for another user', async () => {
        const loggedUserId = '1';

        const data = {
            name: 'Test barbershop',
            description: 'Test description',
            phone: '99999-9999',
            address: 'Test address',
            ownerId: 'Diferent user id'
        }

        expect(barberShopService.create(data, loggedUserId)).rejects.toThrow(PermissionError);
    });

    test('Should throw InvalidParamError if user does not exist', async () => {
        const loggedUserId = '1';

        const data = {
            name: 'Test barbershop',
            description: 'Test description',
            phone: '99999-9999',
            address: 'Test address',
            ownerId: loggedUserId
        }

        prismaMock.user.findUnique.mockResolvedValue(null);

        await expect(barberShopService.create(data, loggedUserId)).rejects.toThrow(InvalidParamError);
        expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Should throw ForbiddenError if user role is not OWNER', async () => {
        const loggedUserId = '1';

        const data = {
            name: 'Test barbershop',
            description: 'Test description',
            phone: '99999-9999',
            address: 'Test address',
            ownerId: loggedUserId
        }

        const owner = {
            id: loggedUserId,
            name: 'Owner',
            email: 'owner@email',
            password: 'password',
            phone: '99999-9999',
            role: roles.CLIENT,
        }

        prismaMock.user.findUnique.mockResolvedValue(owner);

        await expect(barberShopService.create(data, loggedUserId)).rejects.toThrow(ForbiddenError);
        expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Should throw ConflictError if user already has a barbershop', async () => {
        const loggedUserId = '1';

        const data = {
            name: 'Test barbershop',
            description: 'Test description',
            phone: '99999-9999',
            address: 'Test address',
            ownerId: loggedUserId
        }

        const owner = {
            id: loggedUserId,
            name: 'Owner',
            email: 'owner@email',
            password: 'password',
            phone: '99999-9999',
            role: roles.OWNER,
        }

        const barbershop = {
            id: 'test_barbershop_id',
            ownerId: loggedUserId,
            name: 'Test barbershop',
            description: 'Test Description',
            phone: '99999-9999',
            address: 'Test address',
        };

        prismaMock.user.findUnique.mockResolvedValue(owner);
        prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);

        await expect(barberShopService.create(data, loggedUserId)).rejects.toThrow(ConflictError);
        expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
        expect(prismaMock.barbershop.findUnique).toHaveBeenCalledTimes(1);
    });
})

describe('Tests for update method', () => {
    test('Should update a barbershop', async () => {
        const loggedUserId = '1';
        const barberShopId = 'test_barbershop_id';

        const data = {
            name: 'Updated Test barbershop',
            description: 'Updated Test description',
            phone: '99999-9998',
            address: 'Updated Test address',
        }

        const barbershopToBeUpdated = {
            id: barberShopId,
            ownerId: loggedUserId,
            name: 'Test barbershop',
            description: 'Test Description',
            phone: '99999-9999',
            address: 'Test address',
        };

        prismaMock.barbershop.findUnique.mockResolvedValue(barbershopToBeUpdated);
        
        expect(barberShopService.update(data, barberShopId, loggedUserId)).resolves.not.toThrow();
    });

    test('Should throw an InvalidParamError if barbershop does not exist', async () => {
        const loggedUserId = '1';
        const barberShopId = 'test_barbershop_id';

        const data = {
            name: 'Updated Test barbershop',
            description: 'Updated Test description',
            phone: '99999-9998',
            address: 'Updated Test address',
        }
        prismaMock.barbershop.findUnique.mockResolvedValue(null);

        await expect(barberShopService.update(data, barberShopId, loggedUserId)).rejects.toThrow(InvalidParamError);
        expect(prismaMock.barbershop.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Should throw a PermissionError if user tries to update a barbershop from another user', async () => {
        const loggedUserId = '1';
        const barberShopId = 'test_barbershop_id';

        const data = {
            name: 'Updated Test barbershop',
            description: 'Updated Test description',
            phone: '99999-9998',
            address: 'Updated Test address',
        }

        const barbershopToBeUpdated = {
            id: barberShopId,
            ownerId: 'Another user id',
            name: 'Test barbershop',
            description: 'Test Description',
            phone: '99999-9999',
            address: 'Test address',
        };

        prismaMock.barbershop.findUnique.mockResolvedValue(barbershopToBeUpdated);

        await expect(barberShopService.update(data, barberShopId, loggedUserId)).rejects.toThrow(PermissionError);
        expect(prismaMock.barbershop.findUnique).toHaveBeenCalledTimes(1);
    });
});

describe('Tests for the get using ownerId method', function() {
    test('Should return a babershop using the ownerId', async () => {
        const ownerId = 'owner_id';

        const barbershop= {
            id: 'barberShopId',
            ownerId: ownerId,
            name: 'Test barbershop',
            description: 'Test Description',
            phone: '99999-9999',
            address: 'Test address',
        };

        prismaMock.barbershop.findFirst.mockResolvedValue(barbershop);

        expect(barberShopService.getBarbershopFromOwnerId(ownerId)).resolves.not.toThrow()
    });

    test('Should throw an InvalidParamError if the barbershop was not found in the database', async () => {
        const ownerId = 'owner_id';
        
        prismaMock.barbershop.findFirst.mockResolvedValue(null);

        expect(barberShopService.getBarbershopFromOwnerId(ownerId)).rejects.toThrow(InvalidParamError);
    });
});

describe('Tests for the getById method', function() {
    test('Should return the barbershop with the corresponding id', async () => {
        const barberShopId = 'barberShopId';

        const barbershop = {
            id: barberShopId,
            name: 'Test barbershop',
            ownerId: 'owner_id',
            description: 'Test Description',
            phone: '99999-9999',
            address: 'Test address',
        };

        prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);

        expect(barberShopService.getById(barberShopId)).resolves.not.toThrow();
    });

    test('Should throw an InvalidParamError if the barbershop was not found in the database', async () => {
        const barberShopId = 'barberShopId';

        prismaMock.barbershop.findUnique.mockResolvedValue(null);

        expect(barberShopService.getById(barberShopId)).rejects.toThrow(InvalidParamError);
    });
});

describe('Test for the delete method', function () {
    test('Should delete a barbershop when an OWNER deletes his own barbershop', async () => {
        const barberShopId = 'barbershop_id';
        const loggedUserId = 'logged_user_id';
        const loggedUserRole = roles.OWNER;

        const barbershop = {
            id: barberShopId,
            name: 'Test barbershop',
            ownerId: loggedUserId,
            description: 'Test Description',
            phone: '99999-9999',
            address: 'Test address',
        };

        prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);

        await expect(barberShopService.delete(barberShopId, loggedUserId, loggedUserRole)).resolves.not.toThrow();
        expect(prismaMock.barbershop.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Should delete a barbershop when an ADMIN deletes a barbershop', async () => {
        const barberShopId = 'barbershop_id';
        const loggedUserId = 'logged_user_id';
        const loggedUserRole = roles.ADMIN;

        const barbershop = {
            id: barberShopId,
            name: 'Test barbershop',
            ownerId: 'Another user id',
            description: 'Test Description',
            phone: '99999-9999',
            address: 'Test address',
        };

        prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);

        await expect(barberShopService.delete(barberShopId, loggedUserId, loggedUserRole)).resolves.not.toThrow();
        expect(prismaMock.barbershop.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Should throw an InvalidParamError if the barbershop was not found in the database', async () => {
        const barberShopId = 'barbershop_id';
        const loggedUserId = 'logged_user_id';
        const loggedUserRole = roles.OWNER;

        prismaMock.barbershop.findUnique.mockResolvedValue(null);

        await expect(barberShopService.delete(barberShopId, loggedUserId, loggedUserRole)).rejects.toThrow(InvalidParamError);
    });

    test('Should throw a PermissionError if the user with role OWNER tries to delete a barbershop from another user', async () => {
        const barberShopId = 'barbershop_id';
        const loggedUserId = 'logged_user_id';
        const loggedUserRole = roles.OWNER;

        const barbershop = {
            id: barberShopId,
            ownerId: 'Another user id',
            name: 'Test barbershop',
            description: 'Test Description',
            phone: '99999-9999',
            address: 'Test address',
        };

        prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);

        await expect(barberShopService.delete(barberShopId, loggedUserId, loggedUserRole)).rejects.toThrow(PermissionError);
        expect(prismaMock.barbershop.findUnique).toHaveBeenCalledTimes(1);
    });
});