"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connectToMongoDB;
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
// Specifies the mongoDB port
let MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ApliCraft";
if (MONGO_URI.indexOf(":27015") != -1) {
    MONGO_URI = "mongodb://localhost:27017";
}
console.log(`MONGO_URI: ${MONGO_URI}`);
// Tries to connect to DB with specified PORT
//  - If succeeds returns 1 and logs the DB host
//  - If fails then returns 0 and logs an error
async function connectToMongoDB() {
    try {
        const connection = await mongoose_1.default.connect(MONGO_URI);
        console.log(`MongoDB connected: ${connection.connection.host}`);
        return true;
    }
    catch (err) {
        // Returns false if connection fails
        console.error(`Error: ${err}`);
        return false;
    }
}
//# sourceMappingURL=db.js.map