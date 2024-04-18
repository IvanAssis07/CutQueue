import { OpeningHours } from "@prisma/client";
import { Prisma } from "../../../../config/expressConfig";
import { InvalidParamError } from "../../../../errors/InvalidParamError";
import { PermissionError } from "../../../../errors/PermissionError";
import { ConflictError } from "../../../../errors/ConflictError";
import { weekDays } from "../../../../utils/constants/enumWeekDays"
import { hourFormatValidation } from "../../../../utils/functions/hourFormatValidate";

class OpeningHoursService {
    async create(data: Omit<OpeningHours, 'id'>, loggedUserId: string) {
        if (data.day < 0 || data.day > 6) {
            throw new InvalidParamError('Dia da semana inválido.');
        }
        
        if (!(hourFormatValidation(data.openingTime) && hourFormatValidation(data.closingTime))) {
            throw new InvalidParamError('Formato de horário inválido. Utilize o formato HH:MM.');
        }

        const dayConverted = parseInt(data.day.toString());
 
        const barbershop = await Prisma.barbershop.findUnique({
            where: {
                id: data.barbershopId
            }
        });

        if (!barbershop) {
            throw new InvalidParamError(`Barbearia com id:${data.barbershopId} não encontrada.`);
        }
        
        if (barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('Você não tem permissão para definir os horários de funcionamento para esta barbearia.');
        }

        const day = await Prisma.openingHours.findFirst({
            where: {
                barbershopId: data.barbershopId,
                day: dayConverted
            }
        });

        if (day) {
            throw new ConflictError(`Já há um horário para ${weekDays[dayConverted]}`);
        }

        await Prisma.openingHours.create({
            data: {
                barbershopId: data.barbershopId,
                day: dayConverted,
                openingTime: data.openingTime,
                closingTime: data.closingTime
            }
        });
    }

    async getOpeningHoursFromBarbershop (barbershopId: string) {
        console
        return await Prisma.openingHours.findMany({
            where: {
                barbershopId: barbershopId
            },
            orderBy: {
                day: "asc"
            }
        })
    }

    async updateOpeningHours (data: Omit<OpeningHours, 'id' | 'day' | 'barbershopId'>, openingHoursId:string, loggedUserId: string) {
        const day = await Prisma.openingHours.findFirst({
            where: {
                id: openingHoursId
            },
            include: {
                barbershop: true
            }
        });

        if (!day) {
            throw new InvalidParamError(`O dia com id ${openingHoursId} não foi encontrado.`);
        }

        if (!(data.closingTime !== undefined && hourFormatValidation(data.closingTime) 
              && data.openingTime !== undefined && hourFormatValidation(data.openingTime))) {
            throw new InvalidParamError('Formato de horário inválido. Utilize o formato HH:MM.');
        }

        if (day.barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('Você não tem permissão para definir os horários de funcionamento para esta barbearia.');
        }

        await Prisma.openingHours.update({
            where: {
                id: day.id
            },
            data: {
                openingTime: data.openingTime,
                closingTime: data.closingTime
            }
        });
    
    }

    async deleteOpeningHours (openingHoursId: string, loggedUserId: string) {
        const day = await Prisma.openingHours.findFirst({
            where: {
                id: openingHoursId
            },
            include: {
                barbershop: true
            }
        });

        if (!day) {
            throw new InvalidParamError(`O dia com id ${openingHoursId} não foi encontrado.`);
        }
        
        if (day.barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('Você não tem permissão para definir os horários de funcionamento para esta barbearia.');
        }

        await Prisma.openingHours.delete({
            where: {
                id: day.id
            }
        });
    }
}

export const openingHoursService = new OpeningHoursService;