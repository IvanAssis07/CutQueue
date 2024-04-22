import { Appointment } from "@prisma/client";
import { Prisma } from "../../../../config/expressConfig";
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { ConflictError } from "../../../../errors/ConflictError";

class AppointmentService {
    async create (data: Omit<Appointment, 'id' | 'canceled' | 'endTime'>, loggedUserId: string) {
        if (loggedUserId !== data.customerId) {
            throw new PermissionError('Você não tem permissão para criar um agendamento para outro usuário.');
        }

        const user = await Prisma.user.findUnique({
            where: {
                id: data.customerId
            }
        });

        if (!user) {
            throw new InvalidParamError(`Usuário com id:${data.customerId} não encontrado.`);
        }

        const service = await Prisma.service.findUnique({
            where: {
                id: data.serviceId
            },
            include: {
                barbershop: true
            }
        });

        if (!service) {
            throw new ConflictError(`Serviço com id:${data.serviceId} não encontrado.`);
        }
        
        const durationInMilliseconds = service.duration.toNumber() * 60 * 1000;
        const startTime = new Date(data.startTime);
        const endTime = new Date(startTime.getTime() + durationInMilliseconds);

        const existingAppointments = await Prisma.appointment.findFirst({
            where: {
                date: data.date,
                barbershopId: data.barbershopId,
                canceled: false,
                AND: [
                    { startTime: { lte: endTime } }, 
                    { endTime: { gte: data.startTime } } 
                ]
            }
        });
        
        if (existingAppointments) {
            throw new ConflictError('Já existe um agendamento para este horário.');
        } else {
            await Prisma.appointment.create({
                data: {
                    startTime: data.startTime,
                    endTime: endTime,
                    date: data.date,
                    canceled: false,
                    customerId: data.customerId,
                    barbershopId: data.barbershopId,
                    serviceId: data.serviceId
                }
            });
        }
    }

    async getAppointmentById (id: string, loggedUserId: string) {
        const appointment = await Prisma.appointment.findUnique({
            where: {
                id: id
            },
            include: {
                service: {
                    select: {
                        name: true,
                        description: true,
                        price: true,
                        duration: true
                    }
                }
            }
        });

        if (!appointment) {
            throw new InvalidParamError(`Agendamento com id:${id} não encontrado.`);
        }

        if (loggedUserId !== appointment.customerId) {
            throw new PermissionError('Você não tem permissão para visualizar este agendamento.');
        }

        return appointment;
    }

    async getAppointmentsByCustomerId (customerId: string) {
        return Prisma.appointment.findMany({
            where: {
                customerId: customerId
            },
            include: {
                service: {
                    select: {
                        name: true,
                        description: true,
                        price: true,
                        duration: true
                    }
                }
            }
        });
    }

    async cancelAppointment (appointmentId: string, loggedUserId: string) {
        const appointment = await Prisma.appointment.findUnique({
            where: {
                id: appointmentId
            }
        });

        if (!appointment) {
            throw new InvalidParamError(`Agendamento com id:${appointmentId} não encontrado.`);
        }

        if (loggedUserId !== appointment.customerId) {
            throw new PermissionError('Você não tem permissão para cancelar este agendamento.');
        }

        await Prisma.appointment.update({
            where: {
                id: appointmentId
            },
            data: {
                canceled: true
            }
        });
    }
}

export const appointmentService = new AppointmentService();