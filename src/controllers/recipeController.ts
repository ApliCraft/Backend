import { Request, Response, NextFunction } from "express"

export const getRecipes = async (req: Request, res: Response, NextFunction: NextFunction) => {
    res.send("hello");
}