import { Request, Response, NextFunction } from "express";
import { deleteProduct } from "../../services/productServices";
import { Types } from "mongoose";


export const deleteOneProductFunction = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.body;

    if (!id) {
        res.status(400).json(`Missing product id to remove.`);
        return;
    }

    if (!Types.ObjectId.isValid(id)) {
        res.status(400).json('Invalid MongoDB ObjectId');
        return;
    }

    try {
        const result = await deleteProduct(id);

        if (!result) {
            res.status(404).json(`Product with id ${id} not found.`);
            return;
        }

        res.status(204).json(`Product with id ${id} deleted`);
        return;
    } catch (err) {
        return next(err);
    }
}