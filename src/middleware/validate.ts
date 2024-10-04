import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

const validate = (schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            res.status(400).json({ message: error });
        }
    }
}

export default validate;