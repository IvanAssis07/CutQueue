import { serviceService } from "./serviceService";
import { prismaMock } from "../../../../config/singleton";
import { Prisma } from '@prisma/client';
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { ConflictError } from "../../../../errors/ConflictError";
import e from "express";

describe('Tests for create method', function() {
    test('Should create a new service', async () => {
        const ownerId = 'test_owner_id';

        const data = {
            name: 'Test Service',
            description: 'Test Description',
            price: new Prisma.Decimal(10.00),
            duration: new Prisma.Decimal(60),
            barbershopId: 'test_barbershop_id'
        };

        const barbershop = {
            id: 'test_barbershop_id',
            ownerId: 'test_owner_id',
            name: 'Test barbershop',
            description: 'Test Description',
            phone: '99999-9999',
            address: 'Test address',
        };

        prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);

        await expect(serviceService.create(data, ownerId)).resolves.not.toThrow();
        
        expect(prismaMock.barbershop.findUnique).toHaveBeenCalledWith({ where: { id: data.barbershopId } });
        expect(prismaMock.service.create).toHaveBeenCalledWith({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                duration: data.duration,
                barbershopId: data.barbershopId
            },
            select: { id: true }
        });
    });

    test('Should throw an InvalidParamError if barbershop was not found in the database', async () => {
        const ownerId = 'test_owner_id';
    
        const data = {
            name: 'Test Service',
            description: 'Test Description',
            price: new Prisma.Decimal(10.00),
            duration: new Prisma.Decimal(60),
            barbershopId: 'test_barbershop_id'
        };
    
        prismaMock.barbershop.findUnique.mockResolvedValue(null);
    
        expect(serviceService.create(data, ownerId)).rejects.toThrow(InvalidParamError);
        expect(prismaMock.barbershop.findUnique).toHaveBeenCalledWith({ where: { id: data.barbershopId } });
        expect(prismaMock.service.create).not.toHaveBeenCalled();
    });

    test('Should throw a PermissionError if a user tries to create a barbeshop service without being the owner', async () => {
        const ownerId = 'test_owner_id';
    
        const data = {
            name: 'Test Service',
            description: 'Test Description',
            price: new Prisma.Decimal(10.00),
            duration: new Prisma.Decimal(60),
            barbershopId: 'test_barbershop_id'
        };
    
        const barbershop = {
            id: 'test_barbershop_id',
            ownerId: 'another_owner_id',
            name: 'Test barbershop',
            description: 'Test Description',
            phone: '99999-9999',
            address: 'Test address',
        };
    
        prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);
    
        expect(serviceService.create(data, ownerId)).rejects.toThrow(PermissionError);
        expect(prismaMock.barbershop.findUnique).toHaveBeenCalledWith({ where: { id: data.barbershopId } });
        expect(prismaMock.service.create).not.toHaveBeenCalled();
    });
});

describe('Tests for getAll method', function () {
    test('Should return a list of services from a barbershop', async () => {
        const barbershopId = 'test_barbershop_id';

        const services = [
            {
                id: 'test_service_id_1',
                name: 'Test Service 1',
                description: 'Test Description 1',
                price: new Prisma.Decimal(10.00),
                duration: new Prisma.Decimal(30),
                barbershopId: barbershopId   
            },
            {
                id: 'test_service_id_2',
                name: 'Test Service 2',
                description: 'Test Description 2',
                price: new Prisma.Decimal(20.00),
                duration: new Prisma.Decimal(60), 
                barbershopId: barbershopId
            }
        ];

        const barbershop = {
            id: 'test_barbershop_id',
            ownerId: 'another_owner_id',
            name: 'Test barbershop',
            description: 'Test Description',
            phone: '99999-9999',
            address: 'Test address',
        };

        prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);
        prismaMock.service.findMany.mockResolvedValue(services);
    
        await expect(serviceService.getAllServicesFromBarbershop(barbershopId)).resolves.not.toThrow();
        expect(prismaMock.barbershop.findUnique).toHaveBeenCalledWith({ where: { id: barbershopId } });
        expect(prismaMock.service.findMany).toHaveBeenCalledTimes(1);
    });

    test('Should throw an InvalidParamError if barbershop was not found in the database', async () => {
        const barbershopId = 'test_barbershop_id';

        prismaMock.barbershop.findUnique.mockResolvedValue(null);

        expect(serviceService.getAllServicesFromBarbershop(barbershopId)).rejects.toThrow(InvalidParamError);
        expect(prismaMock.service.findMany).not.toHaveBeenCalled();
        expect(prismaMock.barbershop.findUnique).toHaveBeenCalledWith({ where: { id: barbershopId } });
    });

    test('Should return an empty list if barbershop does not have any services registered', async () => {
        const barbershopId = 'test_barbershop_id';

        const barbershop = {
            id: 'test_barbershop_id',
            ownerId: 'another_owner_id',
            name: 'Test barbershop',
            description: 'Test Description',
            phone: '99999-9999',
            address: 'Test address',
        };

        prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);
        prismaMock.service.findMany.mockResolvedValue([]);

        await expect(serviceService.getAllServicesFromBarbershop(barbershopId)).resolves.not.toThrow();
    });
});

