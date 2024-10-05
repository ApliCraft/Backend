import { z } from 'zod';

const UserValidatorSchema = z.object({
    name: z.string().min(3).max(30),
    password: z.string().min(8).max(30),
    email: z.string().email(),
});

export default UserValidatorSchema;
export type IUserValidatorSchema = z.infer<typeof UserValidatorSchema>;