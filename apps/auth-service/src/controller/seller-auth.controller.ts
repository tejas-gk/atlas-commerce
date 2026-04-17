import { NextFunction, Response } from "express";

import { AuthenticatedRequest } from "../types/auth.types";
import {
    completeSellerAccountProfile,
    createSellerShop,
    getLoggedInSeller,
    loginSellerAccount,
    logoutSeller,
    registerSellerAccount,
    switchSellerActiveShop,
    verifySellerAccount,
} from "../services/seller-auth.service";
import { createSellerStripeConnectLink } from "../services/stripe.service";

export const registerSeller = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        await registerSellerAccount(req.body);
        res.status(200).json({
            message: "OTP sent to email. Please verify your account.",
        });
    } catch (error) {
        next(error);
    }
};

export const verifySeller = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const seller = await verifySellerAccount(req.body, res);
        res.status(201).json({
            seller,
            message: "Seller profile completed successfully!",
        });
    } catch (error) {
        next(error);
    }
};

export const completeSellerProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const seller = await completeSellerAccountProfile(req, req.body, res);
        res.status(200).json({
            success: true,
            seller,
            message: "Seller profile completed successfully!",
        });
    } catch (error) {
        next(error);
    }
};

export const createShop = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const shop = await createSellerShop(req, req.body, res);
        res.status(201).json({
            success: true,
            shop,
        });
    } catch (error) {
        next(error);
    }
};

export const createStripeConnectLink = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const url = await createSellerStripeConnectLink(req.body);
        res.json({ url });
    } catch (error) {
        next(error);
    }
};

export const loginSeller = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const seller = await loginSellerAccount(req.body, res);
        res.status(200).json({
            message: "Login successful!",
            seller,
        });
    } catch (error) {
        next(error);
    }
};

export const logOutSeller = async (_req: AuthenticatedRequest, res: Response) => {
    logoutSeller(res);
    res.status(201).json({
        success: true,
    });
};

export const getSeller = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const seller = await getLoggedInSeller(req);
        res.status(201).json({
            success: true,
            seller,
        });
    } catch (error) {
        next(error);
    }
};

export const switchActiveShop = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const seller = await switchSellerActiveShop(req, req.body, res);
        res.status(200).json({
            success: true,
            seller,
            message: "Active shop updated successfully!",
        });
    } catch (error) {
        next(error);
    }
};