describe('Tests get service by id method', function () {
    test('Should return a service by id', async () => {
        const serviceId = 'test_service_id';

        const service = {
            id: 'test_service_id',
            name: 'Test Service',
            description: 'Test Description',
            price: new Prisma.Decimal(10.00),
            duration: new Prisma.Decimal(60),
            barbershopId: 'test_barbershop_id'
        };

        prismaMock.service.findUnique.mockResolvedValue(service);

        await expect(serviceService.getServiceById(serviceId)).resolves.not.toThrow();
        expect(prismaMock.service.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Should throw an InvalidParamError if service was not found in the database', async () => {
        const serviceId = 'test_service_id';

        prismaMock.service.findUnique.mockResolvedValue(null);

        expect(serviceService.getServiceById(serviceId)).rejects.toThrow(InvalidParamError);
    });
});

describe('Tests for update method', function () {
    test('Should update a service', async() => {
        const serviceId = 'test_service_id';
        const loggedUserId = 'test_logged_user_id';

        const serviceToBeUpdated = {
            id: 'test_service_id',
            name: 'Test Service',
            description: 'Test Description',
            price: new Prisma.Decimal(10.00),
            duration: new Prisma.Decimal(60),
            barbershopId: 'test_barbershop_id',
            barbershop: {
                ownerId: loggedUserId
            }
        }

        const serviceUpdated = {
            description: 'New Test Description',
        }

        prismaMock.service.findUnique.mockResolvedValue(serviceToBeUpdated);
        
        expect(serviceService.updateService(serviceToBeUpdated, serviceId, loggedUserId)).resolves.not.toThrow();
    });

    test('Should throw an InvalidParamError if service was not found in the database', async() => {
        const serviceId = 'test_service_id';
        const loggedUserId = 'test_logged_user_id';

        const serviceToBeUpdated = {
            id: 'test_service_id',
            name: 'Test Service',
            description: 'Test Description',
            price: new Prisma.Decimal(10.00),
            duration: new Prisma.Decimal(60),
            barbershopId: 'test_barbershop_id',
            barbershop: {
                ownerId: loggedUserId
            }
        }

        prismaMock.service.findUnique.mockResolvedValue(null);
        
        expect(serviceService.updateService(serviceToBeUpdated, serviceId, loggedUserId)).rejects.toThrow(InvalidParamError);
    });

    test('Should throw a PermissionError if logged user is not the owner of the barbershop and tries to edit the service', () => {
        const serviceId = 'test_service_id';
        const loggedUserId = 'test_logged_user_id';

        const serviceToBeUpdated = {
            id: 'test_service_id',
            name: 'Test Service',
            description: 'Test Description',
            price: new Prisma.Decimal(10.00),
            duration: new Prisma.Decimal(60),
            barbershopId: 'test_barbershop_id',
            barbershop: {
                ownerId: 'Test_different_id'
            }
        }

        prismaMock.service.findUnique.mockResolvedValue(serviceToBeUpdated);

        expect(serviceService.updateService(serviceToBeUpdated, serviceId, loggedUserId)).rejects.toThrow(PermissionError);
    });
});

describe('Tests for delete method', function() {
    test('Should delete a service', async() => {
        const serviceId = 'test_service_id';
        const loggedUserId = 'test_logged_user_id';

        const service = {
            id: 'test_service_id',
            name: 'Test Service',
            description: 'Test Description',
            price: new Prisma.Decimal(10.00),
            duration: new Prisma.Decimal(60),
            barbershopId: 'test_barbershop_id',
            barbershop: {
                ownerId: loggedUserId
            }
        }

        prismaMock.service.findUnique.mockResolvedValue(service);

        expect(serviceService.delete(serviceId, loggedUserId)).resolves.not.toThrow;
        expect(prismaMock.service.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Should throw an InvaliParameterError if service was not found in the database', async() => {
        const serviceId = 'test_service_id';
        const loggedUserId = 'test_logged_user_id';

        prismaMock.service.findUnique.mockResolvedValue(null);

        expect(serviceService.delete(serviceId, loggedUserId)).rejects.toThrow(InvalidParamError);
        expect(prismaMock.service.delete).not.toHaveBeenCalled();
    });

    test('Should throw a permission error if a user that is not the owner tries to delete a service', async() => {
        const serviceId = 'test_service_id';
        const loggedUserId = 'test_logged_user_id';

        const service = {
            id: 'test_service_id',
            name: 'Test Service',
            description: 'Test Description',
            price: new Prisma.Decimal(10.00),
            duration: new Prisma.Decimal(60),
            barbershopId: 'test_barbershop_id',
            barbershop: {
                ownerId: 'Test_different_id'
            }
        }

        prismaMock.service.findUnique.mockResolvedValue(service);

        expect(serviceService.delete(serviceId, loggedUserId)).rejects.toThrow(PermissionError);
    });
});