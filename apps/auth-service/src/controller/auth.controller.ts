import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper";

import { AuthError, NotFoundError, ValidationError } from "@repo/error-handler";
import { setCookie } from "../utils/cookies/setCookie";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "@repo/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2022-11-15",
});

const sellerInclude = {
    shops: true,
    shopMembers: {
        include: {
            shop: true,
        },
    },
};

const mapSellerAccount = (seller: any) =>
    seller
        ? (() => {
            const shop =
                seller.shops?.find(
                    (item: any) => item.id === seller.activeShopId && !item.isDeleted
                ) ??
                seller.shops?.find((item: any) => !item.isDeleted) ??
                seller.shops?.[0] ??
                null;

            return {
                ...seller,
                activeShopId: shop?.id ?? seller.activeShopId ?? null,
                isDeleted: shop?.isDeleted ?? seller.isDeleted,
                deletedAt: shop?.deletedAt ?? seller.deletedAt,
                shop,
            };
        })()
        : null;

const getAuthenticatedAccount = (req: any) => req.user || req.seller || null;
const setActiveShopCookie = (res: Response, shopId: string) => {
    setCookie(res, "seller-active-shop-id", shopId);
};


export const userRegistration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("User Registration Request Body:", req.body);
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;

    const existingUser = await db.users.findUnique({ where: { email } });

    console.log("Existing User:", existingUser);

    if (existingUser) {
        return next(new ValidationError("User already exists with this email!"));
    }

    await checkOtpRestrictions(email, next)
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");

    res.status(200).json({
        message: "OTP sent to email. Please verify your account.",
    });
}

export const verifyUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, otp, password, name } = req.body;
        if (!email || !otp || !password || !name) {
            return next(new ValidationError("All fields are required!"));
        }

        const existingUser = await db.users.findUnique({ where: { email } });

        if (existingUser) {
            return next(new ValidationError("User already exists with this email!"));
        }

        await verifyOtp(email, otp, next);

        const hashedPassword = await bcrypt.hash(password, 10);
        const userCount = await db.users.count();

        // sendLog({
        //     type: "success",
        //     message: `New user verified & registered: ${email}`,
        //     source: "auth-service",
        // });

        await db.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
                ...(userCount === 0 && { role: "admin" }), // assign role admin if it's the first user
            },
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully!",
        });
    } catch (error) {
        return next(error);
    }
};


export const loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ValidationError("Email and password are required!"));
        }

        const user = await db.users.findUnique({ where: { email } });

        if (!user) return next(new AuthError("User doesn't exists!"));

        //@ts-ignore
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // sendLog({
            //     type: "error",
            //     message: `Login failed: Invalid password for ${email}`,
            //     source: "auth-service",
            // });
            return next(new AuthError("Invalid email or password"));
        }

        // sendLog({
        //     type: "success",
        //     message: `User login successful: ${email}`,
        //     source: "auth-service",
        // });

        res.clearCookie("seller-access-token");
        res.clearCookie("seller-refresh-token");

        // Generate access and refresh token
        const accessToken = jwt.sign(
            { id: user.id, role: "user" },
            process.env.ACCESS_TOKEN_SECRET as string,
            {
                expiresIn: "15m",
            }
        );

        const refreshToken = jwt.sign(
            { id: user.id, role: "user" },
            process.env.REFRESH_TOKEN_SECRET as string,
            {
                expiresIn: "7d",
            }
        );

        // store the refresh and access token in an httpOnly secure cookie
        setCookie(res, "refresh_token", refreshToken);
        setCookie(res, "access_token", accessToken);

        res.status(200).json({
            message: "Login successful!",
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (error) {
        return next(error);
    }
};



export const logOutUser = async (req: any, res: Response) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.status(201).json({
        success: true,
    });
};


