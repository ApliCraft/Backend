import { Request, Response, NextFunction } from "express";
import { getRecipesByProductId } from "../../services/recipeServices";
import { Types } from "mongoose";


export const getRecipesByProductIdsFunction = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
        res.status(400).json("Invalid product ID");
        return;
    }

    try {
        const recipes = await getRecipesByProductId([id]);
        res.status(200).json(recipes);
    } catch (err) {
        next(err);
        return;
    }
}