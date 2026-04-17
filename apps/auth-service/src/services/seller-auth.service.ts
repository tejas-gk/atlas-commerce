import bcrypt from "bcryptjs";
import { Response } from "express";

import { AuthError, NotFoundError, ValidationError } from "@repo/error-handler";

import { authRepository } from "../repositories/auth.repository";
import { AuthenticatedRequest } from "../types/auth.types";
import {
    applySellerSession,
    clearOppositeSession,
    clearSellerSession,
    getAuthenticatedAccount,
    mapSellerAccount,
    setActiveShopCookie,
} from "./auth-session.service";
import { authHelper } from "../utils/auth.helper";

const noopNext = (() => undefined) as any;

export const registerSellerAccount = async (body: any) => {
    authHelper.validateRegistrationData(body, "seller");
    const { name, email } = body;

    const existingSeller = await authRepository.findUserByEmail(email);

    if (existingSeller?.role === "seller") {
        throw new ValidationError("Seller already exists with this email!");
    }

    await authHelper.checkOtpRestrictions(email, noopNext);
    await authHelper.trackOtpRequests(email, noopNext);
    await authHelper.sendOtp(name, email, "seller-activation");
};

export const verifySellerAccount = async (body: any, res: Response) => {
    const { email, otp, password, name, phone_number, country } = body;

    if (!email || !otp || !password || !name || !phone_number || !country) {
        throw new ValidationError("All fields are required!");
    }

    await authHelper.verifyOtp(email, otp, noopNext);

    const existingUser = await authRepository.findUserByEmail(email);

    let seller;

    if (existingUser) {
        seller = await authRepository.updateUserByIdWithSellerContext(existingUser.id, {
            name: existingUser.name || name,
            country,
            phone_number,
            role: "seller",
        });
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        seller = await authRepository.createUserWithSellerContext({
            name,
            email,
            password: hashedPassword,
            country,
            phone_number,
            role: "seller",
        });
    }

    applySellerSession(res, seller);

    return mapSellerAccount(seller);
};

export const completeSellerAccountProfile = async (
    req: AuthenticatedRequest,
    body: any,
    res: Response
) => {
    const account = getAuthenticatedAccount(req);
    const { phone_number, country, name } = body;

    if (!account?.id) {
        throw new AuthError("Please log in first!");
    }

    if (!phone_number || !country) {
        throw new ValidationError("Phone number and country are required!");
    }

    const seller = await authRepository.updateUserByIdWithSellerContext(account.id, {
        role: "seller",
        phone_number,
        country,
        ...(name ? { name } : {}),
    });

    applySellerSession(res, seller);

    return mapSellerAccount(seller);
};

export const createSellerShop = async (
    req: AuthenticatedRequest,
    body: any,
    res: Response
) => {
    const authenticatedUser = getAuthenticatedAccount(req);
    const { name, bio, address, opening_hours, website, category, sellerId } = body;
    const ownerId = authenticatedUser?.id || sellerId;

    if (!name || !ownerId) {
        throw new ValidationError("Shop name is required!");
    }

    const account = await authRepository.findSellerAccountById(ownerId);

    if (!account) {
        throw new ValidationError("User account not found!");
    }

    if (account.role !== "seller") {
        await authRepository.updateUserById(ownerId, { role: "seller" });
    }

    const shopData: any = {
        name,
        bio: bio || "",
        address: address || "Not provided",
        opening_hours: opening_hours || "",
        category: category || "General",
        socialLinks: [],
        sellerId: ownerId,
    };

    if (website && website.trim() !== "") {
        shopData.website = website;
    }

    const shop = await authRepository.createShop(shopData);

    await authRepository.createShopMember({
        shopId: shop.id,
        userId: ownerId,
        role: "owner",
    });

    setActiveShopCookie(res, shop.id);

    return shop;
};

export const loginSellerAccount = async (body: any, res: Response) => {
    const { email, password } = body;

    if (!email || !password) {
        throw new ValidationError("Email and password are required!");
    }

    const seller = await authRepository.findSellerByEmail(email);

    if (!seller) {
        throw new ValidationError("Invalid email or password!");
    }

    const isMatch = await bcrypt.compare(password, seller.password!);

    if (!isMatch) {
        throw new ValidationError("Invalid email or password!");
    }

    clearOppositeSession(res, "seller");
    applySellerSession(res, seller);

    return {
        id: seller.id,
        email: seller.email,
        name: seller.name,
    };
};

export const logoutSeller = (res: Response) => {
    clearSellerSession(res);
};

export const getLoggedInSeller = async (req: AuthenticatedRequest) => {
    const account = getAuthenticatedAccount(req);

    if (!account?.id) {
        throw new AuthError("Account not found!");
    }

    const seller = await authRepository.findSellerById(account.id);

    return mapSellerAccount(
        seller,
        req.cookies["seller-active-shop-id"] ||
            req.query?.shopId?.toString() ||
            req.headers["x-shop-id"] ||
            null
    );
};

export const switchSellerActiveShop = async (
    req: AuthenticatedRequest,
    body: any,
    res: Response
) => {
    const account = getAuthenticatedAccount(req);
    const { shopId } = body;

    if (!account?.id) {
        throw new AuthError("Account not found!");
    }

    if (!shopId) {
        throw new ValidationError("Shop id is required!");
    }

    const shop = await authRepository.findSellerShop(shopId, account.id);

    if (!shop) {
        throw new NotFoundError("Shop not found for this seller!");
    }

    setActiveShopCookie(res, shop.id);

    const seller = await authRepository.findSellerById(account.id);

    return mapSellerAccount(seller, shop.id);
};

export const sellerAuthService = {
    registerSellerAccount,
    verifySellerAccount,
    completeSellerAccountProfile,
    createSellerShop,
    loginSellerAccount,
    logoutSeller,
    getLoggedInSeller,
    switchSellerActiveShop,
};
