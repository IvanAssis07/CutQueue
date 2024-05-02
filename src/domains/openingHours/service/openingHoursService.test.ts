import { openingHoursService } from "./openingHoursService";
import { prismaMock } from "../../../../config/singleton";
import { Prisma } from '@prisma/client';
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { ConflictError } from "../../../../errors/ConflictError";

describe('Create OpeningHoursService method', function() {
    describe('Tests for create method', function () {
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

        test('Should throw a ConflictError for existing opening hour on the same day', async () => {
          const data = {
            id: 'opening_hours_id',
            number: 0,
            openingTime: '12:00',
            closingTime: '23:30',
            barbershopId: 'test_barbershop_id',
            name: 'Opening hours test',
            day: 0
          };
          const loggedUserId = 'test_owner_id';

          const barbershop = {
            id: 'test_barbershop_id',
            ownerId: loggedUserId,
            name: 'Test barbershop',
            description: 'Test Description',
            phone: '99999-9999',
            address: 'Test address',
          };

          const existingOpeningHour = {
            id: 'existingOpeningHour',
            barbershopId: data.barbershopId,
            day: data.day,
            openingTime: '10:00',
            closingTime: '18:00',
          };

          // Mock prisma to return existing opening hour
          prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);
          prismaMock.openingHours.findFirst.mockResolvedValue(existingOpeningHour);

          await expect(openingHoursService.create(data, loggedUserId)).rejects.toThrow(ConflictError);
        });
    });

    describe('Tests for getOpeningHoursFromBarbershop method', function () {
        test('Should return an empty array for a barbershop with no opening hours', async () => {
          const barbershopId = 'test_barbershop_id';

          // Mock prisma to return an empty array
          prismaMock.openingHours.findMany.mockResolvedValue([]);

          const openingHours = await openingHoursService.getOpeningHoursFromBarbershop(barbershopId);

          expect(openingHours).toEqual([]);
        });
    });

    describe('Tests for updateOpeningHours method', function () {
        test('Should update the Opening Hour', async () => {
            const barbershop = {
                id: 'test_barbershop_id',
                ownerId: 'test_owner_id',
                name: 'Test barbershop',
                description: 'Test Description',
                phone: '99999-9999',
                address: 'Test address',
            };

            await prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);


            const existingOpeningHour = {
            id: 'opening_hours_id',
            barbershopId: barbershop.id,
            day: 0,
            openingTime: '10:00',
            closingTime: '18:00',
            };

            await prismaMock.openingHours.findFirst.mockResolvedValue(existingOpeningHour);


            const data = { id: 'opening_other_hours_id',
                        day: existingOpeningHour.day,
                        openingTime: '10:00',
                        closingTime: '18:00',
                        barbershopId: existingOpeningHour.barbershopId};
            const  openingHoursId = 'opening_hours_id';

            const loggedUserId = barbershop.ownerId;

            await expect(openingHoursService.updateOpeningHours(data,openingHoursId, loggedUserId)).resolves.not.toThrow();

            expect(prismaMock.openingHours.update).toHaveBeenCalledWith({
                where: {
                    id: openingHoursId
                },
                data: {
                    openingTime: data.openingTime,
                    closingTime: data.closingTime
                }
            });
        });

        test('Should throw an InvalidParamError if non-existing id', async () => {
          const data = { id: 'opening_hours_id',
                        day: 0,
                        openingTime: '10:00',
                        closingTime: '18:00',
                        barbershopId: 'test_barbershop_id'};
          const  openingHoursId = '';

          const loggedUserId = '';


          await expect(openingHoursService.updateOpeningHours(data,openingHoursId, loggedUserId)).rejects.toThrow(InvalidParamError);
        });

        test('Should throw an InvalidParamError if invalid date format', async () => {

            const existingOpeningHour = {
            id: 'opening_hours_id',
            barbershopId: 'test_barbershop_id',
            day: 0,
            openingTime: '10:00',
            closingTime: '18:00',
            };

            prismaMock.openingHours.findFirst.mockResolvedValue(existingOpeningHour);


            const data = { id: existingOpeningHour.id,
                        day: existingOpeningHour.day,
                        openingTime: '10:05',
                        closingTime: '18:00',
                        barbershopId: existingOpeningHour.barbershopId};
            const  openingHoursId = 'opening_hours_id';

            const loggedUserId = '';


            await expect(openingHoursService.updateOpeningHours(data,openingHoursId, loggedUserId)).rejects.toThrow(InvalidParamError);
        });

         test('Should throw an PermissionError if day dont have a barbershop', async () => {
            const existingOpeningHour = {
            id: 'opening_hours_id',
            barbershopId: 'test_barbershop_id',
            day: 0,
            openingTime: '10:00',
            closingTime: '18:00',
            };

            await prismaMock.openingHours.findFirst.mockResolvedValue(existingOpeningHour);


            const data = { id: existingOpeningHour.id,
                        day: existingOpeningHour.day,
                        openingTime: '10:00',
                        closingTime: '18:00',
                        barbershopId: existingOpeningHour.barbershopId};
            const  openingHoursId = 'opening_hours_id';

            const loggedUserId = 'test_other_id';


            await expect(openingHoursService.updateOpeningHours(data,openingHoursId, loggedUserId)).rejects.toThrow(InvalidParamError);
        });


        test('Should throw an PermissionError if loggedUserId is not the owner', async () => {
            const barbershop = {
                id: 'test_barbershop_id',
                ownerId: 'test_owner_id',
                name: 'Test barbershop',
                description: 'Test Description',
                phone: '99999-9999',
                address: 'Test address',
            };

            await prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);


            const existingOpeningHour = {
            id: 'opening_hours_id',
            barbershopId: barbershop.id,
            day: 0,
            openingTime: '10:00',
            closingTime: '18:00',
            };

            await prismaMock.openingHours.findFirst.mockResolvedValue(existingOpeningHour);


            const data = { id: existingOpeningHour.id,
                        day: existingOpeningHour.day,
                        openingTime: '10:00',
                        closingTime: '18:00',
                        barbershopId: existingOpeningHour.barbershopId};
            const  openingHoursId = 'opening_hours_id';

            const loggedUserId = 'test_other_id';


            await expect(openingHoursService.updateOpeningHours(data,openingHoursId, loggedUserId)).rejects.toThrow(PermissionError);
        });
    });

    describe('Tests for deleteOpeningHours method', function () {
        test('Should delete the opening hours', async () => {
            const barbershop = {
                id: 'test_barbershop_id',
                ownerId: 'test_owner_id',
                name: 'Test barbershop',
                description: 'Test Description',
                phone: '99999-9999',
                address: 'Test address',
            };

            await prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);

            const openingHoursId = 'opening_hours_id'

            const existingOpeningHour = {
            id: openingHoursId,
            barbershopId: barbershop.id,
            day: 0,
            openingTime: '10:00',
            closingTime: '18:00',
            };


            await prismaMock.openingHours.findFirst.mockResolvedValue(existingOpeningHour);

            const loggedUserId = 'test_owner_id';

            await expect(openingHoursService.deleteOpeningHours(openingHoursId, loggedUserId)).resolves.not.toThrow();

            expect(prismaMock.openingHours.delete).toHaveBeenCalledWith({
            where: {
                id: openingHoursId
            }
            });
        });



        test('Should throw an InvalidParamError if the opening does not exists', async () => {
            const barbershop = {
                id: 'test_barbershop_id',
                ownerId: 'test_owner_id',
                name: 'Test barbershop',
                description: 'Test Description',
                phone: '99999-9999',
                address: 'Test address',
            };

            await prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);

            const openingHoursId = 'opening_hours_id'

            const loggedUserId = barbershop.ownerId;

             await expect(openingHoursService.deleteOpeningHours(openingHoursId, loggedUserId)).rejects.toThrow(InvalidParamError);
        });

        test('Should throw an InvalidParamError if the Barbershop does not exist', async () => {
            const openingHoursId = 'opening_hours_id'

            const existingOpeningHour = {
            id: openingHoursId,
            barbershopId: 'test_barbershop_id',
            day: 0,
            openingTime: '10:00',
            closingTime: '18:00',
            };


            await prismaMock.openingHours.findFirst.mockResolvedValue(existingOpeningHour);

            const loggedUserId = 'test_other_owner_id';

             await expect(openingHoursService.deleteOpeningHours(openingHoursId, loggedUserId)).rejects.toThrow(InvalidParamError);
        });


        test('Should throw an PermissionError if the loggedUserId is not the owner', async () => {
            const barbershop = {
                id: 'test_barbershop_id',
                ownerId: 'test_owner_id',
                name: 'Test barbershop',
                description: 'Test Description',
                phone: '99999-9999',
                address: 'Test address',
            };

            await prismaMock.barbershop.findUnique.mockResolvedValue(barbershop);

            const openingHoursId = 'opening_hours_id'

            const existingOpeningHour = {
            id: openingHoursId,
            barbershopId: barbershop.id,
            day: 0,
            openingTime: '10:00',
            closingTime: '18:00',
            };


            await prismaMock.openingHours.findFirst.mockResolvedValue(existingOpeningHour);

            const loggedUserId = 'test_other_owner_id';

            await expect(openingHoursService.deleteOpeningHours(openingHoursId, loggedUserId)).rejects.toThrow(PermissionError);
        });
    });








});
