"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            res.status(400).json({ message: error });
        }
    };
};
exports.default = validate;
