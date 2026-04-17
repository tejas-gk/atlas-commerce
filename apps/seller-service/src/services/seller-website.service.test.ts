import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

import { sellerRepository } from "../repositories/seller.repository";
import { sellerWebsiteService } from "./seller-website.service";

afterEach(() => {
  mock.restoreAll();
});

describe("sellerWebsiteService", () => {
  it("listShopWebsites returns shop context and websites", async () => {
    mock.method(sellerRepository, "findAccessibleShop", async () => ({
      id: "shop-1",
      name: "My Shop",
      website: null,
      isDeleted: false,
    }) as any);
    mock.method(sellerRepository, "findShopWebsites", async () => [{ id: "website-1" }] as any);

    const result = await sellerWebsiteService.listShopWebsites("seller-1", "shop-1");

    assert.equal(result.shop.id, "shop-1");
    assert.equal(result.websites.length, 1);
  });

  it("createWebsiteForShop rejects duplicate slugs", async () => {
    mock.method(sellerRepository, "findAccessibleShop", async () => ({
      id: "shop-1",
      isDeleted: false,
    }) as any);
    mock.method(sellerRepository, "findWebsiteByShopAndSlug", async () => ({ id: "website-1" }) as any);

    await assert.rejects(
      () =>
        sellerWebsiteService.createWebsiteForShop("seller-1", "shop-1", {
          name: "Main Store",
          pages: [{ id: "page-1" }],
        }),
      /A website with this slug already exists for the shop./
    );
  });

  it("publishWebsiteForShop publishes an accessible website", async () => {
    mock.method(sellerRepository, "findWebsiteAccess", async () => ({
      id: "website-1",
      shop: { sellerId: "seller-1" },
      shopId: "shop-1",
      isArchived: false,
      pages: [{ id: "page-1" }],
      theme: {},
      settings: {},
      seo: {},
    }) as any);
    const updateMock = mock.method(sellerRepository, "updateShopWebsiteById", async () => ({
      id: "website-1",
      status: "published",
    }) as any);

    const result = await sellerWebsiteService.publishWebsiteForShop("seller-1", "website-1", "shop-1");

    assert.equal((result.website as any).status, "published");
    assert.equal(updateMock.mock.callCount(), 1);
  });

  it("createDomainForWebsite creates verification instructions", async () => {
    mock.method(sellerRepository, "findWebsiteAccess", async () => ({
      id: "website-1",
      shop: { sellerId: "seller-1" },
      shopId: "shop-1",
      isArchived: false,
      domains: [],
    }) as any);
    mock.method(sellerRepository, "findDomainByName", async () => null);
    mock.method(sellerRepository, "createWebsiteDomain", async (data: any) => data as any);

    const result = await sellerWebsiteService.createDomainForWebsite(
      "seller-1",
      "website-1",
      "shop-1",
      "https://example.com/path"
    );

    assert.equal(result.domain.domain, "example.com");
    assert.equal(result.domain.instructions.host, "_atlas-verify.example.com");
  });

  it("removeWebsiteDomain clears the shop website when deleting the primary domain", async () => {
    mock.method(sellerRepository, "findWebsiteAccess", async () => ({
      id: "website-1",
      shop: { sellerId: "seller-1" },
      shopId: "shop-1",
      isArchived: false,
      domains: [{ id: "domain-1", domain: "example.com", isPrimary: true }],
    }) as any);
    mock.method(sellerRepository, "deleteWebsiteDomain", async () => ({}) as any);
    const updateShopMock = mock.method(sellerRepository, "updateShopById", async () => ({}) as any);

    await sellerWebsiteService.removeWebsiteDomain("seller-1", "website-1", "domain-1", "shop-1");

    assert.equal(updateShopMock.mock.callCount(), 1);
    assert.deepEqual(updateShopMock.mock.calls[0]!.arguments, ["shop-1", { website: null }]);
  });
});
