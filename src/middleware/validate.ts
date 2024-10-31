import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/statusCodes';
import { ZodSchema } from 'zod';
// import jwt from 'jsonwebtoken';

// import IUserResponseData from '../interfaces/userResponseData';


export const validate = (schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: error });
        }
    }
}

// export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader?.split(' ')[1];

//     if (!token) {
//         next();
//         return;
//     }

//     const secretKey: string = process.env.ACCESS_TOKEN_SECRET!.toString();

//     jwt.verify(token, secretKey, (err, user) => {
//         if (err) {
//             res.status(HttpStatusCode.FORBIDDEN).json({ message: 'Invalid token' });
//             return;
//         }

//         const userResponseData = user as IUserResponseData;
//         if (userResponseData.email && userResponseData.name) {
//             req.tokenData = userResponseData;
//             req.isAuthenticated = true;
//         }
//         next();
//     })
// }