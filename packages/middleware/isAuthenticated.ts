import db from "@repo/db";
import { NextFunction, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

const getPrimaryShop = (shops: any[] = [], activeShopId?: string) => {
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

const getDecodedToken = (token?: string | null) => {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: "user" | "seller" | "admin";
    };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return { expired: true } as const;
    }

    return null;
  }
};

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeaderToken = req.headers.authorization?.split(" ")[1];
    const accessToken = req.cookies["access_token"];
    const sellerAccessToken = req.cookies["seller-access-token"];
    const decodedFromHeader = getDecodedToken(authHeaderToken);
    const decodedFromAccessCookie = getDecodedToken(accessToken);
    const decodedFromSellerCookie = getDecodedToken(sellerAccessToken);

    const decoded =
      ("role" in (decodedFromHeader || {}) && decodedFromHeader) ||
      ("role" in (decodedFromAccessCookie || {}) && decodedFromAccessCookie) ||
      ("role" in (decodedFromSellerCookie || {}) && decodedFromSellerCookie);

    const hasExpiredToken =
      decodedFromHeader?.expired ||
      decodedFromAccessCookie?.expired ||
      decodedFromSellerCookie?.expired;

    if (!decoded) {
      if (hasExpiredToken) {
        return res.status(401).json({ message: "Unauthorized! Token expired." });
      }

      return res.status(401).json({ message: "Unauthorized! Token missing." });
    }

    let account;

    if (decoded.role === "user" || decoded.role === "admin") {
      account = await db.users.findUnique({
        where: { id: decoded.id },
      });
      req.user = account;
    } else if (decoded.role === "seller") {
      account = await db.users.findUnique({
        where: { id: decoded.id },
        include: { shops: true },
      });
      const activeShopId =
        req.cookies["seller-active-shop-id"] ||
        req.headers["x-shop-id"] ||
        req.query?.shopId ||
        req.body?.shopId;
      const primaryShop = getPrimaryShop(account?.shops, activeShopId);
      req.seller = account
        ? {
            ...account,
            activeShopId: primaryShop?.id ?? null,
            isDeleted: primaryShop?.isDeleted ?? account.isDeleted,
            deletedAt: primaryShop?.deletedAt ?? account.deletedAt,
            shop: primaryShop,
          }
        : null;
    }

    if (!account) {
      return res.status(401).json({ message: "Account not found!" });
    }

    req.role = decoded.role;

    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Unauthorized! Token expired." });
    }

    console.error("Authentication failed:", error);
    return res
      .status(401)
      .json({ message: "Unauthorized! Token expired or invalid." });
  }
};

export default isAuthenticated;
