import { PrismaClient } from "@prisma/client";
console.log("Initializing Prisma Client...");
declare global {
    var prisma: PrismaClient | undefined;
}

console.log("Prisma Client initialized.",process.env.DATABASE_URL);
console.log("Prisma Client URL:", process.env.REDIS_DATABASE_URI);
const prisma =
    global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}

export default prisma;