import "./bootstrap";
import express from "express";
import cors from "cors"; // 1. Add this import
import productRoutes from "./routes/product.routes";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "../../../packages/error-handler/error-middleware";

const app: express.Application = express();

// 2. Add CORS middleware here
app.use(cors({
  origin: "http://localhost:3000", // Allow your web app
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Product service is running" });
});

app.use("/api", productRoutes);

app.use(errorMiddleware);
const port = process.env.PORT || 6002;
app.listen(port, () => {
  console.log(`Product service is running at http://localhost:${port}/api`);
});

export default app;