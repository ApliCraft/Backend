import { Request, Response, NextFunction } from "express";
import { ProductType } from "../../models/productModel";
import { filterProducts } from "../../services/productServices";
import { handleImagesRead } from "../../helpers/handleImagesRead";

export const filterProductsFunction = async (req: Request, res: Response, next: NextFunction) => {
    const { sendImages, ...filters }: { sendImages: boolean } = req.body;

    console.log(filters);

    try {
        let products: (ProductType & { base64Image?: string })[] = await filterProducts(filters);

        if (sendImages) {
            products = await Promise.all(products.map(async (product) => {
                if (product.photo) {
                    const imagePath = product.photo.filePath;
                    product.base64Image = await handleImagesRead(imagePath);
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