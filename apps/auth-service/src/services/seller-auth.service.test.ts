import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import bcrypt from "bcryptjs";

import { authHelper } from "../utils/auth.helper";
import { authRepository } from "../repositories/auth.repository";
import { sellerAuthService } from "./seller-auth.service";

const createResponse = () =>
    ({
        clearCookie: mock.fn(),
        cookie: mock.fn(),
    } as any);

afterEach(() => {
    mock.restoreAll();
});

describe("sellerAuthService", () => {
    it("registerSellerAccount validates and sends OTP", async () => {
        mock.method(authHelper, "validateRegistrationData", () => undefined);
        mock.method(authRepository, "findUserByEmail", async () => null);
        const otpMock = mock.method(authHelper, "sendOtp", async () => undefined);
        mock.method(authHelper, "checkOtpRestrictions", async () => undefined);
        mock.method(authHelper, "trackOtpRequests", async () => undefined);

        await sellerAuthService.registerSellerAccount({
            name: "Store Owner",
            email: "seller@example.com",
            password: "Secret123",
            phone_number: "123",
            country: "IN",
        });

        assert.equal(otpMock.mock.callCount(), 1);
    });

    it("verifySellerAccount creates a new seller when no account exists", async () => {
        mock.method(authHelper, "verifyOtp", async () => undefined);
        mock.method(authRepository, "findUserByEmail", async () => null);
        mock.method(bcrypt, "hash", async () => "seller-hash" as never);
        const createMock = mock.method(authRepository, "createUserWithSellerContext", async () => ({
            id: "seller-1",
            email: "seller@example.com",
            name: "Seller",
            shops: [],
        }) as any);

        const seller = await sellerAuthService.verifySellerAccount(
            {
                email: "seller@example.com",
                otp: "1234",
                password: "Secret123",
                name: "Seller",
                phone_number: "123",
                country: "IN",
            },
            createResponse()
        );

        assert.equal(createMock.mock.callCount(), 1);
        assert.equal((seller as any).id, "seller-1");
    });

    it("createSellerShop creates a shop and owner membership", async () => {
        mock.method(authRepository, "findSellerAccountById", async () => ({
            id: "seller-1",
            role: "seller",
        }) as any);
        mock.method(authRepository, "createShop", async () => ({
            id: "shop-1",
            name: "My Shop",
        }) as any);
        const memberMock = mock.method(authRepository, "createShopMember", async () => ({}) as any);

        const shop = await sellerAuthService.createSellerShop(
            { seller: { id: "seller-1" } } as any,
            { name: "My Shop" },
            createResponse()
        );

        assert.equal((shop as any).id, "shop-1");
        assert.equal(memberMock.mock.callCount(), 1);
    });

    it("loginSellerAccount rejects invalid passwords", async () => {
        mock.method(authRepository, "findSellerByEmail", async () => ({
            id: "seller-1",
            email: "seller@example.com",
            name: "Seller",
            password: "stored-password",
        }) as any);
        mock.method(bcrypt, "compare", async () => false as never);

        await assert.rejects(
            () =>
                sellerAuthService.loginSellerAccount(
                    { email: "seller@example.com", password: "wrong" },
                    createResponse()
                ),
            /Invalid email or password!/
        );
    });

    it("switchSellerActiveShop fails when the shop is missing", async () => {
        mock.method(authRepository, "findSellerShop", async () => null);

        await assert.rejects(
            () =>
                sellerAuthService.switchSellerActiveShop(
                    { seller: { id: "seller-1" } } as any,
                    { shopId: "shop-404" },
                    createResponse()
                ),
            /Shop not found for this seller!/
        );
    });
});
