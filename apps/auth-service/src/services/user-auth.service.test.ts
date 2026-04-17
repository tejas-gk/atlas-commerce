import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import bcrypt from "bcryptjs";

import { authHelper } from "../utils/auth.helper";
import { authRepository } from "../repositories/auth.repository";
import { userAuthService } from "./user-auth.service";

const createResponse = () =>
    ({
        clearCookie: mock.fn(),
        cookie: mock.fn(),
    } as any);

afterEach(() => {
    mock.restoreAll();
});

describe("userAuthService", () => {
    it("registerUser validates uniqueness and sends OTP", async () => {
        mock.method(authHelper, "validateRegistrationData", () => undefined);
        mock.method(authRepository, "findUserByEmail", async () => null);
        const restrictionMock = mock.method(authHelper, "checkOtpRestrictions", async () => undefined);
        const trackMock = mock.method(authHelper, "trackOtpRequests", async () => undefined);
        const otpMock = mock.method(authHelper, "sendOtp", async () => undefined);

        await userAuthService.registerUser({
            name: "Ada",
            email: "ada@example.com",
            password: "Secret123",
        });

        assert.equal(restrictionMock.mock.callCount(), 1);
        assert.equal(trackMock.mock.callCount(), 1);
        assert.equal(otpMock.mock.callCount(), 1);
    });

    it("verifyRegisteredUser promotes the first user to admin", async () => {
        mock.method(authRepository, "findUserByEmail", async () => null);
        mock.method(authHelper, "verifyOtp", async () => undefined);
        mock.method(bcrypt, "hash", async () => "hashed-password" as never);
        mock.method(authRepository, "countUsers", async () => 0);
        const createUserMock = mock.method(authRepository, "createUser", async () => ({}) as any);

        await userAuthService.verifyRegisteredUser({
            email: "ada@example.com",
            otp: "1234",
            password: "Secret123",
            name: "Ada",
        });

        const createdPayload = createUserMock.mock.calls[0]!.arguments[0] as any;
        assert.equal(createdPayload.role, "admin");
        assert.equal(createdPayload.password, "hashed-password");
    });

    it("loginAdminAccount rejects non-admin users", async () => {
        mock.method(authRepository, "findUserByEmail", async () => ({
            id: "user-1",
            email: "ada@example.com",
            name: "Ada",
            password: "stored",
            role: "user",
        }) as any);
        mock.method(bcrypt, "compare", async () => true as never);

        await assert.rejects(
            () => userAuthService.loginAdminAccount({ email: "ada@example.com", password: "Secret123" }, createResponse()),
            /Invalid access!/
        );
    });

    it("resetUserPasswordByEmail updates a new hashed password", async () => {
        mock.method(authRepository, "findUserByEmail", async () => ({
            email: "ada@example.com",
            password: "old-password",
        }) as any);
        mock.method(bcrypt, "compare", async () => false as never);
        mock.method(bcrypt, "hash", async () => "new-hash" as never);
        const updateMock = mock.method(authRepository, "updateUserByEmail", async () => ({}) as any);

        await userAuthService.resetUserPasswordByEmail({
            email: "ada@example.com",
            newPassword: "NewSecret123",
        });

        assert.deepEqual(updateMock.mock.calls[0]!.arguments, [
            "ada@example.com",
            { password: "new-hash" },
        ]);
    });

    it("updateLoggedInUserPassword rejects mismatched confirmation", async () => {
        await assert.rejects(
            () =>
                userAuthService.updateLoggedInUserPassword(
                    { user: { id: "user-1" } } as any,
                    {
                        currentPassword: "a",
                        newPassword: "b",
                        confirmPassword: "c",
                    }
                ),
            /new passwords do not match/
        );
    });
});
