"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserValidatorSchema = exports.GetUserValidatorSchema = exports.CreateUserValidatorSchema = void 0;
const zod_1 = require("zod");
exports.CreateUserValidatorSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(30),
    password: zod_1.z.string().min(8).max(30),
    email: zod_1.z.string().email(),
});
exports.GetUserValidatorSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(30).optional(),
    password: zod_1.z.string().min(8).max(30),
    email: zod_1.z.string().email().optional(),
}).refine((data) => data.email || data.name, {
    message: "Either name or email is required",
    path: ['email', 'name'],
});
exports.UpdateUserValidatorSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(30).optional(),
    password: zod_1.z.string().min(8).max(30),
    email: zod_1.z.string().email().optional(),
    newPassword: zod_1.z.string().min(8).max(30).optional(),
    newName: zod_1.z.string().min(3).max(30).optional(),
    newEmail: zod_1.z.string().email().optional(),
}).refine((data) => data.email || data.name, {
    message: "Either name or email is required",
    path: ['email', 'name'],
}).refine((data) => data.newPassword || data.newName || data.newEmail, {
    message: "Either new name, new email or new password is required",
    path: ['newEmail', 'newName', 'newPassword'],
});
//# sourceMappingURL=userValidator.js.map