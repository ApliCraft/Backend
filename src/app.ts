import express, { Application, Request, Response, Router } from "express";
import cors from "cors";
import connectToMongoDB from './config/db';

// Import routes
import userRoutes from './routes/v1/userRoutes';
import { errorHandler } from './middleware/errors';

const app: Application = express();
// let isConnectedToMongoDB = false;

//database connection
connectToMongoDB()
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

app.get('/', (req: Request, res: Response): void => {
  res.send('API running...');
});

export default app;
