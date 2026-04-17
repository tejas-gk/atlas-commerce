import { Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

import { AuthError, ValidationError } from "@repo/error-handler";

import { setCookie } from "../utils/cookies/setCookie";
import { AuthRole, AuthenticatedRequest } from "../types/auth.types";
import { authRepository } from "../repositories/auth.repository";

const getPrimaryShop = (shops: any[] = [], activeShopId?: string | null) => {
    if (activeShopId) {
        const activeShop = shops.find(
            (shop) => shop.id === activeShopId && !shop.isDeleted
        );

        if (activeShop) {
            return activeShop;
        }
    }

    return shops.find((shop) => !shop.isDeleted) ?? shops[0] ?? null;
};

export const mapSellerAccount = (seller: any, activeShopId?: string | null) => {
    if (!seller) {
        return null;
    }

    const shop = getPrimaryShop(
        seller.shops,
        activeShopId ?? seller.activeShopId ?? null
    );

    return {
        ...seller,
        activeShopId: shop?.id ?? seller.activeShopId ?? null,
        isDeleted: shop?.isDeleted ?? seller.isDeleted,
        deletedAt: shop?.deletedAt ?? seller.deletedAt,
        shop,
    };
};

export const getAuthenticatedAccount = (req: AuthenticatedRequest) =>
    req.user || req.seller || null;

export const setActiveShopCookie = (res: Response, shopId: string) => {
    setCookie(res, "seller-active-shop-id", shopId);
};

export const createAccessToken = (id: string, role: AuthRole) =>
    jwt.sign({ id, role }, process.env.ACCESS_TOKEN_SECRET as string, {
        expiresIn: "15m",
    });

export const createRefreshToken = (id: string, role: AuthRole) =>
    jwt.sign({ id, role }, process.env.REFRESH_TOKEN_SECRET as string, {
        expiresIn: "7d",
    });

export const applyUserSession = (
    res: Response,
    account: { id: string },
    role: Extract<AuthRole, "user" | "admin">
) => {
    const accessToken = createAccessToken(account.id, role);
    const refreshToken = createRefreshToken(account.id, role);

    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);
};

export const applySellerSession = (res: Response, seller: { id: string }) => {
    const accessToken = createAccessToken(seller.id, "seller");
    const refreshToken = createRefreshToken(seller.id, "seller");

    setCookie(res, "seller-refresh-token", refreshToken);
    setCookie(res, "seller-access-token", accessToken);
};

export const clearUserSession = (res: Response) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
};

export const clearSellerSession = (res: Response) => {
    res.clearCookie("seller-access-token");
    res.clearCookie("seller-refresh-token");
};

export const clearOppositeSession = (
    res: Response,
    role: Extract<AuthRole, "user" | "admin" | "seller">
) => {
    if (role === "seller") {
        clearUserSession(res);
        return;
    }

    clearSellerSession(res);
};

export const refreshAuthSession = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const refreshToken =
        req.cookies["seller-refresh-token"] ||
        req.cookies["refresh_token"] ||
        req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
        throw new ValidationError("Unauthorized! No refresh token.");
    }

    const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: AuthRole };

    if (!decoded?.id || !decoded?.role) {
        throw new JsonWebTokenError("Forbidden! Invalid refresh token.");
    }

    const account = await authRepository.findRefreshAccount(decoded.id, decoded.role);

    if (!account) {
        throw new AuthError("Forbidden! User/Seller not found");
    }

    const newAccessToken = createAccessToken(decoded.id, decoded.role);

    if (decoded.role === "seller") {
        setCookie(res, "seller-access-token", newAccessToken);
    } else {
        setCookie(res, "access_token", newAccessToken);
    }

    req.role = decoded.role;
};

export const authSessionService = {
    mapSellerAccount,
    getAuthenticatedAccount,
    setActiveShopCookie,
    createAccessToken,
    createRefreshToken,
    applyUserSession,
    applySellerSession,
    clearUserSession,
    clearSellerSession,
    clearOppositeSession,
    refreshAuthSession,
};
