import { z } from 'zod';

const userSchema = z.object({
    name: z.string().min(3).max(30),
    email: z.string().email(),
});

export default userSchema;
export type IUserSchema = z.infer<typeof userSchema>;