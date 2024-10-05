import mongoose, { Mongoose } from "mongoose";
import "dotenv/config";

// Specifies the mongoDB port
const MONGO_PORT = "mongodb://localhost:27017/ApliCraft";

// Tries to connect to DB with specified PORT
//  - If succeeds returns 1 and logs the DB host
//  - If fails then returns 0 and logs an error
const connectToMongoDB = async (): Promise<boolean> => {
    try {
        const conn: Mongoose = await mongoose.connect(MONGO_PORT);

        console.log(`MongoDB connected: ${conn.connection.host}`);
        return true;
    } catch (err) {
        console.error(`Error: ${err}`)
    }

    // Returns false if connection fails
    return false;
}

export default connectToMongoDB;