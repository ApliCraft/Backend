import { Request, Response } from 'express';

export const getUser = (req: Request, res: Response): void => {
    const userId = req.params.id;

    res.status(200).send(`User with ID ${userId}`);
} 