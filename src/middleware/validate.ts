import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const validate = (schema: Joi.Schema): (req: Request, res: Response, next: NextFunction) => void => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error } = schema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        next();
    }
}

export default validate;