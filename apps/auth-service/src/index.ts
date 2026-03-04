import express from "express";
import cookieParser from "cookie-parser";
import router from "./routes/auth.router";
import swaggerUi from "swagger-ui-express";

import fs from "fs"
import path from "path"
import { errorMiddleware } from "@repo/error-handler/error-middleware";

const swaggerPath = path.join(process.cwd(), "./apps/auth-service/src/swagger-output.json")
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf-8"))

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send({ message: "Hello API" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
    res.json(swaggerDocument);
});

// Routes
app.use("/api", router);

app.use(errorMiddleware);

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
    console.log(`Auth service is running at http://localhost:${port}/api`);
    console.log(`Swagger Docs available at http://localhost:${port}/docs`);

    console.log("CWD:", process.cwd());
    console.log("Before dotenv:", process.env.DATABASE_URL);



    console.log("After dotenv:", process.env.DATABASE_URL);
});

server.on("error", (err) => {
    console.log("Server Error:", err);
});
