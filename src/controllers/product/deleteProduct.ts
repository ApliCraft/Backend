import { Request, Response, NextFunction } from "express";
import { responseObject } from "../../config/defaultResponse";
import { HttpStatusCode } from "../../config/statusCodes";
import { deleteProduct } from "../../services/productServices";


export const deleteProductFunction = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.body;

    if (!id) {
        const response = responseObject("BAD_REQUEST", "Missing product id to remove.", {});
        res.status(HttpStatusCode.BAD_REQUEST).json(response);
        return;
    }

    try {
        const result = await deleteProduct(id);

        if (!result) {
            const response = responseObject("BAD_REQUEST", "Specified element not found.", {});
            res.status(HttpStatusCode.BAD_REQUEST).json(response);
            return;
        }

        const response = responseObject("OK", "Removed specified element.", {});
        res.status(HttpStatusCode.OK).json(response);
        return;
    } catch (err) {
        return next(err);
    }
}