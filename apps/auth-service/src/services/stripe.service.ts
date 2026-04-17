import Stripe from "stripe";

import { ValidationError } from "@repo/error-handler";

import { authRepository } from "../repositories/auth.repository";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2022-11-15",
});

export const stripeClient = stripe;

export const createSellerStripeConnectLink = async (body: any) => {
    const { sellerId } = body;

    if (!sellerId) {
        throw new ValidationError("Seller ID is required!");
    }

    const seller = await authRepository.findUserById(sellerId);

    if (!seller || seller.role !== "seller") {
        throw new ValidationError("Seller is not available with this id!");
    }

    const account = await stripeClient.accounts.create({
        type: "express",
        email: seller.email,
        country: "GB",
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });

    await authRepository.updateUserById(sellerId, {
        stripeId: account.id,
    });

    const accountLink = await stripeClient.accountLinks.create({
        account: account.id,
        refresh_url: "http://localhost:3000/success",
        return_url: "http://localhost:3000/success",
        type: "account_onboarding",
    });

    return accountLink.url;
};

export const stripeService = {
    createSellerStripeConnectLink,
};
