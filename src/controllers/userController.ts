import { Request, Response } from 'express';
import { IUserValidatorSchema } from '../utils/validators/userValidator';
import UserSchema, { IUserSchema } from "../models/userModel"
import { HttpStatusCode } from '../config/statusCodes';
import bcrypt from 'bcrypt';

export const getUser = (req: Request, res: Response): void => {
    const body = req.body as IUserValidatorSchema;

    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;

    res.status(HttpStatusCode.OK).send(`User with name: ${userName}, email: ${userEmail}, password: ${userPassword}`);
}

export const createUser = async (req: Request, res: Response): Promise<void> => {
    // save the request body to body variable with correct types 
    const body = req.body as IUserValidatorSchema;

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
    const body = req.body as IUserValidatorSchema;

    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;
}

// Searches database for user with email or name then return user data or null if user not found
async function searchUser(userName: string, userEmail?: string): Promise<IUserSchema | null> {
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