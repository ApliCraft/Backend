import app from "./app";
import "dotenv/config";

const PORT: Number = Number(process.env.PORT) || 4000;

app.listen(PORT, (): void => {
    console.log(`Server running on PORT: ${PORT}`);
});