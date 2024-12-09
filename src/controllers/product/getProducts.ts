import { Request, Response, NextFunction } from "express";
import { ProductType } from "../../models/productModel";
import { getProducts } from "../../services/productServices";
import { handleImagesRead } from "../../helpers/handleImagesRead";

export const getProductsFunction = async (req: Request, res: Response, next: NextFunction) => {
    const { sendImages }: { sendImages: boolean } = req.body;

    try {
        let products: (ProductType & { base64Image?: string })[] = await getProducts();

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