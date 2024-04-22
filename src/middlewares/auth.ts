import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { User } from '@prisma/client';
import { Prisma } from '../../config/expressConfig';
import { PermissionError } from '../../errors/PermissionError';
import { Request, Response, NextFunction } from 'express';
import { getEnv } from '../../utils/functions/getEnv';
import { NotAuthorizedError } from '../../errors/NotAuthorizedError';
import { statusCodes } from '../../utils/constants/statusCodes';
import { ConflictError } from '../../errors/ConflictError';

export function generateJWT(user: Omit<User, 'name' | 'email' | 'password' | 'phone'>, res: Response) {
    const body = {
        id: user.id,
        role: user.role
    };
    
    const token = sign({ user: body }, getEnv('SECRET_KEY'), { expiresIn: getEnv('JWT_EXPIRATION')});

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: getEnv('NODE_ENV') !== 'development',
    });
}

function cookieExtractor(req: Request) {
    let token = null;

    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }

    return token;
}

export async function loginMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await Prisma.user.findUnique({
            where: {
                email: req.body.email 
            },
            select: {
                id: true,
                name: false,
                email: false,
                password: true,
                role: true,
                phone: false
            }
        });

        if (!user) {
            throw new NotAuthorizedError('Email or password incorrect!');
        }

        const matchingPassword = await compare(req.body.password, user.password);
      
        if (!matchingPassword) {
            throw new NotAuthorizedError('Email or password incorrect!');
        }

        generateJWT(user, res);
      
        res.status(statusCodes.SUCCESS).json({id: user.id});
    } catch (error) {
      next(error);
    }
  }

export function notLoggedIn(req: Request, res: Response, next: NextFunction) {
    try {
        const token = cookieExtractor(req);
  
        if (token) {
            const decoded = verify(token, getEnv('SECRET_KEY'));

            if (decoded) {
                throw new ConflictError('You are already logged in the system!');
            }
        }

        next();
    } catch (error) {
      next(error);
    }
}

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
    try {
        const token = cookieExtractor(req);
  
        if (token) {
            const decoded = verify(token, getEnv('SECRET_KEY')) as JwtPayload;
            req.user = decoded.user;
        }

        if (!req.user) {
            throw new PermissionError('You need to be logged to perform this action!');
        }

        next();
    } catch (error) {
        next(error);
    }
}

export const checkRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {

        try {
            ! roles.includes(req.user!.role) ? res.status(statusCodes.UNAUTHORIZED).json('You do not have permission to perform this action.') : next();
        } catch(error){
            next(error);
        }
    };
};