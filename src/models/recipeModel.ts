import { Schema, model, Types, InferSchemaType } from 'mongoose';

// Image Schema
const ImageSchema = new Schema({
    fileName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    }
})

export type ImageType = InferSchemaType<typeof ImageSchema>;

// Recipe Schema
const RecipeSchema = new Schema({
    _id: {
        type: Types.ObjectId,
        auto: true,
    },
    name: {
        type: String,
        unique: true,
        required: true,
    },
    plName: {
        type: String,
        unique: true,
        sparse: true
    },
    kcalPortion: {
        type: Number,
        required: true,
    },
    proteinPortion: {
        type: Number, required: true,
    },
    carbohydratesPortion: {
        type: Number, required: true,
    },
    fatContentPortion: {
        type: Number, required: true,
    },
    prepareTime: {
        type: Number, required: true,
    },
    difficulty: {
        type: Number, required: true,
    },
    ingredients: [{
        productId: {
            type: String,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    category: {
        type: String, required: true,
    },
    excludedDiets: {
        type: [String],
        required: true,
    },
    allergens: {
        type: [String],
        required: true,
    },
    photo: {
        type: ImageSchema
    },
    author: {
        type: String, required: true,
    },
    addDate: {
        type: Date,
        default: Date.now,
        required: false,
    },
    privacy: {
        type: String,
        enum: ['public', 'private'],
        required: true,
    },
    likeQuantity: {
        type: Number,
        required: true,
    },
    saveQuantity: {
        type: Number,
        required: true,
    },
    preDescription: {
        type: String, required: true,
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
        required: true,
    }
});

export type RecipeType = InferSchemaType<typeof RecipeSchema>;
const Recipe = model<RecipeType>('Recipe', RecipeSchema);
export default Recipe;
