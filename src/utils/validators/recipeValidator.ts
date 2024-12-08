import { z } from 'zod';

export const AddRecipeValidatorSchema = z.object({
    name: z.string(),
    plName: z.string().optional(),
    prepareTime: z.number(),
    difficulty: z.number(),
    ingredients: z.array(z.object({
        productId: z.string(),
        quantity: z.number(),
    })),
    category: z.string(),
    // photo: z.string(),
    author: z.string(),
    addDate: z.date().optional(),
    privacy: z.string(),
    preDescription: z.string(),
    description: z.string(),
    preparation: z.string(),
    keyWords: z.array(z.string()),
    base64Image: z.string().optional(),
});

export type IAddRecipeValidatorSchema = z.infer<typeof AddRecipeValidatorSchema>;