import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/statusCodes';
import { ZodSchema } from 'zod';
import { verifyAccessToken } from '../utils/jwt';



export const validate = (schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (error: unknown) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error });
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(400).json('No token provided');
        return;
    }

    try {
        const decoded = verifyAccessToken(token);
        if (!decoded) {
            res.status(401).json('Invalid token.');
            return;
        }

        req.tokenData = decoded;
        next();
    } catch (err) {
        res.sendStatus(500);
        return
    }
}