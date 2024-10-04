"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const getUser = (req, res) => {
    const user = req.body;
    const userName = user.name;
    const userEmail = user.email;
    res.status(200).send(`User with name: ${userName}, email: ${userEmail}`);
};
exports.getUser = getUser;
