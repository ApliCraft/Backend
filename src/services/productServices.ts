import ProductSchema, { IProductSchema } from "../models/productModel";

// Searches database for user with email | name then return user data or null if user not found
// Errors must be handled outside the function (try/catch block)
export async function searchProducts(searchTerm: string | null = null): Promise<IProductSchema[]> {
    let products: IProductSchema[] = [];

    if (searchTerm) {
        products = await ProductSchema.find({ name: { $regex: new RegExp(searchTerm, "i") } }).lean();
    } else {
        products = await ProductSchema.find().lean();
    }

    return products;
}
