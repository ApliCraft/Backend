"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const getUser = (req, res) => {
    const userId = req.params.id;
    res.send(`User with ID ${userId}`);
};
exports.getUser = getUser;
