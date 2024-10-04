import { Request, Response } from 'express';
import { IUserSchema } from '../utils/validators/userValidator';

export const getUser = (req: Request, res: Response): void => {
    const user = req.body as IUserSchema;

    const userName = user.name;
    const userEmail = user.email;

    res.status(200).send(`User with name: ${userName}, email: ${userEmail}`);
} 