import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import jwt from "jsonwebtoken";

import { authRepository } from "../repositories/auth.repository";
import { addressService } from "./address.service";
import { authSessionService } from "./auth-session.service";
import { layoutService } from "./layout.service";
import { stripeClient, stripeService } from "./stripe.service";

const createResponse = () =>
    ({
        cookieCalls: [] as any[],
        clearCookie: mock.fn(),
        cookie(name: string, value: string, options: any) {
            this.cookieCalls.push({ name, value, options });
        },
    } as any);

afterEach(() => {
    mock.restoreAll();
});

describe("auth misc services", () => {
    it("addAddressForUser clears defaults before creating a default address", async () => {
        const clearMock = mock.method(authRepository, "clearDefaultAddresses", async () => ({}) as any);
        const createMock = mock.method(authRepository, "createAddress", async () => ({ id: "addr-1" }) as any);

        const address = await addressService.addAddressForUser(
            { user: { id: "user-1" } } as any,
            {
                label: "Home",
                name: "Ada",
                street: "1 Main St",
                city: "Pune",
                zip: "411001",
                country: "IN",
                isDefault: true,
            }
        );

        assert.equal(clearMock.mock.callCount(), 1);
        assert.equal((address as any).id, "addr-1");
        assert.equal(createMock.mock.callCount(), 1);
    });

    it("getSiteLayout delegates to repository", async () => {
        mock.method(authRepository, "findLayout", async () => ({ theme: "default" }) as any);

        const layout = await layoutService.getSiteLayout();

        assert.deepEqual(layout, { theme: "default" });
    });

    it("refreshAuthSession sets a seller access cookie and role", async () => {
        const res = createResponse();
        mock.method(jwt, "verify", () => ({ id: "seller-1", role: "seller" }) as never);
        mock.method(jwt, "sign", () => "new-access-token" as never);
        mock.method(authRepository, "findRefreshAccount", async () => ({ id: "seller-1" }) as any);

        const req = {
            cookies: { "seller-refresh-token": "refresh-token" },
            headers: {},
        } as any;

        await authSessionService.refreshAuthSession(req, res);

        assert.equal(req.role, "seller");
        assert.equal(res.cookieCalls[0].name, "seller-access-token");
    });

    it("createSellerStripeConnectLink persists stripe id and returns onboarding url", async () => {
        mock.method(authRepository, "findUserById", async () => ({
            id: "seller-1",
            email: "seller@example.com",
            role: "seller",
        }) as any);
        const accountCreateMock = mock.method(stripeClient.accounts, "create", async () => ({ id: "acct_123" }) as any);
        const updateMock = mock.method(authRepository, "updateUserById", async () => ({}) as any);
        mock.method(stripeClient.accountLinks, "create", async () => ({ url: "https://stripe.test/onboard" }) as any);

        const url = await stripeService.createSellerStripeConnectLink({
            sellerId: "seller-1",
        });

        assert.equal(url, "https://stripe.test/onboard");
        assert.equal(accountCreateMock.mock.callCount(), 1);
        assert.equal(updateMock.mock.callCount(), 1);
    });
});
