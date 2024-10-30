import mongoose, { Mongoose } from "mongoose";
import "dotenv/config";

// Specifies the mongoDB port
let MONGO_URI: string = process.env.MONGO_URI || "mongodb://localhost:27017/ApliCraft";

if (MONGO_URI.indexOf(":27015") != -1) {
    MONGO_URI = "mongodb://localhost:27017";
}

console.log(`MONGO_URI: ${MONGO_URI}`);

// Tries to connect to DB with specified PORT
//  - If succeeds returns 1 and logs the DB host
//  - If fails then returns 0 and logs an error
export default async function connectToMongoDB(): Promise<boolean> {
    try {
        const connection: Mongoose = await mongoose.connect(MONGO_URI);

        console.log(`MongoDB connected: ${connection.connection.host}`);
        return true;
    } catch (err) {
        // Returns false if connection fails
        console.error(`Error: ${err}`)
        return false;
    }
}
