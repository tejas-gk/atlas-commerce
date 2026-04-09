import express from "express"
import * as path from "path"
import cors from "cors"
import proxy from "express-http-proxy"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"
import initializeSiteConfig from "./libs/initializeSiteConfig";

const app = express()

const isProduction = process.env.NODE_ENV === "production";


const allowedOrigins = isProduction
    ? [
        "https://penderghast.com",
        "https://sellers.penderghast.com",
        "https://admin.penderghast.com",
        "http://nginx",
        "http://localhost",
    ]
    : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:8080"];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Authorization", "Content-Type", "x-shop-id"],
        credentials: true,
    }),
)
app.options(/.*/, cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "x-shop-id"],
    credentials: true,
}))

app.use(morgan("dev"))
app.use(express.json({ limit: "100mb" }))
app.use(express.urlencoded({ limit: "100mb", extended: true }))
app.use(cookieParser())
app.set("trust proxy", 1)

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: "Too many requests, please try again later!" },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { ip: false },
    keyGenerator: (req: any) => req.ip
})

app.use(limiter)

app.get("/gateway-health", (req, res) => {
    res.status(200).json({ ok: true, service: "api-gateway" })
})

app.use("/auth", proxy("http://localhost:6001"))
app.use("/product", proxy("http://localhost:6002"))
app.use("/recommendation", proxy("http://localhost:6007"))
app.use("/seller", proxy("http://localhost:6003"))
app.use("/order", proxy("http://localhost:6004"))
app.use("/admin", proxy("http://localhost:6005"))
app.use("/chatting", proxy("http://localhost:6006"))
app.use("/assets", express.static(path.join(__dirname, "assets")))

const port = process.env.PORT || 8080;
const host = isProduction ? "0.0.0.0" : "localhost";
const server = app.listen(Number(port), host, () => {
    console.log(`🚀 API Gateway listening at http://${host}:${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 CORS Origins: ${JSON.stringify(allowedOrigins)}`);

    try {
        initializeSiteConfig();
        console.log("✅ Site config initialized successfully!");
    } catch (error) {
        console.error("❌ Failed to initialize site config:", error);
    }
});

server.on("error", console.error)
