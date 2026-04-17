import bcrypt from "bcryptjs";
import { Response } from "express";

import { AuthError, ValidationError } from "@repo/error-handler";

import { authRepository } from "../repositories/auth.repository";
import { AuthenticatedRequest } from "../types/auth.types";
import {
    applyUserSession,
    clearOppositeSession,
    clearUserSession,
    refreshAuthSession,
} from "./auth-session.service";
import { authHelper } from "../utils/auth.helper";

const noopNext = (() => undefined) as any;

export const registerUser = async (body: any) => {
    authHelper.validateRegistrationData(body, "user");
    const { name, email } = body;

    const existingUser = await authRepository.findUserByEmail(email);

    if (existingUser) {
        throw new ValidationError("User already exists with this email!");
    }

    await authHelper.checkOtpRestrictions(email, noopNext);
    await authHelper.trackOtpRequests(email, noopNext);
    await authHelper.sendOtp(name, email, "user-activation-mail");
};

export const verifyRegisteredUser = async (body: any) => {
    const { email, otp, password, name } = body;

    if (!email || !otp || !password || !name) {
        throw new ValidationError("All fields are required!");
    }

    const existingUser = await authRepository.findUserByEmail(email);

    if (existingUser) {
        throw new ValidationError("User already exists with this email!");
    }

    await authHelper.verifyOtp(email, otp, noopNext);

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCount = await authRepository.countUsers();

    await authRepository.createUser({
        name,
        email,
        password: hashedPassword,
        ...(userCount === 0 && { role: "admin" }),
    });
};

const loginAccount = async (
    email: string,
    password: string,
    role: "user" | "admin",
    res: Response
) => {
    if (!email || !password) {
        throw new ValidationError("Email and password are required!");
    }

    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        throw new AuthError("User doesn't exists!");
    }

    const isMatch = await bcrypt.compare(password, user.password!);

    if (!isMatch) {
        throw new AuthError("Invalid email or password");
    }

    if (role === "admin" && user.role !== "admin") {
        throw new AuthError("Invalid access!");
    }

    clearOppositeSession(res, role);
    applyUserSession(res, user, role);

    return {
        id: user.id,
        email: user.email,
        name: user.name,
    };
};

export const loginUserAccount = (body: any, res: Response) =>
    loginAccount(body.email, body.password, "user", res);

export const loginAdminAccount = (body: any, res: Response) =>
    loginAccount(body.email, body.password, "admin", res);

export const logoutUser = (res: Response) => {
    clearUserSession(res);
};

export const refreshUserSession = (req: AuthenticatedRequest, res: Response) =>
    refreshAuthSession(req, res);

export const getLoggedInUser = (req: AuthenticatedRequest) => req.user;

export const forgotUserPassword = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    await authHelper.handleForgotPassword(req, res, noopNext, "user");
};

export const verifyUserForgotPasswordOtp = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    await authHelper.verifyForgotPasswordOtp(req, res, noopNext);
};

export const resetUserPasswordByEmail = async (body: any) => {
    const { email, newPassword } = body;

    if (!email || !newPassword) {
        throw new ValidationError("Email and new password are required!");
    }

    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        throw new ValidationError("User not found!");
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword) {
        throw new ValidationError("New password cannot be the same as the old password!");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await authRepository.updateUserByEmail(email, {
        password: hashedPassword,
    });
};

export const updateLoggedInUserPassword = async (
    req: AuthenticatedRequest,
    body: any
) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        throw new ValidationError("all fields are required");
    }

    if (newPassword !== confirmPassword) {
        throw new ValidationError("new passwords do not match");
    }

    if (currentPassword === newPassword) {
        throw new ValidationError("New password cannot be the same as the current password");
    }

    const user = await authRepository.findUserById(userId);

    if (!user || !user.password) {
        throw new AuthError("user not found or password not set");
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
        throw new AuthError("current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await authRepository.updateUserById(userId, {
        password: hashedPassword,
    });
};

export const userAuthService = {
    registerUser,
    verifyRegisteredUser,
    loginUserAccount,
    loginAdminAccount,
    logoutUser,
    refreshUserSession,
    getLoggedInUser,
    forgotUserPassword,
    verifyUserForgotPasswordOtp,
    resetUserPasswordByEmail,
    updateLoggedInUserPassword,
};
