import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

import { imagekit } from "@atlas/imagekit";

import { sellerRepository } from "../repositories/seller.repository";
import { sellerProfileService } from "./seller-profile.service";
import { sellerShopService } from "./seller-shop.service";
import { sellerFollowService } from "./seller-follow.service";
import { sellerNotificationService } from "./seller-notification.service";
import { sellerMemberService } from "./seller-member.service";

afterEach(() => {
  mock.restoreAll();
});

describe("seller core services", () => {
  it("markShopForDeletion schedules deletion 28 days out", async () => {
    mock.method(sellerRepository, "findSellerWithShops", async () => ({
      shops: [{ id: "shop-1", isDeleted: false }],
    }) as any);
    const deleteMock = mock.method(sellerRepository, "softDeleteShop", async () => ({}) as any);

    await sellerShopService.markShopForDeletion("seller-1");

    assert.equal(deleteMock.mock.callCount(), 1);
    assert.equal(deleteMock.mock.calls[0]!.arguments[0], "shop-1");
  });

  it("uploadSellerImage uploads to imagekit", async () => {
    mock.method(imagekit, "upload", async () => ({
      fileId: "file-1",
      url: "https://img.test/file.png",
    }) as any);

    const result = await sellerProfileService.uploadSellerImage({
      file: "base64",
      fileName: "cover.png",
      folder: "/seller",
    });

    assert.equal(result.file_id, "file-1");
    assert.equal(result.url, "https://img.test/file.png");
  });

  it("followSellerShop returns alreadyFollowing for duplicates", async () => {
    mock.method(sellerRepository, "findFollow", async () => ({ id: "follow-1" }) as any);

    const result = await sellerFollowService.followSellerShop("user-1", "shop-1");

    assert.equal(result.alreadyFollowing, true);
  });

  it("markSellerNotificationAsRead updates notification status", async () => {
    const updateMock = mock.method(sellerRepository, "updateNotificationStatus", async () => ({
      id: "notif-1",
      status: "Read",
    }) as any);

    const result = await sellerNotificationService.markSellerNotificationAsRead("notif-1");

    assert.equal((result as any).status, "Read");
    assert.equal(updateMock.mock.callCount(), 1);
  });

  it("addMemberToShop upserts a valid shop member", async () => {
    mock.method(sellerRepository, "findAccessibleShop", async () => ({ id: "shop-1" }) as any);
    mock.method(sellerRepository, "findUserByEmail", async () => ({
      id: "user-2",
      email: "staff@example.com",
    }) as any);
    const upsertMock = mock.method(sellerRepository, "upsertShopMember", async () => ({
      id: "member-1",
    }) as any);

    const result = await sellerMemberService.addMemberToShop("seller-1", {
      shopId: "shop-1",
      email: "staff@example.com",
      role: "manager",
    });

    assert.equal((result.member as any).id, "member-1");
    assert.equal(upsertMock.mock.callCount(), 1);
  });
});
