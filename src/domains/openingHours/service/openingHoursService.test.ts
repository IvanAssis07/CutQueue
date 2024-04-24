import { openingHoursService } from "./openingHoursService";
import { prismaMock } from "../../../../config/singleton";
import { Prisma } from '@prisma/client';
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { ConflictError } from "../../../../errors/ConflictError";

describe('Create OpeningHoursService method', function() {
    test('Should create a new  opening hours service', async () => {
        const loggedUserId = 'test_owner_id';

        const data = {
            id: 'opening_hours_id',
            number: 0,
            openingTime: '12:00',
            closingTime: '23:30',
            barbershopId: 'test_barbershop_id',
            name: 'Opening hours test',
            day: 0
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

        await expect(openingHoursService.create(data, loggedUserId)).resolves.not.toThrow();

        expect(prismaMock.barbershop.findUnique).toHaveBeenCalledWith({ where: { id: data.barbershopId } });
        expect(prismaMock.openingHours.create).toHaveBeenCalledWith({
            data: {
                openingTime: data.openingTime,
                closingTime: data.closingTime,
                barbershopId: data.barbershopId,
                day: data.day
            }
        });
    });


    test('Should throw an InvalidParamError if day is invalid', async () => {
        const loggedUserId = 'test_owner_id';

        const data = {
            id: 'opening_hours_id',
            number: 0,
            openingTime: '12:00',
            closingTime: '23:30',
            barbershopId: 'test_barbershop_id',
            name: 'Opening hours test',
            day: 7
        };

        prismaMock.barbershop.findUnique.mockResolvedValue(null);

        expect(openingHoursService.create(data, loggedUserId)).rejects.toThrow(InvalidParamError);
    });

    test('Should throw an InvalidParamError if openingTime is invalid', async () => {
        const loggedUserId = 'test_owner_id';

        const data = {
            id: 'opening_hours_id',
            number: 0,
            openingTime: '12:10',
            closingTime: '23:30',
            barbershopId: 'test_barbershop_id',
            name: 'Opening hours test',
            day: 0
        };

        prismaMock.barbershop.findUnique.mockResolvedValue(null);

        expect(openingHoursService.create(data, loggedUserId)).rejects.toThrow(InvalidParamError);
    });

    test('Should throw an InvalidParamError if barbershop not included', async () => {
        const loggedUserId = 'test_owner_id';

        const data = {
            id: 'opening_hours_id',
            number: 0,
            openingTime: '12:00',
            closingTime: '23:30',
            barbershopId: 'test_barbershop_id',
            name: 'Opening hours test',
            day: 6
        };

        prismaMock.barbershop.findUnique.mockResolvedValue(null);

        expect(openingHoursService.create(data, loggedUserId)).rejects.toThrow(InvalidParamError);
    });

    test('Should throw an PermissionError if loggedUserId is not the owner', async () => {
        const loggedUserId = 'other_test_owner_id';

        const data = {
            id: 'opening_hours_id',
            number: 0,
            openingTime: '12:00',
            closingTime: '23:30',
            barbershopId: 'test_barbershop_id',
            name: 'Opening hours test',
            day: 0
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

        expect(openingHoursService.create(data, loggedUserId)).rejects.toThrow(PermissionError);

    });



});
