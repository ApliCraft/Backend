import { Request, Response, NextFunction } from "express";
import fs from 'fs/promises';

import { IAddProductValidatorSchema } from "../../utils/validators/productValidator";
import ProductSchema, { ProductType } from "../../models/productModel";
import { searchProducts, filterProducts } from "../../services/productServices";
import { IImageSchema } from "../../models/recipeModel";

export const addProductFunction = async (req: Request, res: Response, next: NextFunction) => {
    const { name, plName, kcalPortion, proteinPortion, carbohydratesPortion, fatContentPortion, classType, excludedDiets, allergens, base64Image } = req.body as IAddProductValidatorSchema;

    // name must be unique, this code ensures that it is unique
    try {
        const products: ProductType[] = await searchProducts(name, true);
        if (products.length > 0) {

            res.status(409).json(`Product with name: ${name} already exists.`);
            return
        }
    } catch (err) {
        next(err);
        return;
    }

    // plName must be unique, this code ensures that it is unique
    if (plName) {
        try {
            const products: ProductType[] = await filterProducts({ plName });
            if (products.length > 0) {

                res.status(409).json(`Product with plName: ${plName} already exists.`);
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

            res.status(500).json("Error while saving image.");
            return;
        };
    }

    const newProduct = new ProductSchema<ProductType>({
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
        addDate: new Date()
    });

    try {
        await newProduct.save();

        res.status(201).json(`Product with name ${name} was successfully saved.`);
        return;
    } catch (err) {
        return next(err);
    }
}