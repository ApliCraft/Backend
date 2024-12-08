import { z } from 'zod';

export const AddProductValidatorSchema = z.object({
    name: z.string(),
    plName: z.string().optional(),
    kcalPortion: z.number(),
    proteinPortion: z.number(),
    carbohydratesPortion: z.number(),
    fatContentPortion: z.number(),
    excludedDiets: z.array(z.string()).optional(),
    allergens: z.array(z.string()).optional(),
    classType: z.string(),
    base64Image: z.string().optional()
});

export type IAddProductValidatorSchema = z.infer<typeof AddProductValidatorSchema>;