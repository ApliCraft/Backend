// Importing express and hashing libraries
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';

import { IGetUserValidatorSchema, ICreateUserValidatorSchema, IUpdateUserValidatorSchema } from '../utils/validators/userValidator';
import UserSchema, { DeviceInfoSchemaType, UserType } from "../models/userModel"
import { searchUser } from '../services/userServices';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt';
import User from '../models/userModel';

const SALT_ROUNDS: number = Number(process.env.SALT_ROUNDS) || 10;

export const checkToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(400).json('No token provided');
        return;
    }

    try {
        const decoded = verifyAccessToken(token);
        if (!decoded) {
            res.status(401).json('Invalid token.');
            return;
        }

        res.status(200).json("Token is valid.")
    } catch (err) {
        next(err);
        return;
    }
};

export const checkTokenStrict = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(400).json('No token provided');
        return;
    }

    try {
        const decoded = verifyAccessToken(token);
        if (!decoded) {
            res.status(401).json('Invalid token.');
            return;
        }

        const user = await User.findById(decoded.sub);

        if (!user) {
            res.status(404).json('User not found for this token.');
            return;
        }

        if (user.jwtToken !== token) {
            res.status(403).send('Token is invalid.');
            return;
        }

        res.status(200).json("Token is valid.")
    } catch (err) {
        next(err);
        return;
    }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400).json("No refresh token provided.");
        return
    }


    try {
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            res.status(401).json('Invalid refresh token.');
            return;
        }
        const user = await User.findById(decoded.sub);

        if (!user) {
            res.status(404).json('User not found for this token.');
            return;
        }

        if (user.refreshToken !== refreshToken) {
            res.status(403).send('Token is invalid.');
            return;
        }

        const accessToken = generateAccessToken(user._id as string, user.roles);
        const newRefreshToken = generateRefreshToken(user._id as string);
        user.jwtToken = accessToken;
        user.refreshToken = newRefreshToken;

        if (req.useragent) {
            user.devicesLoginInfo.push(req.useragent as DeviceInfoSchemaType);
        }

        await user.save();
        res.status(200).json({ accessToken, newRefreshToken });
        return;
    } catch (err) {
        next(err);
        return;
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body as IGetUserValidatorSchema;

    try {
        const user: UserType | null = await searchUser(email);
        if (!user) {
            res.status(404).json('User not found');
            return;
        }

        const isMatch: boolean = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json('Incorrect password');
            return;
        }

        const accessToken = generateAccessToken(user._id as string, user.roles);
        const refreshToken = generateRefreshToken(user._id as string);

        if (req.useragent) {
            user.devicesLoginInfo.push(req.useragent as DeviceInfoSchemaType);
        }

        user.refreshToken = refreshToken;
        user.jwtToken = accessToken;

        await user.save();

        res.status(200).json({ accessToken, refreshToken });
    } catch (err) {
        next(err);
        return;
    }
}


export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, email, password } = req.body as ICreateUserValidatorSchema;

    try {
        if (await searchUser(email, username)) {
            res.status(409).json("User already exists.");
            return;
        }
    } catch (err) {
        next(err);
        return;
    }

    let passwordHash: string;
    try {
        passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    } catch (err) {
        next(err);
        return;
    }

    const user = new UserSchema({
        username,
        email,
        password: passwordHash,
        activityLogs: [{ message: "Account creation.", date: new Date() }],
    });

    try {
        if (req.useragent) {
            user.devicesLoginInfo.push(req.useragent as DeviceInfoSchemaType);
        }
        await user.save();
        res.status(201).json(`User with name: ${username} and email: ${email} created successfully.`);
        return;
    }
    catch (err) {
        next(err);
        return;
    }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const body: IGetUserValidatorSchema = req.body as IGetUserValidatorSchema;
    const userEmail: string | undefined = body.email;
    const userPassword: string = body.password;

    try {
        const userData: UserType | null = await searchUser(userEmail);
        if (!userData) {
            res.status(409).json('User not found');
            return;
        }

        const isMatch: boolean = await bcrypt.compare(userPassword, userData.password);
        if (!isMatch) {
            res.status(401).json('Incorrect password');
            return;
        }

        await UserSchema.deleteOne({ _id: userData._id });
        res.status(204).json();
    } catch (err) {
        next(err);
        return;
    }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, newUsername, newPassword, newEmail } = req.body as IUpdateUserValidatorSchema;

    try {
        // Searching for user in the db with userName or userEmail
        const userData: UserType | null = await searchUser(email);
        if (!userData) {
            res.status(404).json('User not found');
            return;
        }

        // Checking if the password is correct
        const isMatch: boolean = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            res.status(401).json('Incorrect password');
            return;
        }

        // Updating with specified _id
        if (newUsername) {
            const users = await UserSchema.find({ username: newUsername });
            if (users.length > 0) {
                res.status(409).json("User already exists");
                return;
            }

            userData.activityLogs.push({ message: `Username changed from ${userData.username} to ${newUsername}.`, date: new Date() });
            userData.username = newUsername;
        }
        if (newPassword) {
            const hash: string = await bcrypt.hash(newPassword, SALT_ROUNDS);

            if (password === newPassword) {
                res.status(409).json("Passwords must be different.");
                return;
            }

            userData.activityLogs.push({ message: `Password changed.`, date: new Date() });
            userData.password = hash;
        }
        if (newEmail) {
            const users = await UserSchema.find({ email: newEmail });
            if (users.length > 0) {
                res.status(409).json("User with this email already exists");
                return;
            }

            userData.activityLogs.push({
                message: `Email changed from ${userData.email} to ${newEmail}.`, date: new Date()
            });
            userData.email = newEmail;
        }

        await userData.save();
        res.status(204).json();
    } catch (err) {
        // MongoDB internal errors (findOneAndUpdate or findOne) or bcrypt comparison, hashing errors
        next(err);
        return;
    }
}

export const devicesLoginInfo = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(400).json('No token provided');
        return;
    }

    try {
        const decoded = verifyAccessToken(token);
        if (!decoded) {
            res.status(401).json('Invalid token.');
            return;
        }

        const user = await User.findById(decoded.sub);

        if (!user) {
            res.status(404).json('User not found for this token.');
            return;
        }

        if (user.jwtToken !== token) {
            res.status(403).send('Token is invalid.');
            return;
        }

        res.status(200).json(user.devicesLoginInfo as DeviceInfoSchemaType);
    } catch (err) {
        next(err);
        return;
    }
}