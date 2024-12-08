import { Request, Response, NextFunction } from "express";
import fs from 'fs/promises';

import { IAddProductValidatorSchema } from "../../utils/validators/productValidator";
import ProductSchema, { IProductSchema } from "../../models/productModel";
import { searchProducts, searchProductsPl } from "../../services/productServices";
import { HttpStatusCode } from "../../config/statusCodes";
import { IImageSchema } from "../../models/recipeModel";
import { responseObject } from "../../config/defaultResponse";

export const addProductFunction = async (req: Request, res: Response, next: NextFunction) => {
    const { name, plName, kcalPortion, proteinPortion, carbohydratesPortion, fatContentPortion, classType, excludedDiets, allergens, base64Image } = req.body as IAddProductValidatorSchema;

    // name must be unique, this code ensures that it is unique
    try {
        const products: IProductSchema[] = await searchProducts(name);
        if (products.length > 0) {

            const response = responseObject("CONFLICT", `Product with name ${name} already exists.`, {});
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
            const products: IProductSchema[] = await searchProductsPl(plName);
            if (products.length > 0) {

                const response = responseObject("CONFLICT", `Product with plName ${plName} already exists.`, {});
                res.status(HttpStatusCode.CONFLICT).json(response);
                return
            }
        } catch (err) {
            next(err);
            return;
        }
    }

    let photo: IImageSchema | undefined;
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

    const newProduct = new ProductSchema<IProductSchema>({
        photo,
        name,
        plName,
        kcalPortion,
        proteinPortion,
        carbohydratesPortion,
        fatContentPortion,
        class: classType,
        excludedDiets: (excludedDiets || []),
        allergens: (allergens || []),
    });

    try {
        await newProduct.save();

        const response = responseObject("CREATED", `Product with name ${name} created successfully.`, {});
        res.status(HttpStatusCode.CREATED).json(response);
        return;
    } catch (err) {
        return next(err);
    }
}