"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
// Specifies the mongoDB port
const MONGO_PORT = process.env.MONGO_URI || "mongodb://localhost:27017/ApliCraft";
// Tries to connect to DB with specified PORT
//  - If succeeds returns 1 and logs the DB host
//  - If fails then returns 0 and logs an error
const connectToMongoDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(MONGO_PORT);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return true;
    }
    catch (err) {
        console.error(`Error: ${err}`);
    }
    return false;
};
exports.default = connectToMongoDB;
//# sourceMappingURL=db.js.map