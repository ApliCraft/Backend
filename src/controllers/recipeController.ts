import { Request, Response, NextFunction } from "express"
import fs from 'fs/promises';

import RecipeSchema, { ImageType, RecipeType } from "../models/recipeModel";
import { searchRecipes, searchRecipesPl } from "../services/recipeServices";
import { HttpStatusCode } from "../config/statusCodes";
import { IAddRecipeValidatorSchema } from "../utils/validators/recipeValidator";
import { responseObject } from "../config/defaultResponse";
import { searchProductById } from "../services/productServices";
import { Types } from "mongoose";

export const getRecipe = async (req: Request, res: Response, next: NextFunction) => {
    let searchTerm: string = "";

    if (req.body.name) {
        searchTerm = req.body.name;
    }

    try {
        let recipes: (RecipeType & { base64Image?: string })[] = await searchRecipes(searchTerm);

        if (searchTerm !== "") {
            recipes = await Promise.all(recipes.map(async (recipe: RecipeType & { base64Image?: string }): Promise<RecipeType & { base64Image?: string }> => {
                if (recipe.photo) {
                    const imagePath = recipe.photo.filePath;

                    try {
                        await fs.access(imagePath);

                        const imageBuffer = await fs.readFile(imagePath);
                        const base64Image = imageBuffer.toString('base64');
                        recipe.base64Image = base64Image;
                    } catch (err) {
                        // err if image does not exist
                    }
                }

                return recipe;
            }));
        }

        res.status(HttpStatusCode.OK).json(recipes);

        return;
    } catch (err) {
        return next(err);
    }
}

export const addRecipe = async (req: Request, res: Response, next: NextFunction) => {
    const { name, prepareTime, difficulty, ingredients, plName, category, author, privacy, preDescription, description, preparation, keyWords, base64Image } = req.body as IAddRecipeValidatorSchema;
    let kcalPortion: number = 0;
    let proteinPortion: number = 0;
    let carbohydratesPortion: number = 0;
    let fatContentPortion: number = 0;
    let excludedDiets: string[] = [];
    let allergens: string[] = [];

    const productErrors: string[] = [];

    ingredients.forEach((ingredient) => {
        if (!Types.ObjectId.isValid(ingredient.productId)) {
            res.status(400).json('Invalid MongoDB ObjectId');
            return;
        }
    })

    // name must be unique, this code ensures that it is unique
    try {
        const recipes: RecipeType[] = await searchRecipes(name);
        if (recipes.length > 0) {

            const response = responseObject("CONFLICT", `Recipe with name ${name} already exists.`, {});
            res.status(HttpStatusCode.CONFLICT).json(response);
            return
        }
    } catch (err) {
        next(err);
        return;
    }

    // plName must be unique, this code ensures that it is unique
    if (plName) {
        try {
            const products: RecipeType[] = await searchRecipesPl(plName);
            if (products.length > 0) {

                res.status(409).json(`Recipe with name ${plName} already exists.`);
                return
            }
        } catch (err) {
            next(err);
            return;
        }
    }

    // checking privacy value
    if (privacy !== "public" && privacy !== "private") {
        const response = responseObject("BAD_REQUEST", `Privacy must be public or private.`, {});
        res.status(HttpStatusCode.BAD_REQUEST).json(response);
        return
    }

    // calculate based on ingredients
    if (ingredients.length == 0) {
        const response = responseObject("BAD_REQUEST", `Ingredients array cannot be empty.`, {});
        res.status(HttpStatusCode.BAD_REQUEST).json(response);
        return;
    }

    await Promise.all(ingredients.map(async (ingredient) => {
        const product = await searchProductById(ingredient.productId);

        if (!product) {
            productErrors.push(`Ingredient with id: ${ingredient.productId} doesn't exist.`);
        } else {
            kcalPortion += product.kcalPortion * ingredient.quantity;
            proteinPortion += product.proteinPortion * ingredient.quantity;
            carbohydratesPortion += product.carbohydratesPortion * ingredient.quantity;
            fatContentPortion += product.fatContentPortion * ingredient.quantity;

            allergens = [...new Set([...allergens, ...product.allergens])];
            excludedDiets = [...new Set([...excludedDiets, ...product.excludedDiets])];
        }
    }));

    if (productErrors.length > 0) {
        const response = responseObject("BAD_REQUEST", "Some ingredients don't exist.", { productErrors });
        res.status(HttpStatusCode.BAD_REQUEST).json(response);
        return;
    }

    let photo: ImageType | undefined;
    if (base64Image) {
        try {
            const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `${name}-${Date.now()}.png`;
            const filePath = `uploads/images/${fileName}`;

            await fs.writeFile(filePath, buffer);
            photo = {
                fileName,
                filePath,
            }
        } catch (err) {
            console.error(err);

            const response = responseObject("INTERNAL_SERVER", `Error while saving image.`, {});
            res.status(HttpStatusCode.INTERNAL_SERVER).json(response);
            return;
        };
    }

    const newRecipe = new RecipeSchema({
        photo,
        plName,
        prepareTime,
        difficulty,
        ingredients,
        author,
        privacy,
        preDescription,
        name,
        likeQuantity: 0,
        saveQuantity: 0,
        description,
        preparation,
        keyWords: (keyWords || []),
        kcalPortion,
        proteinPortion,
        carbohydratesPortion,
        fatContentPortion,
        category,
        excludedDiets: (excludedDiets || []),
        allergens: (allergens || []),
    });

    try {
        await newRecipe.save();

        const response = responseObject("CREATED", `Recipe with name ${name} created successfully.`, {});
        res.status(HttpStatusCode.CREATED).json(response);
        return;
    } catch (err) {
        return next(err);
    }
}