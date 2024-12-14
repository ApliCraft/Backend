import { Types } from "mongoose";
import Recipe, { RecipeType } from "../models/recipeModel";

// Searches database for user with email | name then return user data or null if user not found
// Errors must be handled outside the function (try/catch block)
export async function searchRecipes(searchTerm: string | null = null): Promise<RecipeType[]> {
    let recipes: RecipeType[] = [];

    if (searchTerm) {
        recipes = await Recipe.find({ name: { $regex: new RegExp(searchTerm, "i") } }).populate({
            path: 'ingredients.productId',
            model: 'Product',
        }).lean();
    } else {
        recipes = await Recipe.find().populate({
            path: 'ingredients.productId',
            model: 'Product',
        }).lean();
    }

    return recipes;
}

export async function searchRecipesPl(searchTerm: string): Promise<RecipeType[]> {
    return await Recipe.find({ plName: { $regex: new RegExp(searchTerm, "i") } });
}


export async function searchRecipeById(id: string): Promise<RecipeType | null> {
    return await Recipe.findById(id).populate({
        path: 'ingredients.productId',
        model: 'Product',
    }).populate({
        path: 'author',
        model: 'User',
        select: "_id username email"
    }).lean();
}

export async function getRecipesByProductId(ingredientIds: string[]) {
    const objectIds = ingredientIds.map(id => new Types.ObjectId(id));

    const recipes = await Recipe.find({
        'ingredients.productId': { $in: objectIds },
    });

    return recipes;
}