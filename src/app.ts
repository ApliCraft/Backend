import express, { Application, Request, Response } from "express";
import cors from "cors";

// Import routes
import userRoutes from './routes/v1/userRoutes';

const app: Application = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use the imported routes
app.use("/api/v1/users", userRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('API running...');
});

export default app;
