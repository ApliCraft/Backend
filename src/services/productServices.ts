import ProductSchema, { ProductType } from "../models/productModel";

// Searches database for user with email | name then return user data or null if user not found
// Errors must be handled outside the function (try/catch block)
export const getProducts = async () => await ProductSchema.find().lean();

export const filterProducts = async (filters: {}) => await ProductSchema.find(filters).lean();

export async function searchProductsPl(searchTerm: string | null = null): Promise<ProductType[]> {
    let products: ProductType[] = [];

    if (searchTerm) {
        products = await ProductSchema.find({ plName: { $regex: new RegExp(searchTerm, "i") } }).lean();
    } else {
        products = await ProductSchema.find().lean();
    }

    return products;
}

export const searchProducts = async (searchTerm: string, strict = false) => {
    if (strict) {
        return await ProductSchema.find({ name: searchTerm }).lean();
    }

    return await ProductSchema.find({ name: { $regex: new RegExp(searchTerm, "i") } }).lean();
}

export async function deleteProduct(id: string) {
    return await ProductSchema.findByIdAndDelete(id);
}

export async function searchProductById(id: string): Promise<ProductType | null> {
    return await ProductSchema.findById(id).lean();
}
