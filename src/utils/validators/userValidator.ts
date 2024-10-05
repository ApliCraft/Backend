import { z } from 'zod';

export const CreateUserValidatorSchema = z.object({
    name: z.string().min(3).max(30),
    password: z.string().min(8).max(30),
    email: z.string().email(),
});

export type ICreateUserValidatorSchema = z.infer<typeof CreateUserValidatorSchema>;

export const GetUserValidatorSchema = z.object({
    name: z.string().min(3).max(30).optional(),
    password: z.string().min(8).max(30),
    email: z.string().email().optional(),
}).refine((data) => data.email || data.name, {
    message: "Either name or email is required",
    path: ['email', 'name'],
});;

export type IGetUserValidatorSchema = z.infer<typeof GetUserValidatorSchema>;