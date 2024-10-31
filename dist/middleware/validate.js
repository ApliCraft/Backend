"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const statusCodes_1 = require("../config/statusCodes");
// import jwt from 'jsonwebtoken';
// import IUserResponseData from '../interfaces/userResponseData';
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            res.status(statusCodes_1.HttpStatusCode.BAD_REQUEST).json({ message: error });
        }
    };
};
exports.validate = validate;
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
//# sourceMappingURL=validate.js.map