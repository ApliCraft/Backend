import express, { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";

const app: Express = express();
const PORT: Number = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(bodyParser.json());

app.listen(PORT, () => {
  console.log(`Server running on: ${PORT}`);
});
