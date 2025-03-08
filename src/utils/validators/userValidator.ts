import { z } from 'zod';

export const CreateUserValidatorSchema = z.object({
    username: z.string().min(3).max(30),
    password: z.string().min(8).max(30),
    email: z.string().email(),
    dateOfBirth: z.string().refine(dateStr => {
        const date = new Date(dateStr);
        const ageDiff = new Date().getFullYear() - date.getFullYear();
        return ageDiff > 13 || (ageDiff === 13 && new Date().getMonth() >= date.getMonth() && new Date().getDate() >= date.getDate());
    }, {
        message: "User must be at least 13 years old."
    }),
    phoneNumber: z.string().optional(),
    country: z.string().optional(),
});

export const GetUserValidatorSchema = z.object({
    password: z.string().min(8).max(30),
    email: z.string().email(),
});

export const UpdateUserValidatorSchema = z.object({
    password: z.string().min(8).max(30),
    email: z.string().email(),
    newPassword: z.string().min(8).max(30).optional(),
    newUsername: z.string().min(3).max(30).optional(),
    newEmail: z.string().email().optional(),
    dateOfBirth: z.string().refine(dateStr => {
        const date = new Date(dateStr);
        const ageDiff = new Date().getFullYear() - date.getFullYear();
        return ageDiff > 13 || (ageDiff === 13 && new Date().getMonth() >= date.getMonth() && new Date().getDate() >= date.getDate());
    }, {
        message: "User must be at least 13 years old."
    }),
    phoneNumber: z.string().optional(),
    country: z.string().optional(),
}).refine((data) => data.newPassword || data.newUsername || data.newEmail || data.dateOfBirth || data.phoneNumber || data.country, {
    message: "At least one field must be updated.",
    path: ['newEmail', 'newName', 'newPassword', 'dateOfBirth', 'phoneNumber', 'country'],
});

export type ICreateUserValidatorSchema = z.infer<typeof CreateUserValidatorSchema>;
export type IGetUserValidatorSchema = z.infer<typeof GetUserValidatorSchema>;
export type IUpdateUserValidatorSchema = z.infer<typeof UpdateUserValidatorSchema>;