import { NotFoundError, ValidationError } from "@repo/error-handler";

import { sellerRepository } from "../repositories/seller.repository";
import { normalizeDomain } from "./seller-shared.service";

const getPagination = (query: any) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const getSellerPublicInfo = async (shopId?: string) => {
  const shop = await sellerRepository.findPublicShopById(shopId ?? "");
  const followersCount = await sellerRepository.countFollowersByShopId(shop?.id);

  return {
    shop,
    followersCount,
  };
};

export const getSellerProductsPreview = async (query: any) => {
  const shopId = query.id;
  const { page, limit, skip } = getPagination(query);

  const [products, total] = await Promise.all([
    sellerRepository.findProductsByShopId(shopId, skip, limit),
    sellerRepository.countProductsByShopId(shopId),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getSellerEventsPreview = async (query: any) => {
  const shopId = query.id;
  const { page, limit, skip } = getPagination(query);

  const [products, total] = await Promise.all([
    sellerRepository.findEventsByShopId(shopId, skip, limit),
    sellerRepository.countEventsByShopId(shopId),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const resolvePublishedWebsite = async (domainQuery: string) => {
  const domainName = normalizeDomain(domainQuery);

  if (!domainName) {
    throw new ValidationError("Domain query is required.");
  }

  const domain = await sellerRepository.findPublishedDomain(domainName);

  if (
    !domain ||
    domain.status !== "connected" ||
    !domain.website.isPublished ||
    domain.website.isArchived
  ) {
    throw new NotFoundError("No published website found for this domain.");
  }

  return {
    website: {
      id: domain.website.id,
      name: domain.website.name,
      slug: domain.website.slug,
      description: domain.website.description,
      pages: domain.website.publishedSnapshot || domain.website.pages,
      theme: domain.website.theme,
      settings: domain.website.settings,
      seo: domain.website.seo,
      publishedAt: domain.website.publishedAt,
      domain: domain.domain,
    },
    shop: {
      id: domain.website.shop.id,
      name: domain.website.shop.name,
      sellerId: domain.website.shop.sellerId,
    },
  };
};

export const sellerPublicService = {
  getSellerPublicInfo,
  getSellerProductsPreview,
  getSellerEventsPreview,
  resolvePublishedWebsite,
};
