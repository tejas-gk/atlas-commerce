import crypto from "crypto";

import { NotFoundError, ValidationError } from "@repo/error-handler";

import { sellerRepository } from "../repositories/seller.repository";
import { SellerRequest } from "../types/seller.types";

const WEBSITE_ALLOWED_STATUSES = new Set(["draft", "published", "archived"]);

export const getPrimaryShop = (seller: any, requestedShopId?: string) => {
  const memberShops = (seller?.shopMembers ?? []).map(
    (membership: any) => membership.shop
  );
  const shops = [...(seller?.shops ?? []), ...memberShops].filter(
    (shop, index, all) =>
      all.findIndex((candidate) => candidate.id === shop.id) === index
  );

  if (!shops.length) {
    return null;
  }

  if (requestedShopId) {
    return shops.find((shop: any) => shop.id === requestedShopId) ?? null;
  }

  return shops.find((shop: any) => !shop.isDeleted) ?? shops[0] ?? null;
};

export const getRequestedShopId = (req: SellerRequest) =>
  req.body?.shopId ||
  req.query?.shopId ||
  req.seller?.activeShopId ||
  undefined;

export const getAccessibleShopOrThrow = async (
  sellerId?: string,
  requestedShopId?: string,
  notFoundMessage = "Shop not found!"
) => {
  if (!sellerId) {
    throw new NotFoundError(notFoundMessage);
  }

  const shop = await sellerRepository.findAccessibleShop(sellerId, requestedShopId);

  if (!shop) {
    throw new NotFoundError(notFoundMessage);
  }

  return shop;
};

export const getSellerShopOrThrow = async (
  sellerId?: string,
  requestedShopId?: string
) => {
  if (!sellerId) {
    throw new NotFoundError("Seller or Shop not found");
  }

  const seller = await sellerRepository.findSellerWithShops(sellerId);
  const shop = getPrimaryShop(seller, requestedShopId);

  if (!seller || !shop) {
    throw new NotFoundError("Seller or Shop not found");
  }

  return shop;
};

export const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "shop-home";

export const normalizeDomain = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");

export const buildDomainInstructions = (domain: {
  verificationToken: string;
  verificationTarget: string;
  domain: string;
}) => ({
  type: "TXT",
  host: `_atlas-verify.${domain.domain}`,
  value: domain.verificationTarget,
  token: domain.verificationToken,
});

export const ensureWebsitePayload = (payload: any) => {
  if (!payload?.name?.trim()) {
    throw new ValidationError("Website name is required!");
  }

  if (!Array.isArray(payload?.pages) || payload.pages.length === 0) {
    throw new ValidationError("At least one page is required for a website.");
  }

  return {
    name: payload.name.trim(),
    slug: normalizeSlug(payload.slug || payload.name),
    description: payload.description?.trim() || null,
    templateKey: payload.templateKey?.trim() || "ecommerce-starter",
    pages: payload.pages,
    theme: payload.theme || {},
    settings: payload.settings || {},
    seo: payload.seo || {},
    previewImage: payload.previewImage?.trim() || null,
    status:
      typeof payload.status === "string" && WEBSITE_ALLOWED_STATUSES.has(payload.status)
        ? payload.status
        : "draft",
    isPublished: Boolean(payload.isPublished),
  };
};

export const getWebsiteAccessOrThrow = async (
  sellerId: string | undefined,
  websiteId: string | undefined,
  requestedShopId?: string,
  includeArchived = false
) => {
  if (!sellerId || !websiteId) {
    throw new NotFoundError("Website not found for this shop!");
  }

  const website = await sellerRepository.findWebsiteAccess(websiteId);

  if (!website || website.shop.sellerId !== sellerId) {
    throw new NotFoundError("Website not found for this shop!");
  }

  if (requestedShopId && website.shopId !== requestedShopId) {
    throw new NotFoundError("Website not found for this shop!");
  }

  if (!includeArchived && website.isArchived) {
    throw new NotFoundError("Website not found for this shop!");
  }

  return website;
};

export const createVerificationToken = () =>
  crypto.randomBytes(12).toString("hex");

export const sellerSharedService = {
  getPrimaryShop,
  getRequestedShopId,
  getAccessibleShopOrThrow,
  getSellerShopOrThrow,
  normalizeSlug,
  normalizeDomain,
  buildDomainInstructions,
  ensureWebsitePayload,
  getWebsiteAccessOrThrow,
  createVerificationToken,
};
