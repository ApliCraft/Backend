"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.createUser = exports.getUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
//Importing user model and interface for mongoose validation
const userModel_1 = __importDefault(require("../models/userModel"));
// Importing HTTP status codes for response status codes
const statusCodes_1 = require("../config/statusCodes");
// Function used to get user data from the database with email | name and password
const getUser = async (req, res) => {
    // Casting body as IGetUserValidatorSchema interface and writing data to variables
    // userName or userEmail will be provided
    const body = req.body;
    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;
    try {
        // Searches user by name or email and returns the user if found
        const userData = await searchUser(userName, userEmail);
        if (!userData) {
            res.status(statusCodes_1.HttpStatusCode.NOT_FOUND).send('User not found');
            return;
        }
        // Checks if the password is correct
        const isMatch = await bcrypt_1.default.compare(userPassword, userData.password);
        if (!isMatch) {
            res.status(statusCodes_1.HttpStatusCode.UNAUTHORIZED).send('Incorrect password');
            return;
        }
        // Creates a new userResponseData with user data that will be sent to the client
        const userResponseData = {
            name: userData.name,
            email: userData.email,
            signInDate: userData.signInDate,
        };
        res.status(statusCodes_1.HttpStatusCode.OK).json(userResponseData);
    }
    catch (error) {
        // The errors caught during the searchUser execution (mongodb errors) or bcrypt comparison 
        console.log(error);
        res.status(statusCodes_1.HttpStatusCode.INTERNAL_SERVER).send('Internal server error');
    }
};
exports.getUser = getUser;
// Creates a new user with the specified data email, name and password if the user does not exist 
// (name and email must not be in the db)
const createUser = async (req, res) => {
    // Casting body as ICreateUserValidatorSchema interface and writing data to variables
    const body = req.body;
    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;
    // Searches for user with the same email or name, if found responds to client
    try {
        if (await searchUser(userName, userEmail)) {
            res.status(statusCodes_1.HttpStatusCode.CONFLICT).json({ message: 'User already exists' });
            return;
        }
    }
    catch (error) {
        // Mongodb internal errors
        console.log(error);
        res.status(statusCodes_1.HttpStatusCode.INTERNAL_SERVER).json({ message: 'MongoDB error' });
        return;
    }
    // The hashing for the password
    let hash;
    try {
        hash = await bcrypt_1.default.hash(userPassword, 10);
    }
    catch (error) {
        // Hashing password errors
        console.log(error);
        res.status(statusCodes_1.HttpStatusCode.INTERNAL_SERVER).json({ message: 'Hashing failed' });
        return;
    }
    // Creates new user with hashed password 
    const user = new userModel_1.default({
        name: userName,
        email: userEmail,
        password: hash,
        signInDate: new Date(),
        active: false,
        lastLoginDate: new Date(),
    });
    // Saving user to mongoDB database
    try {
        await user.save();
        res.status(statusCodes_1.HttpStatusCode.OK).send(`User with name: ${userName} and email: ${userEmail} created successfully.`);
    }
    catch (error) {
        // MongoDB internal errors
        console.log(error);
        res.status(statusCodes_1.HttpStatusCode.INTERNAL_SERVER).json({ message: 'MongoDB error' });
        return;
    }
};
exports.createUser = createUser;
// Removes user with the specified email | name and password if exists
const deleteUser = async (req, res) => {
    // Casting body as IGetUserValidatorSchema interface and writing data to variables
    const body = req.body;
    const userName = body.name;
    const userEmail = body.email;
    const userPassword = body.password;
    try {
        // Searching for user in the db with userName or userEmail
        const userData = await searchUser(userName, userEmail);
        if (!userData) {
            res.status(statusCodes_1.HttpStatusCode.NOT_FOUND).send('User not found');
            return;
        }
        // Checking if the password is correct
        const isMatch = await bcrypt_1.default.compare(userPassword, userData.password);
        if (!isMatch) {
            res.status(statusCodes_1.HttpStatusCode.UNAUTHORIZED).send('Incorrect password');
            return;
        }
        // Deleting user with specified _id
        await userModel_1.default.deleteOne({ _id: userData._id });
        res.status(statusCodes_1.HttpStatusCode.NO_CONTENT).json();
    }
    catch (error) {
        // MongoDB internal errors (deleteOne or findOne) or bcrypt comparison errors
        console.log(error);
        res.status(statusCodes_1.HttpStatusCode.INTERNAL_SERVER).send('Internal server error');
    }
};
exports.deleteUser = deleteUser;
// Searches database for user with email | name then return user data or null if user not found
// Errors must be handled outside the function (try/catch block)
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