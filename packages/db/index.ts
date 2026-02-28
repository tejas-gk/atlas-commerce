import { PrismaClient } from "@prisma/client";

declare global {
    namespace globalThis {
        var prismadb: PrismaClient | undefined;
    }
}

console.log("Initializing Prisma Client", process.env.NODE_ENV);

const getPrismaClient = () => {
    if (process.env.NODE_ENV === "production") {
        if (!global.prismadb) {
            global.prismadb = new PrismaClient();
        }
        return global.prismadb;
    } else {
        return new PrismaClient();
    }
};

export default getPrismaClient();
