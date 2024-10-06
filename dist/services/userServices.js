"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUser = searchUser;
const userModel_1 = __importDefault(require("../models/userModel"));
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
//# sourceMappingURL=userServices.js.map