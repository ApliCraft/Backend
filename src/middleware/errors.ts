import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../config/statusCodes";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(HttpStatusCode.INTERNAL_SERVER).send({ errors: [{ message: "Internal server error" }] });
};
