import app from "./app";
import "dotenv/config";

const PORT: Number = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
    console.log(`Server running on: ${PORT}`);
});