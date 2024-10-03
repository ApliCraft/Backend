import { Request, Response } from 'express';

export const getUser = (req: Request, res: Response): void => {
    const userName = req.body.name;
    const userEmail = req.body.email;

    res.status(200).send(`User with name: ${userName}, email: ${userEmail}`);
} 