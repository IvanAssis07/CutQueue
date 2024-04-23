import { serviceService } from "./serviceService";
import { prismaMock } from "../../../../config/singleton";
import { Prisma } from '@prisma/client';
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { ConflictError } from "../../../../errors/ConflictError";

describe('Create service method', function() {
    test('Should create a new user', async () => {
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

    test('Should throw an InvalidParamError if barbershop does not exist', async () => {
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
