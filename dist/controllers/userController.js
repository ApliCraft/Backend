"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.createUser = exports.getUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../models/userModel"));
const statusCodes_1 = require("../config/statusCodes");
const getUser = async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;
    try {
        const userData = await searchUser(userName, userEmail);
        if (!userData) {
            res.status(statusCodes_1.HttpStatusCode.NOT_FOUND).send('User not found');
            return;
        }
        // checks if the password is correct
        const isMatch = await bcrypt_1.default.compare(userPassword, userData.password);
        if (!isMatch) {
            res
                .status(statusCodes_1.HttpStatusCode.UNAUTHORIZED)
                .send('Incorrect password');
            return;
        }
        const userResponseData = {
            name: userData.name,
            email: userData.email,
            signInDate: userData.signInDate,
        };
        res
            .status(statusCodes_1.HttpStatusCode.OK)
            .json(userResponseData);
    }
    catch (error) {
        res
            .status(statusCodes_1.HttpStatusCode.INTERNAL_SERVER)
            .send('Internal server error');
    }
};
exports.getUser = getUser;
const createUser = async (req, res) => {
    // save the request body to body variable with correct types 
    const body = req.body;
    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;
    // searches the database for the user
    try {
        // if user was found then responds with conflict status and returns
        if (await searchUser(userName, userEmail)) {
            res
                .status(statusCodes_1.HttpStatusCode.CONFLICT)
                .json({ message: 'User already exists' });
            return;
        }
    }
    catch (error) {
        console.log(error);
        res
            .status(statusCodes_1.HttpStatusCode.INTERNAL_SERVER)
            .json({ message: 'MongoDB error' });
        return;
    }
    // the hashing for the password
    let hash;
    try {
        // tries to hash the password using bcrypt
        hash = await bcrypt_1.default.hash(userPassword, 10);
    }
    catch (error) {
        console.log(error);
        res
            .status(statusCodes_1.HttpStatusCode.INTERNAL_SERVER)
            .json({ message: 'Hashing failed' });
        return;
    }
    // creates new user with hashed password and saves it to the database
    const user = new userModel_1.default({
        name: userName,
        email: userEmail,
        password: hash,
        signInDate: new Date(),
    });
    try {
        await user.save();
    }
    catch (error) {
        console.log(error);
        res
            .status(statusCodes_1.HttpStatusCode.INTERNAL_SERVER)
            .json({ message: 'User already exists' });
        return;
    }
    res
        .status(statusCodes_1.HttpStatusCode.OK)
        .send(`User with name: ${userName}, email: ${userEmail}, password: ${userPassword} created successfully.`);
};
exports.createUser = createUser;
const deleteUser = async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;
};
exports.deleteUser = deleteUser;
// Searches database for user with email or name then return user data or null if user not found
async function searchUser(userName, userEmail) {
    const userData = await userModel_1.default.findOne({
        $or: [
            { email: userEmail },
            { name: userName }
        ]
    });
    if (userData) {
        return userData;
    }
    return null;
}
//# sourceMappingURL=userController.js.map