export const refreshToken = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const refreshToken =
            req.cookies["seller-refresh-token"] ||
            req.cookies["refresh_token"] ||
            req.headers.authorization?.split(" ")[1];

        if (!refreshToken) {
            return next(new ValidationError("Unauthorized! No refresh token."));
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as { id: string; role: string };

        if (!decoded || !decoded.id || !decoded.role) {
            return next(new JsonWebTokenError("Forbidden! Invalid refresh token."));
        }

        let account;
        if (decoded.role === "user" || decoded.role === "admin") {
            account = await db.users.findUnique({ where: { id: decoded.id } });
        } else if (decoded.role === "seller") {
            account = await db.users.findFirst({
                where: { id: decoded.id, role: "seller" },
                include: sellerInclude,
            });
        }

        if (!account) {
            return next(new AuthError("Forbidden! User/Seller not found"));
        }

        const newAccessToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );

        if (decoded.role === "user" || decoded.role === "admin") {
            setCookie(res, "access_token", newAccessToken);
        } else if (decoded.role === "seller") {
            setCookie(res, "seller-access-token", newAccessToken);
        }

        req.role = decoded.role;

        return res.status(201).json({ success: true });
    } catch (error) {
        next(error);
    }
};

// get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        // await sendLog({
        //     type: "success",
        //     message: `User data retrieved ${user?.email}`,
        //     source: "auth-service",
        // });

        res.status(201).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};

export const userForgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    await handleForgotPassword(req, res, next, "user");
};

// Verify forgot password OTP
export const verifyUserForgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    await verifyForgotPasswordOtp(req, res, next);
};

// Reset user password
export const resetUserPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword)
            return next(new ValidationError("Email and new password are required!"));

        const user = await db.users.findUnique({ where: { email } });
        if (!user) return next(new ValidationError("User not found!"));

        // compare new password with the exisiting one
        const isSamePassword = await bcrypt.compare(newPassword, user.password!);

        if (isSamePassword) {
            return next(
                new ValidationError(
                    "New password cannot be the same as the old password!"
                )
            );
        }

        // hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.users.update({
            where: { email },
            data: { password: hashedPassword },
        });

        res.status(200).json({ message: "Password reset successfully!" });
    } catch (error) {
        next(error);
    }
};

