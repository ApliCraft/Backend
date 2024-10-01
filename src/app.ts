import express, { Express, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";

const app: Express = express();
const PORT: Number = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.get("/", (req: Request, res: Response) => {
//   res.status(200).send("Server running");
// });

app.listen(PORT, () => {
  console.log(`Server running on: ${PORT}`);
});
