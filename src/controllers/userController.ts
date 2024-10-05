import { Request, Response } from 'express';
import { IUserSchema } from '../utils/validators/userValidator';

export const getUser = (req: Request, res: Response): void => {
    const body = req.body as IUserSchema;

    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;

    res.status(200).send(`User with name: ${userName}, email: ${userEmail}, password: ${userPassword}`);
} 