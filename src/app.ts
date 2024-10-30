import express, { Application, Response } from "express";
import cors from "cors";
import connectToMongoDB from './config/db';
import { HttpStatusCode } from "./config/statusCodes";

// Import routes
import userRoutes from './routes/v1/userRoutes';
import { errorHandler } from './middleware/errors';

const app: Application = express();
// let isConnectedToMongoDB = false;

//database connection
connectToMongoDB();
// .then(
//   (isConnected) => {
//     isConnectedToMongoDB = isConnected;
//   }
// );

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use the imported routes
app.use("/api/v1/users", userRoutes);

// Error handling middleware
app.use(errorHandler);

app.get('/api', (_, res: Response): void => {
  res.status(HttpStatusCode.OK).json({
    info: 'API running...',
    api: ["/api/v1/users"]
  });
});

export default app;