export const updateUserPassword = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return next(new ValidationError("all fields are required"));
        }

        if (newPassword !== confirmPassword) {
            return next(new ValidationError("new passwords do not match"));
        }

        if (currentPassword === newPassword) {
            return next(
                new ValidationError(
                    "New password cannot be the same as the current password"
                )
            );
        }

        const user = await db.users.findUnique({
            where: { id: userId },
        });

        if (!user || !user.password) {
            return next(new AuthError("user not found or password not set"));
        }

        const isPasswordCorrect = await bcrypt.compare(
            currentPassword,
            user.password
        );
        if (!isPasswordCorrect) {
            return next(new AuthError("current password is incorrect"));
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await db.users.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.status(200).json({ message: "password updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const createStripeConnectLink = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { sellerId } = req.body;

        if (!sellerId) return next(new ValidationError("Seller ID is required!"));

        const seller = await db.users.findFirst({
            where: {
                id: sellerId,
                role: "seller",
            },
        });

        if (!seller) {
            return next(new ValidationError("Seller is not available with this id!"));
        }

        const account = await stripe.accounts.create({
            type: "express",
            email: seller?.email,
            country: "GB",
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });
        console.log("Stripe Account Created:", account);
        await db.users.update({
            where: {
                id: sellerId,
            },
            data: {
                stripeId: account.id,
            },
        });

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${process.env.SELLER_UI_URL || "http://localhost:3001"}/stripe/refresh`,
            return_url: `${process.env.SELLER_UI_URL || "http://localhost:3001"}/stripe/success`,
            type: "account_onboarding",
        });

        res.json({ url: accountLink.url });
    } catch (error) {
        return next(error);
    }
};

export const loginAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ValidationError("Email and password are required!"));
        }

        const user = await db.users.findUnique({ where: { email } });

        if (!user) return next(new AuthError("User doesn't exists!"));

        // verify password
        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return next(new AuthError("Invalid email or password"));
        }

        const isAdmin = user.role === "admin";

        if (!isAdmin) {
            // sendLog({
            //     type: "error",
            //     message: `Admin login failed for ${email} — not an admin`,
            //     source: "auth-service",
            // });
            return next(new AuthError("Invalid access!"));
        }

        // sendLog({
        //     type: "success",
        //     message: `Admin login successful: ${email}`,
        //     source: "auth-service",
        // });

        res.clearCookie("seller-access-token");
        res.clearCookie("seller-refresh-token");

        // Generate access and refresh token
        const accessToken = jwt.sign(
            { id: user.id, role: "admin" },
            process.env.ACCESS_TOKEN_SECRET as string,
            {
                expiresIn: "15m",
            }
        );

        const refreshToken = jwt.sign(
            { id: user.id, role: "admin" },
            process.env.REFRESH_TOKEN_SECRET as string,
            {
                expiresIn: "7d",
            }
        );

        // store the refresh and access token in an httpOnly secure cookie
        setCookie(res, "refresh_token", refreshToken);
        setCookie(res, "access_token", accessToken);

        res.status(200).json({
            message: "Login successful!",
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (error) {
        return next(error);
    }
};

export const getAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        // await sendLog({
        //     type: "success",
        //     message: `Admin data retrieved ${user?.email}`,
        //     source: "auth-service",
        // });

        res.status(201).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};

export const registerSeller = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        validateRegistrationData(req.body, "seller");
        const { name, email } = req.body;

        const exisitingSeller = await db.users.findUnique({
            where: { email },
        });

        if (exisitingSeller?.role === "seller") {
            throw new ValidationError("Seller already exists with this email!");
        }

        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);
        await sendOtp(name, email, "seller-activation");

        res
            .status(200)
            .json({ message: "OTP sent to email. Please verify your account." });
    } catch (error) {
        next(error);
    }
};

// verify seller with OTP
export const verifySeller = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, otp, password, name, phone_number, country } = req.body;

        if (!email || !otp || !password || !name || !phone_number || !country) {
            return next(new ValidationError("All fields are required!"));
        }

        await verifyOtp(email, otp, next);
        const existingUser = await db.users.findUnique({
            where: { email },
            include: sellerInclude,
        });

        let seller;

        if (existingUser) {
            seller = await db.users.update({
                where: { id: existingUser.id },
                data: {
                    name: existingUser.name || name,
                    country,
                    phone_number,
                    role: "seller",
                },
                include: sellerInclude,
            });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            seller = await db.users.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    country,
                    phone_number,
                    role: "seller",
                },
                include: sellerInclude,
            });
        }

        const accessToken = jwt.sign(
            { id: seller.id, role: "seller" },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
            { id: seller.id, role: "seller" },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        );

        setCookie(res, "seller-refresh-token", refreshToken);
        setCookie(res, "seller-access-token", accessToken);

        res
            .status(201)
            .json({ seller: mapSellerAccount(seller), message: "Seller profile completed successfully!" });
    } catch (error) {
        next(error);
    }
};

export const completeSellerProfile = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const account = getAuthenticatedAccount(req);
        const { phone_number, country, name } = req.body;

        if (!account?.id) {
            return next(new AuthError("Please log in first!"));
        }

        if (!phone_number || !country) {
            return next(new ValidationError("Phone number and country are required!"));
        }

        const seller = await db.users.update({
            where: { id: account.id },
            data: {
                role: "seller",
                phone_number,
                country,
                ...(name ? { name } : {}),
            },
            include: sellerInclude,
        });

        const accessToken = jwt.sign(
            { id: seller.id, role: "seller" },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
            { id: seller.id, role: "seller" },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        );

        setCookie(res, "seller-refresh-token", refreshToken);
        setCookie(res, "seller-access-token", accessToken);

        res.status(200).json({
            success: true,
            seller: mapSellerAccount(seller),
            message: "Seller profile completed successfully!",
        });
    } catch (error) {
        next(error);
    }
};

// create a new shop
export const createShop = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const authenticatedUser = getAuthenticatedAccount(req);
        const { name, bio, address, opening_hours, website, category, sellerId } =
            req.body;
        const ownerId = authenticatedUser?.id || sellerId;

        if (!name || !ownerId) {
            return next(new ValidationError("Shop name is required!"));
        }

        const account = await db.users.findUnique({
            where: { id: ownerId },
            select: { id: true, role: true },
        });

        if (!account) {
            return next(new ValidationError("User account not found!"));
        }

        if (account.role !== "seller") {
            await db.users.update({
                where: { id: ownerId },
                data: { role: "seller" },
            });
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

        const shop = await db.shops.create({ data: shopData });

        await db.shopMembers.create({
            data: {
                shopId: shop.id,
                userId: ownerId,
                role: "owner",
            },
        });

        setActiveShopCookie(res, shop.id);

        res.status(201).json({
            success: true,
            shop,
        });
    } catch (error) {
        next(error);
    }
};


export const loginSeller = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return next(new ValidationError("Email and password are required!"));

        const seller = await db.users.findFirst({
            where: { email, role: "seller" },
            include: sellerInclude,
        });
        if (!seller) return next(new ValidationError("Invalid email or password!"));

        // Verify password
        const isMatch = await bcrypt.compare(password, seller.password!);
        if (!isMatch)
            return next(new ValidationError("Invalid email or password!"));

        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        // Generate access and refresh tokens
        const accessToken = jwt.sign(
            { id: seller.id, role: "seller" },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
            { id: seller.id, role: "seller" },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        );

        // store refresh token and access token
        setCookie(res, "seller-refresh-token", refreshToken);
        setCookie(res, "seller-access-token", accessToken);

        res.status(200).json({
            message: "Login successful!",
            seller: { id: seller.id, email: seller.email, name: seller.name },
        });
    } catch (error) {
        next(error);
    }
};

// log out seller
export const logOutSeller = async (req: any, res: Response) => {
    res.clearCookie("seller-access-token");
    res.clearCookie("seller-refresh-token");

    res.status(201).json({
        success: true,
    });
};

// get logged in seller
export const getSeller = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const account = getAuthenticatedAccount(req);

        if (!account?.id) {
            return next(new AuthError("Account not found!"));
        }

        const seller = await db.users.findUnique({
            where: { id: account.id },
            include: sellerInclude,
        });

        res.status(201).json({
            success: true,
            seller: mapSellerAccount({
                ...seller,
                activeShopId:
                    req.cookies["seller-active-shop-id"] ||
                    req.query?.shopId ||
                    req.headers["x-shop-id"] ||
                    null,
            }),
        });
    } catch (error) {
        next(error);
    }
};

export const switchActiveShop = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const account = getAuthenticatedAccount(req);
        const { shopId } = req.body;

        if (!account?.id) {
            return next(new AuthError("Account not found!"));
        }

        if (!shopId) {
            return next(new ValidationError("Shop id is required!"));
        }

        const shop = await db.shops.findFirst({
            where: {
                id: shopId,
                sellerId: account.id,
                isDeleted: false,
            },
        });

        if (!shop) {
            return next(new NotFoundError("Shop not found for this seller!"));
        }

        setActiveShopCookie(res, shop.id);

        const seller = await db.users.findUnique({
            where: { id: account.id },
            include: sellerInclude,
        });

        res.status(200).json({
            success: true,
            seller: mapSellerAccount({
                ...seller,
                activeShopId: shop.id,
            }),
            message: "Active shop updated successfully!",
        });
    } catch (error) {
        next(error);
    }
};

// log out admin
export const logOutAdmin = async (req: any, res: Response) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.status(201).json({
        success: true,
    });
};

// add new address
export const addUserAddress = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;
        const { label, name, street, city, zip, country, isDefault } = req.body;

        if (!label || !name || !street || !city || !zip || !country) {
            return next(new ValidationError("All fields are required"));
        }

        if (isDefault) {
            await db.address.updateMany({
                where: {
                    userId,
                    isDefault: true,
                },
                data: {
                    isDefault: false,
                },
            });
        }

        const newAddress = await db.address.create({
            data: {
                userId,
                label,
                name,
                street,
                city,
                zip,
                country,
                isDefault,
            },
        });

        res.status(201).json({
            success: true,
            address: newAddress,
        });
    } catch (error) {
        return next(error);
    }
};

// delete user address
export const deleteUserAddress = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;
        const { addressId } = req.params;

        if (!addressId) {
            return next(new ValidationError("Address ID is required"));
        }

        const existingAddress = await db.address.findFirst({
            where: {
                id: addressId,
                userId,
            },
        });

        if (!existingAddress) {
            return next(new NotFoundError("Address not found or unauthorized"));
        }

        await db.address.delete({
            where: {
                id: addressId,
            },
        });

        res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });
    } catch (error) {
        return next(error);
    }
};

// get user addresses
export const getUserAddresses = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;

        const addresses = await db.address.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            success: true,
            addresses,
        });
    } catch (error) {
        next(error);
    }
};


export const getLayoutData = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const layout = await db.site_config.findFirst();

        res.status(200).json({
            success: true,
            layout,
        });
    } catch (error) {
        next(error);
    }
};
