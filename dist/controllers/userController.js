"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const getUser = (req, res) => {
    const body = req.body;
    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;
    res.status(200).send(`User with name: ${userName}, email: ${userEmail}, password: ${userPassword}`);
};
exports.getUser = getUser;
const createUser = async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;
    try {
        const userExists = await userModel_1.default.findOne({
            $or: [
                { email: userEmail },
                { name: userName }
            ]
        });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'User already exists' });
        return;
    }
    const user = new userModel_1.default({
        name: userName,
        email: userEmail,
        password: userPassword,
    });
    try {
        await user.save();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'User already exists' });
        return;
    }
    res.status(200).send(`User with name: ${userName}, email: ${userEmail}, password: ${userPassword} created successfully.`);
};
exports.createUser = createUser;
//# sourceMappingURL=userController.js.map