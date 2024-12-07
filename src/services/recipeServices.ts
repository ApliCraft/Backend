import RecipeSchema, { IRecipeSchema } from "../models/recipeModel";

// Searches database for user with email | name then return user data or null if user not found
// Errors must be handled outside the function (try/catch block)
export async function searchRecipes(searchTerm: string | null = null): Promise<IRecipeSchema[]> {
    let recipes: IRecipeSchema[] = [];

    if (searchTerm) {
        recipes = await RecipeSchema.find({ name: { $regex: new RegExp(searchTerm, "i") } }).lean();
    } else {
        recipes = await RecipeSchema.find().lean();
    }

    return recipes;
}
