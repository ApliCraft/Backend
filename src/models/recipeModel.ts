import { Schema, model, Types } from 'mongoose';

export interface IRecipeSchema {
    _id?: string,
    name: string,
    plName?: string,
    kcalPortion: number,
    proteinPortion: number,
    carbohydratesPortion: number,
    fatContentPortion: number,
    prepareTime?: number,
    difficulty?: number,
    ingredients: IIngredientSchema[],
    category: string,
    excludeDiets: string[],
    allergens: string[],
    photo?: IImageSchema,
    author: string,
    addDate?: Date,
    privacy: "public" | "private",
    likeQuantity: number,
    saveQuantity: number,
    uploadQuantity: number,
    preDescription: string,
    description: string,
    preparation: string,
    keyWords: string[],
    __v?: string,
}

// Ingredient Schema
export interface IIngredientSchema {
    productId?: string
    quantity: number,
}

const IngredientSchema = new Schema<IIngredientSchema>({
    productId: {
        type: Types.ObjectId,
        required: true,
    },
    quantity: {
        type: Number,
        required: true
    },
});

// Image Schema
export interface IImageSchema {
    fileName: string,
    filePath: string,
}

const ImageSchema = new Schema<IImageSchema>({
    fileName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    }
})

const RecipeSchema = new Schema<IRecipeSchema>({
    _id: {
        type: Types.ObjectId,
        auto: true,
    },
    name: {
        type: String,
        required: true,
    },
    plName: {
        type: String
    },
    kcalPortion: {
        type: Number,
    },
    proteinPortion: {
        type: Number,
    },
    carbohydratesPortion: {
        type: Number,
    },
    fatContentPortion: {
        type: Number,
    },
    prepareTime: {
        type: Number,
    },
    difficulty: {
        type: Number,
    },
    ingredients: {
        type: [IngredientSchema],
        default: [],
        required: true,
    },
    category: {
        type: String,
    },
    excludeDiets: {
        type: [String],
        default: [],
    },
    allergens: {
        type: [String],
        default: [],
    },
    photo: {
        type: ImageSchema
    },
    author: {
        type: String
    },
    addDate: {
        type: Date,
        default: Date.now,
    },
    privacy: {
        type: String,
        enum: ['public', 'private'],
        default: 'public',
    },
    likeQuantity: {
        type: Number,
        default: 0,
    },
    saveQuantity: {
        type: Number,
        default: 0,
    },
    preDescription: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    preparation: {
        type: String,
        required: true,
    },
    keyWords: {
        type: [String],
        default: [],
    }
})

const Recipe = model<IRecipeSchema>('Recipe', RecipeSchema);
export default Recipe;