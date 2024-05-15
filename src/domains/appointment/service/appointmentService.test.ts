import { appointmentService } from "./appointmentService";
import { prismaMock } from "../../../../config/singleton";
import { Prisma } from '@prisma/client';
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { ConflictError } from "../../../../errors/ConflictError";
import { roles } from "../../../../utils/constants/roles";

describe('appointmentService Tests', function() {
    describe('Tests for create method', function () {
        test('shouldnt create appointment for other user', async () => {

            const loggedUserId = '2';

            const data = {
                startTime: new Date('December 17, 2025 04:00:00'),
                date: new Date('December 17, 2025 04:00:00'),
                customerId: '1',
                serviceId: '1',
                barbershopId: '1',
            };

            await expect(appointmentService.create(data,loggedUserId)).rejects.toThrow(new PermissionError('You do not have permission to create an appointment for another user.'));
        });
        test('shouldnt create appointment for nonexistent user', async () => {

            const loggedUserId = '1';

            const data = {
                startTime: new Date('December 17, 2025 04:00:00'),
                date: new Date('December 17, 2025 04:00:00'),
                customerId: '1',
                serviceId: '1',
                barbershopId: '1',
            };

            prismaMock.user.findUnique.mockResolvedValue(null);

            await expect(appointmentService.create(data,loggedUserId)).rejects.toThrow(new InvalidParamError(`User with id:${data.customerId} not found.`));
        });

        test('shouldnt create appointment with invalid service', async () => {

            const loggedUserId = '1';

            const data = {
                startTime: new Date('December 17, 2025 04:00:00'),
                date: new Date('December 17, 2025 04:00:00'),
                customerId: '1',
                serviceId: '1',
                barbershopId: '1',
            };

            const user = {
                id: '1',
                name: 'Test User',
                email: 'test@mail.com',
                password: '123456',
                phone: '123456789',
                role: roles.CLIENT
            };


            prismaMock.user.findUnique.mockResolvedValue(user);

            prismaMock.service.findUnique.mockResolvedValue(null);

            await expect(appointmentService.create(data,loggedUserId)).rejects.toThrow(new ConflictError(`Service with id:${data.serviceId} not found.`));
        });
    });

});
