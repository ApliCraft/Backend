import { model, Schema, Types } from "mongoose";

export interface IProductSchema {
    _id?: string,
    name: string,
    plName?: string,
    kcalPortion: number,
    proteinPortion: number,
    carbohydratesPortion: number,
    fatContentPortion: number,
    excludedDiets: string[],
    allergens: string[],
    class: string,
    addDate?: Date,
    __v?: number,
    photo?: IImageSchema,
}

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

const ProductSchema = new Schema<IProductSchema>({
    _id: {
        type: Types.ObjectId,
        auto: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
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
        type: Number,
        required: true,
    },
    carbohydratesPortion: {
        type: Number,
        required: true,
    },
    fatContentPortion: {
        type: Number,
        required: true,
    },
    photo: {
        type: ImageSchema
    },
    excludedDiets: {
        type: [String],
        required: true,
    },
    allergens: {
        type: [String],
        required: true,
    },
    class: {
        type: String,
        required: true,
    },
    addDate: {
        type: Date,
        default: Date.now,
    }
});

const Product = model<IProductSchema>('Product', ProductSchema);
export default Product;