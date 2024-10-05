"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const getUser = (req, res) => {
    const body = req.body;
    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;
    res.status(200).send(`User with name: ${userName}, email: ${userEmail}, password: ${userPassword}`);
};
exports.getUser = getUser;
//# sourceMappingURL=userController.js.map