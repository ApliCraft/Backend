import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { IGetUserValidatorSchema, ICreateUserValidatorSchema } from '../utils/validators/userValidator';
import UserSchema, { IUserSchema } from "../models/userModel"
import { HttpStatusCode } from '../config/statusCodes';

export const getUser = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as IGetUserValidatorSchema;
    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;

    try {
        const userData = await searchUser(userName, userEmail);
        if (!userData) {
            res.status(HttpStatusCode.NOT_FOUND).send('User not found');
            return;
        }

        // checks if the password is correct
        const isMatch = await bcrypt.compare(userPassword, userData.password);
        if (!isMatch) {
            res
                .status(HttpStatusCode.UNAUTHORIZED)
                .send('Incorrect password');
            return;
        }

        const userResponseData = {
            name: userData.name,
            email: userData.email,
            signInDate: userData.signInDate,
        };

        res
            .status(HttpStatusCode.OK)
            .json(userResponseData);
    } catch (error) {
        res
            .status(HttpStatusCode.INTERNAL_SERVER)
            .send('Internal server error');
    }
}

export const createUser = async (req: Request, res: Response): Promise<void> => {
    // save the request body to body variable with correct types 
    const body = req.body as ICreateUserValidatorSchema;

    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;

    // searches the database for the user
    try {
        // if user was found then responds with conflict status and returns
        if (await searchUser(userName, userEmail)) {
            res
                .status(HttpStatusCode.CONFLICT)
                .json({ message: 'User already exists' });
            return;
        }
    } catch (error) {
        console.log(error);
        res
            .status(HttpStatusCode.INTERNAL_SERVER)
            .json({ message: 'MongoDB error' });
        return;
    }

    // the hashing for the password
    let hash: string;
    try {
        // tries to hash the password using bcrypt
        hash = await bcrypt.hash(userPassword, 10);
    } catch (error) {
        console.log(error);
        res
            .status(HttpStatusCode.INTERNAL_SERVER)
            .json({ message: 'Hashing failed' });
        return;
    }

    // creates new user with hashed password and saves it to the database
    const user = new UserSchema<IUserSchema>({
        name: userName,
        email: userEmail,
        password: hash,
        signInDate: new Date(),
    });

    try {
        await user.save();
    }
    catch (error) {
        console.log(error);
        res
            .status(HttpStatusCode.INTERNAL_SERVER)
            .json({ message: 'User already exists' });
        return;
    }

    res
        .status(HttpStatusCode.OK)
        .send(`User with name: ${userName}, email: ${userEmail}, password: ${userPassword} created successfully.`);
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as ICreateUserValidatorSchema;

    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;
}

// Searches database for user with email or name then return user data or null if user not found
async function searchUser(userName?: string | undefined, userEmail?: string | undefined): Promise<IUserSchema | null> {
    const userData = await UserSchema.findOne({
        $or: [
            { email: userEmail },
            { name: userName }
        ]
    });

    if (userData) {
        return userData;
    }

    return null;
}