import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../config/statusCodes";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(HttpStatusCode.INTERNAL_SERVER).send({ errors: [{ message: "Internal server error" }] });
};
