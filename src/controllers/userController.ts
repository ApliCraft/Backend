// Importing express and hashing libraries
import { Request, Response } from 'express';
import jst from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Importing user validator schemas for validating requests 
import { IGetUserValidatorSchema, ICreateUserValidatorSchema } from '../utils/validators/userValidator';
//Importing user model and interface for mongoose validation
import UserSchema, { IUserSchema } from "../models/userModel"
// Importing HTTP status codes for response status codes
import { HttpStatusCode } from '../config/statusCodes';
// Importing user services for database operations
import { searchUser } from '../services/userServices';

const SALT_ROUNDS: number = Number(process.env.SALT_ROUNDS) || 10;

// Function used to get user data from the database with email | name and password
export const getUser = async (req: Request, res: Response): Promise<void> => {
    // Casting body as IGetUserValidatorSchema interface and writing data to variables
    // userName or userEmail will be provided
    const body = req.body as IGetUserValidatorSchema;
    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;

    try {
        // Searches user by name or email and returns the user if found
        const userData = await searchUser(userName, userEmail);
        if (!userData) {
            res.status(HttpStatusCode.NOT_FOUND).send('User not found');
            return;
        }

        // Checks if the password is correct
        const isMatch = await bcrypt.compare(userPassword, userData.password);
        if (!isMatch) {
            res.status(HttpStatusCode.UNAUTHORIZED).send('Incorrect password');
            return;
        }

        // Creates a new userResponseData with user data that will be sent to the client
        const userResponseData = {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            signInDate: userData.signInDate,
        };

        const secretKey: string = process.env.ACCESS_TOKEN_SECRET?.toString() || "21793t21v3ks";

        // // Create JWT token with user data
        const accessToken = jst.sign({ userResponseData }, secretKey);

        res.status(HttpStatusCode.OK).json({ accessToken, userResponseData });
    } catch (error) {
        // The errors caught during the searchUser execution (mongodb errors) or bcrypt comparison 
        console.log(error);
        res.status(HttpStatusCode.INTERNAL_SERVER).send('Internal server error');
    }
}

// Creates a new user with the specified data email, name and password if the user does not exist 
// (name and email must not be in the db)
export const createUser = async (req: Request, res: Response): Promise<void> => {
    // Casting body as ICreateUserValidatorSchema interface and writing data to variables
    const body = req.body as ICreateUserValidatorSchema;
    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;

    // Searches for user with the same email or name, if found responds to client
    try {
        if (await searchUser(userName, userEmail)) {
            res.status(HttpStatusCode.CONFLICT).json({ message: 'User already exists' });
            return;
        }
    } catch (error) {
        // Mongodb internal errors
        console.log(error);
        res.status(HttpStatusCode.INTERNAL_SERVER).json({ message: 'MongoDB error' });
        return;
    }

    // The hashing for the password
    let hash: string;
    try {
        hash = await bcrypt.hash(userPassword, SALT_ROUNDS);
    } catch (error) {
        // Hashing password errors
        console.log(error);
        res.status(HttpStatusCode.INTERNAL_SERVER).json({ message: 'Hashing failed' });
        return;
    }

    // Creates new user with hashed password 
    const user = new UserSchema<IUserSchema>({
        name: userName,
        email: userEmail,
        password: hash,
        isActive: false,
        lastLoginDate: new Date(),
    });

    // Saving user to mongoDB database
    try {
        await user.save();
        res.status(HttpStatusCode.OK).send(`User with name: ${userName} and email: ${userEmail} created successfully.`);
    }
    catch (error) {
        // MongoDB internal errors
        console.log(error);
        res.status(HttpStatusCode.INTERNAL_SERVER).json({ message: 'MongoDB error' });
        return;
    }
}

// Removes user with the specified email | name and password if exists
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    // Casting body as IGetUserValidatorSchema interface and writing data to variables
    const body = req.body as IGetUserValidatorSchema;
    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;

    try {
        // Searching for user in the db with userName or userEmail
        const userData = await searchUser(userName, userEmail);
        if (!userData) {
            res.status(HttpStatusCode.NOT_FOUND).send('User not found');
            return;
        }

        // Checking if the password is correct
        const isMatch = await bcrypt.compare(userPassword, userData.password);
        if (!isMatch) {
            res.status(HttpStatusCode.UNAUTHORIZED).send('Incorrect password');
            return;
        }

        // Deleting user with specified _id
        await UserSchema.deleteOne({ _id: userData._id });
        res.status(HttpStatusCode.NO_CONTENT).json();
    } catch (error) {
        // MongoDB internal errors (deleteOne or findOne) or bcrypt comparison errors
        console.log(error);
        res.status(HttpStatusCode.INTERNAL_SERVER).send('Internal server error');
    }
}

