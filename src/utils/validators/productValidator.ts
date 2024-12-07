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
    class: z.string(),
    addDate: z.date().optional(),
});

export type IAddProductValidatorSchema = z.infer<typeof AddProductValidatorSchema>;