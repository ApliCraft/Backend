"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const statusCodes_1 = require("../config/statusCodes");
const errorHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(statusCodes_1.HttpStatusCode.INTERNAL_SERVER).send({ errors: [{ message: "Internal server error" }] });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errors.js.map