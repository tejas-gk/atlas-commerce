import { NextFunction, Response } from "express";

import { AuthenticatedRequest } from "../types/auth.types";
import {
    forgotUserPassword,
    getLoggedInUser,
    loginAdminAccount,
    loginUserAccount,
    logoutUser,
    refreshUserSession,
    registerUser,
    resetUserPasswordByEmail,
    updateLoggedInUserPassword,
    verifyRegisteredUser,
    verifyUserForgotPasswordOtp,
} from "../services/user-auth.service";

export const userRegistration = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        await registerUser(req.body);
        res.status(200).json({
            message: "OTP sent to email. Please verify your account.",
        });
    } catch (error) {
        next(error);
    }
};

export const verifyUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        await verifyRegisteredUser(req.body);
        res.status(201).json({
            success: true,
            message: "User registered successfully!",
        });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await loginUserAccount(req.body, res);
        res.status(200).json({
            message: "Login successful!",
            user,
        });
    } catch (error) {
        next(error);
    }
};

export const logOutUser = async (_req: AuthenticatedRequest, res: Response) => {
    logoutUser(res);
    res.status(201).json({
        success: true,
    });
};

export const refreshToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        await refreshUserSession(req, res);
        res.status(201).json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        res.status(201).json({
            success: true,
            user: getLoggedInUser(req),
        });
    } catch (error) {
        next(error);
    }
};

export const userForgotPassword = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        await forgotUserPassword(req, res);
    } catch (error) {
        next(error);
    }
};

export const verifyUserForgotPassword = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        await verifyUserForgotPasswordOtp(req, res);
    } catch (error) {
        next(error);
    }
};

export const resetUserPassword = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        await resetUserPasswordByEmail(req.body);
        res.status(200).json({ message: "Password reset successfully!" });
    } catch (error) {
        next(error);
    }
};

export const updateUserPassword = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        await updateLoggedInUserPassword(req, req.body);
        res.status(200).json({ message: "password updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const loginAdmin = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await loginAdminAccount(req.body, res);
        res.status(200).json({
            message: "Login successful!",
            user,
        });
    } catch (error) {
        next(error);
    }
};

export const getAdmin = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        res.status(201).json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        next(error);
    }
};

export const logOutAdmin = async (_req: AuthenticatedRequest, res: Response) => {
    logoutUser(res);
    res.status(201).json({
        success: true,
    });
};
