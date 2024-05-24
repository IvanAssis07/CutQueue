import { appointmentService } from "./appointmentService";
import { prismaMock } from "../../../../config/singleton";
import { Prisma } from '@prisma/client';
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { ConflictError } from "../../../../errors/ConflictError";
import { roles } from "../../../../utils/constants/roles";

describe('Tests for create method', function() {
    test('shouldnt create appointment for other user', async () => {

        const loggedUserId = '2';

        const data = {
            startTime: new Date('December 17, 2025 04:00:00'),
            date: new Date('December 17, 2025 04:00:00'),
            customerId: '1',
            serviceId: '1',
            barbershopId: '1',
        };

        await expect(appointmentService.create(data,loggedUserId)).rejects.toThrow(PermissionError);
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

        await expect(appointmentService.create(data,loggedUserId)).rejects.toThrow(InvalidParamError);
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

        await expect(appointmentService.create(data,loggedUserId)).rejects.toThrow(ConflictError);
    });

    test('Should not create an appointment with a time conflict', async () => {

        const loggedUserId = '1';

        const data = {
            startTime: new Date('December 17, 2025 04:00:00'),
            date: new Date('December 17, 2025 04:00:00'),
            customerId: '1',
            serviceId: '1',
            barbershopId: '1',
        };

        const existingAppointments = {
            id: '1',
            startTime: new Date('December 17, 2025 04:00:00'),
            endTime: new Date('December 17, 2025 04:30:00'),
            date: new Date('December 17, 2025 04:00:00'),
            canceled: false,
            customerId: '12',
            barbershopId: 'barbershopId',
            serviceId: 'test_service_id_1'
        };

        const user = {
            id: '1',
            name: 'Test User',
            email: 'test@mail.com',
            password: '123456',
            phone: '123456789',
            role: roles.CLIENT
        };

        const service = {
            id: 'test_service_id_1',
            name: 'Test Service 1',
            description: 'Test Description 1',
            price: new Prisma.Decimal(10.00),
            duration: new Prisma.Decimal(30),
            barbershopId: 'barbershopId'   
        }

        prismaMock.user.findUnique.mockResolvedValue(user);
        prismaMock.service.findUnique.mockResolvedValue(service);
        prismaMock.appointment.findFirst.mockResolvedValue(existingAppointments);

        await expect(appointmentService.create(data,loggedUserId)).rejects.toThrow(ConflictError);
    });

    test('Should create an appointment', async () => {
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

        const service = {
            id: 'test_service_id_1',
            name: 'Test Service 1',
            description: 'Test Description 1',
            price: new Prisma.Decimal(10.00),
            duration: new Prisma.Decimal(30),
            barbershopId: 'barbershopId'   
        }

        prismaMock.user.findUnique.mockResolvedValue(user);
        prismaMock.service.findUnique.mockResolvedValue(service);
        prismaMock.appointment.findFirst.mockResolvedValue(null);

        await expect(appointmentService.create(data, loggedUserId)).resolves.not.toThrow();
        expect(prismaMock.appointment.create).toHaveBeenCalledTimes(1);
    });
});

describe('Tests for getAppointmentById method', function() {
    test('Should return an appointment', async () => {
        const loggedUserId = '1';

        const appointment = {
            id: '1',
            startTime: new Date('December 17, 2025 04:00:00'),
            endTime: new Date('December 17, 2025 04:30:00'),
            date: new Date('December 17, 2025 04:00:00'),
            canceled: false,
            customerId: '1',
            barbershopId: 'barbershopId',
            serviceId: 'test_service_id_1'
        };

        prismaMock.appointment.findUnique.mockResolvedValue(appointment);

        await expect(appointmentService.getAppointmentById('1', loggedUserId)).resolves.not.toThrow();
        expect(prismaMock.appointment.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Should throw an InvalidParamError if the appointment was not found in the database', async () => {
        const loggedUserId = '1';

        prismaMock.appointment.findUnique.mockResolvedValue(null);

        await expect(appointmentService.getAppointmentById('1', loggedUserId)).rejects.toThrow(InvalidParamError);
    });
});

describe('Tests for cancel method', function() {
    test('Should cancel an appointment', async () => {
        const appointmentId = '1';
        const loggedUserId = '1';

        const appointment = {
            id: '1',
            startTime: new Date('December 17, 2025 04:00:00'),
            endTime: new Date('December 17, 2025 04:30:00'),
            date: new Date('December 17, 2025 04:00:00'),
            canceled: false,
            customerId: '1',
            barbershopId: 'barbershopId',
            serviceId: 'test_service_id_1'
        };

        prismaMock.appointment.findUnique.mockResolvedValue(appointment);

        await expect(appointmentService.cancelAppointment(appointmentId, loggedUserId)).resolves.not.toThrow();
        expect(prismaMock.appointment.update).toHaveBeenCalledTimes(1)
    })

    test('Should throw an InvalidParamError if the appointment was not found in the database', async () => {
        const appointmentId = '1';
        const loggedUserId = '1';

        prismaMock.appointment.findUnique.mockResolvedValue(null);

        await expect(appointmentService.cancelAppointment(appointmentId, loggedUserId)).rejects.toThrow(InvalidParamError);
    });

    test('Should throw a PermissionError if the user does not have permission to cancel the appointment', async () => {
        const appointmentId = '1';
        const loggedUserId = '1';

        const appointment = {
            id: '1',
            startTime: new Date('December 17, 2025 04:00:00'),
            endTime: new Date('December 17, 2025 04:30:00'),
            date: new Date('December 17, 2025 04:00:00'),
            canceled: false,
            customerId: 'difeerent_user_id',
            barbershopId: 'barbershopId',
            serviceId: 'test_service_id_1'
        };

        prismaMock.appointment.findUnique.mockResolvedValue(appointment);

        await expect(appointmentService.cancelAppointment(appointmentId, loggedUserId)).rejects.toThrow(PermissionError);
    });
});