import { z } from 'zod';

export const CreateUserValidatorSchema = z.object({
    username: z.string().min(3).max(30),
    password: z.string().min(8).max(30),
    email: z.string().email(),
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
}).refine((data) => data.newPassword || data.newUsername || data.newEmail, {
    message: "Either new name, new email or new password is required",
    path: ['newEmail', 'newName', 'newPassword'],
});

export type ICreateUserValidatorSchema = z.infer<typeof CreateUserValidatorSchema>;
export type IGetUserValidatorSchema = z.infer<typeof GetUserValidatorSchema>;
export type IUpdateUserValidatorSchema = z.infer<typeof UpdateUserValidatorSchema>;