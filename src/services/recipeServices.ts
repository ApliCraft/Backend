import RecipeSchema, { RecipeType } from "../models/recipeModel";

// Searches database for user with email | name then return user data or null if user not found
// Errors must be handled outside the function (try/catch block)
export async function searchRecipes(searchTerm: string | null = null): Promise<RecipeType[]> {
    let recipes: RecipeType[] = [];

    if (searchTerm) {
        recipes = await RecipeSchema.find({ name: { $regex: new RegExp(searchTerm, "i") } }).populate({
            path: 'ingredients.productId',
            model: 'Product',
        }).lean();
    } else {
        recipes = await RecipeSchema.find().populate({
            path: 'ingredients.productId',
            model: 'Product',
        }).lean();
    }

    return recipes;
}

export async function searchRecipesPl(searchTerm: string): Promise<RecipeType[]> {
    return await RecipeSchema.find({ plName: { $regex: new RegExp(searchTerm, "i") } });
}


export async function searchRecipeById(id: string): Promise<RecipeType | null> {
    return await RecipeSchema.findById(id).populate({
        path: 'ingredients.productId',
        model: 'Product',
    }).lean();
}
