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
            throw new InvalidParamError('Invalid day of the week.');
        }
        
        if (!(hourFormatValidation(data.openingTime) && hourFormatValidation(data.closingTime))) {
            throw new InvalidParamError('Invalid date format. Use the HH:MM(00 | 30) format.');
        }

        const dayConverted = parseInt(data.day.toString());
 
        const barbershop = await Prisma.barbershop.findUnique({
            where: {
                id: data.barbershopId
            }
        });

        if (!barbershop) {
            throw new InvalidParamError(`Barbershop with id:${data.barbershopId} not found.`);
        }
        
        if (barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('You do not have permission to set opening hours for this barbershop.');
        }

        const day = await Prisma.openingHours.findFirst({
            where: {
                barbershopId: data.barbershopId,
                day: dayConverted
            }
        });

        if (day) {
            throw new ConflictError(`There's already an opening hour for ${weekDays[dayConverted]}`);
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
            throw new InvalidParamError(`The day with id ${openingHoursId} was not found.`);
        }

        if (!(data.closingTime !== undefined && hourFormatValidation(data.closingTime) 
              && data.openingTime !== undefined && hourFormatValidation(data.openingTime))) {
            throw new InvalidParamError('Invalid date format. Use the HH:MM(00 | 30) format.');
        }

        if (day.barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('You do not have permission to edit opening hours for this barbershop.');
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
            throw new InvalidParamError(`The day with id ${openingHoursId} was not found.`);
        }
        
        if (day.barbershop.ownerId !== loggedUserId) {
            throw new PermissionError('You do not have permission to delete opening hours for this barbershop');
        }

        await Prisma.openingHours.delete({
            where: {
                id: day.id
            }
        });
    }
}

export const openingHoursService = new OpeningHoursService;