import { Request, Response, NextFunction } from "express";

import ProductSchema, { IProductSchema } from "../models/productModel";
import { searchProducts } from "../services/productServices";
import { IAddProductValidatorSchema } from "../utils/validators/productValidator";

import { HttpStatusCode } from "../config/statusCodes";



export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    let searchTerm: string = "";
    if (req.body.name) {
        searchTerm = req.body.name;
    }

    try {
        const products: IProductSchema[] = await searchProducts(searchTerm);
        const filteredProducts = products.map(({ _id, __v, ...filteredData }) => filteredData)

        return res.status(HttpStatusCode.OK).send(filteredProducts);
    } catch (err) {
        console.log(err);
        return next(err);
    }
}

export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as IAddProductValidatorSchema;
    const searchTerm = body.name;

    try {
        const products: IProductSchema[] = await searchProducts(searchTerm);
        if (products.length > 0) {
            return res.status(HttpStatusCode.CONFLICT).json({ message: 'Product already exists' });
        }
    } catch (err) {
        console.log(err);
        return next(err);
    }

    let { allergens, excludedDiets, ...filteredBody } = body;
    if (allergens == undefined) {
        allergens = [];
    }
    if (excludedDiets == undefined) {
        excludedDiets = [];
    }

    const newProduct = new ProductSchema<IProductSchema>({ ...filteredBody, allergens, excludedDiets });

    try {
        await newProduct.save();

        return res.status(HttpStatusCode.CREATED).send(`Product with name: ${filteredBody.name} created successfully.`);
    } catch (err) {
        return next();
    }
}