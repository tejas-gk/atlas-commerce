import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({
    path: path.resolve(process.cwd(), ".env"),
});

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing in product-service");
    process.exit(1);
}

console.log("✅ ENV Loaded for product-service");