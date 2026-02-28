import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
    res.json({ message: "API Gateway running 🚀" });
});

app.get("/health", (_, res) => {
    res.send("OK");
});

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});