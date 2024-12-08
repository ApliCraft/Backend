import { Request, Response, NextFunction } from "express";
import fs from 'fs/promises';
import { IProductSchema } from "../../models/productModel";
import { searchProducts } from "../../services/productServices";
import { responseObject } from "../../config/defaultResponse";
import { HttpStatusCode } from "../../config/statusCodes";

export const getProductFunction = async (req: Request, res: Response, next: NextFunction) => {
    let searchTerm: string = "";
    let sendImages: boolean = false;
    if (req.body.name) {
        searchTerm = req.body.name;
    }

    if (req.body.sendImages === true) {
        sendImages = true;
    }

    try {
        let products: (IProductSchema & { base64Image?: string })[] = await searchProducts(searchTerm);

        if (searchTerm || sendImages) {
            products = await Promise.all(products.map(async (product) => {
                if (product.photo) {
                    const imagePath = product.photo.filePath;

                    try {
                        await fs.access(imagePath);

                        const imageBuffer = await fs.readFile(imagePath);
                        const base64Image = imageBuffer.toString('base64');
                        product.base64Image = base64Image;
                    } catch (err) {
                        console.log(err);
                    }
                }

                return product;
            }));
        }


        const response = responseObject("OK", "Sending products data", { products });
        res.status(HttpStatusCode.OK).json(response);
        return

    } catch (err) {
        console.log(err);
        return next(err);
    }
}