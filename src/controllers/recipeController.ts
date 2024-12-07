import { Request, Response, NextFunction } from "express"

import RecipeSchema, { IRecipeSchema } from "../models/recipeModel";
import { searchRecipes } from "../services/recipeServices";
import { HttpStatusCode } from "../config/statusCodes";
import { IAddRecipeValidatorSchema } from "../utils/validators/recipeValidator";

// // const recipe = new RecipeSchema<IRecipeSchema>({
//     name: "Fruit salad",
//     plName: "Sałatka owocowa",

//     "kcalPortion": 120,
//     proteinPortion: 1.2,
//     carbohydratesPortion: 0.5,
//     fatContentPortion: 0.3,
//     prepareTime: 10,
//     difficulty: 2,
//     ingredients: [
//         { productId: "6754cad3dcb44cc2ef70e47e", quantity: 150 }
//     ],
//     category: "Śniadanie",
//     excludeDiets: ["Gluten"],
//     allergens: [],
//     photo: { fileName: "sdfg", filePath: "dfg" },
//     author: "admin",
//     privacy: "public",
//     likeQuantity: 5,
//     saveQuantity: 0,
//     uploadQuantity: 0,
//     preDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
//     description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     preparation: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     keyWords: ["owoce", "sałatka"]
// });

export const getRecipe = async (req: Request, res: Response, next: NextFunction) => {
    let searchTerm: string = "";

    if (req.body.name) {
        searchTerm = req.body.name;
    }

    try {
        const recipes: IRecipeSchema[] = await searchRecipes(searchTerm);
        const filteredRecipes = recipes.map(({ _id, __v, ...filteredData }) => filteredData);
        res.status(HttpStatusCode.OK).send(filteredRecipes);

        return;
    } catch (err) {
        return next(err);
    }
}

export const addRecipe = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as IAddRecipeValidatorSchema;
    const searchTerm = body.name;

    try {
        const recipes: IRecipeSchema[] = await searchRecipes(searchTerm);
        if (recipes.length > 0) {
            res.status(HttpStatusCode.CONFLICT).send(`Recipe ${body.name} already exists.`);
            return;
        }
    } catch (err) {
        return next(err);
    }

    if (body.privacy !== "public" && body.privacy !== "private") {
        res.status(HttpStatusCode.BAD_REQUEST).send("Invalid privacy value.");
        return;
    }

    const { privacy, ...filteredBody } = body;

    const recipe = new RecipeSchema<IRecipeSchema>({
        ...body,
        privacy,
        kcalPortion: 1,
        proteinPortion: 1,
        carbohydratesPortion: 1,
        fatContentPortion: 1,
        excludeDiets: [],
        allergens: [],
        likeQuantity: 0,
        saveQuantity: 0,
        uploadQuantity: 0,
    });

    try {
        await recipe.save();
        res.status(HttpStatusCode.CREATED).send(`Recipe name ${filteredBody.name} created successfully.`);
        return
    } catch (err) {
        return next(err);
    }
}