"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const getUser = (req, res) => {
    const userName = req.body.name;
    const userEmail = req.body.email;
    res.status(200).send(`User with name: ${userName}, email: ${userEmail}`);
};
exports.getUser = getUser;
