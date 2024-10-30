import { z } from 'zod';

export const CreateUserValidatorSchema = z.object({
    name: z.string().min(3).max(30),
    password: z.string().min(8).max(30),
    email: z.string().email(),
});

export const GetUserValidatorSchema = z.object({
    name: z.string().min(3).max(30).optional(),
    password: z.string().min(8).max(30),
    email: z.string().email().optional(),
}).refine((data) => data.email || data.name, {
    message: "Either name or email is required",
    path: ['email', 'name'],
});

export const UpdateUserValidatorSchema = z.object({
    name: z.string().min(3).max(30).optional(),
    password: z.string().min(8).max(30),
    email: z.string().email().optional(),
    newPassword: z.string().min(8).max(30).optional(),
    newName: z.string().min(3).max(30).optional(),
    newEmail: z.string().email().optional(),
}).refine((data) => data.email || data.name, {
    message: "Either name or email is required",
    path: ['email', 'name'],
}).refine((data) => data.newPassword || data.newName || data.newEmail, {
    message: "Either new name, new email or new password is required",
    path: ['newEmail', 'newName', 'newPassword'],
});

export type ICreateUserValidatorSchema = z.infer<typeof CreateUserValidatorSchema>;
export type IGetUserValidatorSchema = z.infer<typeof GetUserValidatorSchema>;
export type IUpdateUserValidatorSchema = z.infer<typeof UpdateUserValidatorSchema>;