import { Request, Response, NextFunction } from "express"
import fs from 'fs/promises';

import RecipeSchema, { IRecipeSchema } from "../models/recipeModel";
import { searchRecipes } from "../services/recipeServices";
import { HttpStatusCode } from "../config/statusCodes";
import { IAddRecipeValidatorSchema } from "../utils/validators/recipeValidator";

export const getRecipe = async (req: Request, res: Response, next: NextFunction) => {
    let searchTerm: string = "";

    if (req.body.name) {
        searchTerm = req.body.name;
    }

    try {
        const recipes: (IRecipeSchema & { base64Image?: string })[] = await searchRecipes(searchTerm);
        let filteredRecipes = recipes.map(({ _id, __v, ...filteredData }) => filteredData);

        if (searchTerm !== "") {
            filteredRecipes = await Promise.all(filteredRecipes.map(async (recipe: IRecipeSchema & { base64Image?: string }): Promise<IRecipeSchema & { base64Image?: string }> => {
                if (recipe.photo) {
                    const imagePath = recipe.photo.filePath;

                    try {
                        await fs.access(imagePath);

                        const imageBuffer = await fs.readFile(imagePath);
                        const base64Image = imageBuffer.toString('base64');
                        recipe.base64Image = base64Image;
                    } catch (err) {
                        // err if image does not exist
                        console.log(err);
                    }
                }

                return recipe;
            }));
        }

        res.status(HttpStatusCode.OK).send(filteredRecipes);

        return;
    } catch (err) {
        return next(err);
    }
}

export const addRecipe = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as IAddRecipeValidatorSchema & {
        photo: {
            fileName: string,
            filePath: string,
        }
    };
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

    const { privacy, base64Image, ...filteredBody } = body;

    if (base64Image) {
        try {
            const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `${body.name}-${Date.now()}.png`;
            const filePath = `uploads/images/${fileName}`;

            await fs.writeFile(filePath, buffer);
            filteredBody.photo = {
                fileName,
                filePath,
            }
        } catch (err) {
            console.error(err);
            res.status(HttpStatusCode.INTERNAL_SERVER).send("Error while saving image.");
            return;
        };
    }

    const recipe = new RecipeSchema<IRecipeSchema>({
        ...filteredBody,
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