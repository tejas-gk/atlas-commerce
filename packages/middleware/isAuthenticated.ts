import db from "@repo/db";
import { NextFunction, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

type DecodedToken = {
  id: string;
  role: "user" | "seller" | "admin";
};

type ExpiredToken = {
  expired: true;
};

const getPrimaryShop = (shops: any[] = [], activeShopId?: string) => {
  if (activeShopId) {
    const activeShop = shops.find(
      (shop) => shop.id === activeShopId && !shop.isDeleted,
    );
    if (activeShop) {
      return activeShop;
    }
  }

  return shops.find((shop) => !shop.isDeleted) ?? shops[0] ?? null;
};

const getDecodedToken = (
  token?: string | null,
): DecodedToken | ExpiredToken | null => {
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

const isExpiredToken = (
  value: DecodedToken | ExpiredToken | null,
): value is ExpiredToken => Boolean(value && "expired" in value);

const isDecodedToken = (
  value: DecodedToken | ExpiredToken | null,
): value is DecodedToken => Boolean(value && "role" in value);

const clearAuthCookies = (res: Response) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.clearCookie("seller-access-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.clearCookie("seller-refresh-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
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
      (isDecodedToken(decodedFromHeader) && decodedFromHeader) ||
      (isDecodedToken(decodedFromAccessCookie) && decodedFromAccessCookie) ||
      (isDecodedToken(decodedFromSellerCookie) && decodedFromSellerCookie);

    const hasExpiredToken =
      isExpiredToken(decodedFromHeader) ||
      isExpiredToken(decodedFromAccessCookie) ||
      isExpiredToken(decodedFromSellerCookie);

    if (!decoded) {
      clearAuthCookies(res);
      if (hasExpiredToken) {
        return res
          .status(401)
          .json({ message: "Unauthorized! Token expired." });
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
        include: { shops: true, shopMembers: { include: { shop: true } } },
      });
      const activeShopId =
        req.cookies["seller-active-shop-id"] ||
        req.headers["x-shop-id"] ||
        req.query?.shopId ||
        req.body?.shopId;
      const memberShops = (account?.shopMembers ?? []).map(
        (membership: any) => ({
          ...membership.shop,
          memberRole: membership.role,
          membershipId: membership.id,
        }),
      );
      const accessibleShops = [
        ...(account?.shops ?? []),
        ...memberShops,
      ].filter(
        (shop, index, all) =>
          all.findIndex((candidate) => candidate.id === shop.id) === index,
      );
      const primaryShop = getPrimaryShop(accessibleShops, activeShopId);
      req.seller = account
        ? {
            ...account,
            shops: accessibleShops,
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
    clearAuthCookies(res);
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
