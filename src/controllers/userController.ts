import { Request, Response } from 'express';
import { IUserValidatorSchema } from '../utils/validators/userValidator';
import UserSchema, { IUserSchema } from "../models/userModel"

export const getUser = (req: Request, res: Response): void => {
    const body = req.body as IUserValidatorSchema;

    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;

    res.status(200).send(`User with name: ${userName}, email: ${userEmail}, password: ${userPassword}`);
}

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as IUserValidatorSchema;

    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;

    try {
        const userExists = await UserSchema.findOne({
            $or: [
                { email: userEmail },
                { name: userName }
            ]
        });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'User already exists' });
        return;
    }

    const user = new UserSchema<IUserSchema>({
        name: userName,
        email: userEmail,
        password: userPassword,
    });

    try {
        await user.save();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'User already exists' });
        return;
    }

    res.status(200).send(`User with name: ${userName}, email: ${userEmail}, password: ${userPassword} created successfully.`);
}