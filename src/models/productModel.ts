import { InferSchemaType, model, Schema, Types } from "mongoose";

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

const ProductSchema = new Schema({
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


export type ProductType = InferSchemaType<typeof ProductSchema>;
const Product = model<ProductType>('Product', ProductSchema);
export default Product;