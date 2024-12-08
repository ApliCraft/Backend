import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../config/statusCodes";
import { responseObject } from "../config/defaultResponse";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);

    const response = responseObject("INTERNAL_SERVER", `${err}`, {});
    res.status(HttpStatusCode.INTERNAL_SERVER).json(response);
};
