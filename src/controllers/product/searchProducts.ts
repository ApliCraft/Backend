import { Request, Response, NextFunction } from "express";
import fs from 'fs/promises';
import { searchProducts } from "../../services/productServices";
import { ProductType } from "../../models/productModel";

export const searchProductsFunction = async (req: Request, res: Response, next: NextFunction) => {
    const { sendImages, searchTerm }: { sendImages: boolean, searchTerm: string | undefined } = req.body;

    if (!searchTerm) {
        res.status(400).json("No search term specified");
        return;
    }

    try {
        let products: (ProductType & { base64Image?: string })[] = await searchProducts(searchTerm);

        if (sendImages) {
            products = await Promise.all(products.map(async (product) => {
                if (product.photo) {
                    const imagePath = product.photo.filePath;

                    try {
                        await fs.access(imagePath);

                        const imageBuffer = await fs.readFile(imagePath);
                        const base64Image = imageBuffer.toString('base64');
                        product.base64Image = base64Image;
                        console.log(product.base64Image);
                    } catch (err) {
                        console.log(err);
                    }
                }

                return product;
            }));
        }

        res.status(200).json(products);
        return

    } catch (err) {
        console.log(err);
        return next(err);
    }
}