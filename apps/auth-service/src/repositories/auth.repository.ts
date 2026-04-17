import db from "@repo/db";

export const sellerInclude = {
    shops: true,
    shopMembers: {
        include: {
            shop: true,
        },
    },
};

export const authRepository = {
    countUsers: () => db.users.count(),

    createUser: (data: any) => db.users.create({ data }),

    createUserWithSellerContext: (data: any) =>
        db.users.create({
            data,
            include: sellerInclude,
        }),

    updateUserByEmail: (email: string, data: any) =>
        db.users.update({
            where: { email },
            data,
        }),

    updateUserById: (id: string, data: any) =>
        db.users.update({
            where: { id },
            data,
        }),

    updateUserByIdWithSellerContext: (id: string, data: any) =>
        db.users.update({
            where: { id },
            data,
            include: sellerInclude,
        }),

    findUserByEmail: (email: string) =>
        db.users.findUnique({
            where: { email },
        }),

    findUserById: (id: string) =>
        db.users.findUnique({
            where: { id },
        }),

    findSellerByEmail: (email: string) =>
        db.users.findFirst({
            where: { email, role: "seller" },
            include: sellerInclude,
        }),

    findSellerById: (id: string) =>
        db.users.findUnique({
            where: { id },
            include: sellerInclude,
        }),

    findSellerAccountById: (id: string) =>
        db.users.findUnique({
            where: { id },
            select: { id: true, role: true },
        }),

    findRefreshAccount: (id: string, role: string) => {
        if (role === "user" || role === "admin") {
            return db.users.findUnique({ where: { id } });
        }

        if (role === "seller") {
            return db.users.findFirst({
                where: { id, role: "seller" },
                include: sellerInclude,
            });
        }

        return null;
    },

    createShop: (data: any) => db.shops.create({ data }),

    createShopMember: (data: any) => db.shopMembers.create({ data }),

    findSellerShop: (shopId: string, sellerId: string) =>
        db.shops.findFirst({
            where: {
                id: shopId,
                sellerId,
                isDeleted: false,
            },
        }),

    clearDefaultAddresses: (userId: string) =>
        db.address.updateMany({
            where: {
                userId,
                isDefault: true,
            },
            data: {
                isDefault: false,
            },
        }),

    createAddress: (data: any) => db.address.create({ data }),

    findAddressByIdForUser: (addressId: string, userId: string) =>
        db.address.findFirst({
            where: {
                id: addressId,
                userId,
            },
        }),

    deleteAddress: (addressId: string) =>
        db.address.delete({
            where: {
                id: addressId,
            },
        }),

    findAddressesByUserId: (userId: string) =>
        db.address.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),

    findLayout: () => db.site_config.findFirst(),
};
