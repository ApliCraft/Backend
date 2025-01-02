import express, { Application, Response } from "express";
import cors from "cors";
import connectToMongoDB from './config/db';
import { HttpStatusCode } from "./config/statusCodes";

// Import routes
import userRoutes from './routes/v1/userRoutes';
import recipeRoutes from './routes/v1/recipeRoutes';
import productRoutes from './routes/v1/productRoutes';
import { errorHandler } from './middleware/errors';
import useragent from "express-useragent";


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
app.use(useragent.express());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

// Use the imported routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/recipe", recipeRoutes)
app.use("/api/v1/product", productRoutes);

// Error handling middleware
app.use(errorHandler);

app.get('/api', (_, res: Response): void => {
  res.status(HttpStatusCode.OK).json({
    info: 'API running...',
    api: ["/api/v1/users", "/api/v1/recipe", "/api/v1/product"]
  });
});

export default app;
