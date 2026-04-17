import { NotFoundError, ValidationError } from "@repo/error-handler";

import { sellerRepository } from "../repositories/seller.repository";
import {
  buildDomainInstructions,
  createVerificationToken,
  ensureWebsitePayload,
  getAccessibleShopOrThrow,
  getWebsiteAccessOrThrow,
  normalizeDomain,
} from "./seller-shared.service";

export const listShopWebsites = async (
  sellerId: string | undefined,
  requestedShopId?: string
) => {
  const shop = await getAccessibleShopOrThrow(
    sellerId,
    requestedShopId,
    "Active shop not found for this seller!"
  );

  if (shop.isDeleted) {
    throw new NotFoundError("Active shop not found for this seller!");
  }

  const websites = await sellerRepository.findShopWebsites(shop.id);

  return {
    shop: {
      id: shop.id,
      name: shop.name,
      website: shop.website,
    },
    websites,
  };
};

export const createWebsiteForShop = async (
  sellerId: string | undefined,
  requestedShopId: string | undefined,
  body: any
) => {
  const shop = await getAccessibleShopOrThrow(
    sellerId,
    requestedShopId,
    "Active shop not found for this seller!"
  );

  if (shop.isDeleted) {
    throw new NotFoundError("Active shop not found for this seller!");
  }

  const payload = ensureWebsitePayload(body);
  const existingWebsite = await sellerRepository.findWebsiteByShopAndSlug(
    shop.id,
    payload.slug
  );

  if (existingWebsite) {
    throw new ValidationError("A website with this slug already exists for the shop.");
  }

  const shouldPublish = payload.status === "published" || payload.isPublished;

  const website = await sellerRepository.createShopWebsite({
    ...payload,
    shopId: shop.id,
    isPublished: shouldPublish,
    publishedAt: shouldPublish ? new Date() : null,
    publishedSnapshot: shouldPublish
      ? {
          pages: payload.pages,
          theme: payload.theme,
          settings: payload.settings,
          seo: payload.seo,
        }
      : null,
  });

  return { website };
};

export const getWebsiteForShop = async (
  sellerId: string | undefined,
  websiteId: string | undefined,
  requestedShopId?: string
) => {
  const website = await getWebsiteAccessOrThrow(sellerId, websiteId, requestedShopId);

  return { website };
};

export const updateWebsiteForShop = async (
  sellerId: string | undefined,
  websiteId: string | undefined,
  requestedShopId: string | undefined,
  body: any
) => {
  const existingWebsite = await getWebsiteAccessOrThrow(
    sellerId,
    websiteId,
    requestedShopId
  );

  const payload = ensureWebsitePayload(body);

  if (payload.slug !== existingWebsite.slug) {
    const conflicting = await sellerRepository.findConflictingWebsiteSlug(
      existingWebsite.shopId,
      payload.slug,
      existingWebsite.id
    );

    if (conflicting) {
      throw new ValidationError("A website with this slug already exists for the shop.");
    }
  }

  const shouldPublish = payload.status === "published" || payload.isPublished;
  const website = await sellerRepository.updateShopWebsiteById(existingWebsite.id, {
    ...payload,
    isPublished: shouldPublish,
    publishedAt: shouldPublish ? existingWebsite.publishedAt || new Date() : null,
    publishedSnapshot: shouldPublish
      ? {
          pages: payload.pages,
          theme: payload.theme,
          settings: payload.settings,
          seo: payload.seo,
        }
      : existingWebsite.publishedSnapshot,
  });

  return { website };
};

export const publishWebsiteForShop = async (
  sellerId: string | undefined,
  websiteId: string | undefined,
  requestedShopId?: string
) => {
  const website = await getWebsiteAccessOrThrow(sellerId, websiteId, requestedShopId);

  const publishedWebsite = await sellerRepository.updateShopWebsiteById(website.id, {
    status: "published",
    isPublished: true,
    publishedAt: new Date(),
    publishedSnapshot: {
      pages: website.pages,
      theme: website.theme,
      settings: website.settings,
      seo: website.seo,
    },
  });

  return { website: publishedWebsite };
};

export const archiveWebsiteForShop = async (
  sellerId: string | undefined,
  websiteId: string | undefined,
  requestedShopId?: string
) => {
  const website = await getWebsiteAccessOrThrow(
    sellerId,
    websiteId,
    requestedShopId,
    true
  );

  await sellerRepository.updateShopWebsiteById(website.id, {
    isArchived: true,
    status: "archived",
  });
};

export const createDomainForWebsite = async (
  sellerId: string | undefined,
  websiteId: string | undefined,
  requestedShopId: string | undefined,
  domainInput: string
) => {
  const website = await getWebsiteAccessOrThrow(sellerId, websiteId, requestedShopId);
  const domainName = normalizeDomain(domainInput || "");

  if (!domainName || !domainName.includes(".")) {
    throw new ValidationError("A valid custom domain is required.");
  }

  const existingDomain = await sellerRepository.findDomainByName(domainName);

  if (existingDomain) {
    throw new ValidationError("This domain is already connected.");
  }

  const verificationToken = createVerificationToken();
  const domain = await sellerRepository.createWebsiteDomain({
    websiteId: website.id,
    domain: domainName,
    status: "pending",
    isPrimary: website.domains.length === 0,
    verificationToken,
    verificationTarget: `atlas-site-verification=${verificationToken}`,
  });

  return {
    domain: {
      ...domain,
      instructions: buildDomainInstructions(domain),
    },
  };
};

export const connectWebsiteDomain = async (
  sellerId: string | undefined,
  websiteId: string | undefined,
  domainId: string | undefined,
  requestedShopId: string | undefined,
  isPrimary: any
) => {
  const website = await getWebsiteAccessOrThrow(sellerId, websiteId, requestedShopId);
  const domain = website.domains.find((item: any) => item.id === domainId);

  if (!domain) {
    throw new NotFoundError("Domain not found for this website.");
  }

  const updatedDomain = await sellerRepository.updateWebsiteDomainById(domain.id, {
    status: "connected",
    verifiedAt: new Date(),
    isPrimary: typeof isPrimary === "boolean" ? isPrimary : domain.isPrimary,
  });

  if (updatedDomain.isPrimary) {
    await sellerRepository.updateWebsiteDomains(website.id, updatedDomain.id, {
      isPrimary: false,
    });
  }

  await sellerRepository.updateShopById(website.shopId, {
    website: `https://${updatedDomain.domain}`,
  });

  return {
    domain: {
      ...updatedDomain,
      instructions: buildDomainInstructions(updatedDomain),
    },
  };
};

export const removeWebsiteDomain = async (
  sellerId: string | undefined,
  websiteId: string | undefined,
  domainId: string | undefined,
  requestedShopId?: string
) => {
  const website = await getWebsiteAccessOrThrow(
    sellerId,
    websiteId,
    requestedShopId,
    true
  );
  const domain = website.domains.find((item: any) => item.id === domainId);

  if (!domain) {
    throw new NotFoundError("Domain not found for this website.");
  }

  await sellerRepository.deleteWebsiteDomain(domain.id);

  const nextPrimary = website.domains.find((item: any) => item.id !== domain.id);

  if (domain.isPrimary && nextPrimary) {
    await sellerRepository.updateWebsiteDomainById(nextPrimary.id, {
      isPrimary: true,
    });
    await sellerRepository.updateShopById(website.shopId, {
      website: `https://${nextPrimary.domain}`,
    });
  } else if (domain.isPrimary) {
    await sellerRepository.updateShopById(website.shopId, {
      website: null,
    });
  }
};

export const sellerWebsiteService = {
  listShopWebsites,
  createWebsiteForShop,
  getWebsiteForShop,
  updateWebsiteForShop,
  publishWebsiteForShop,
  archiveWebsiteForShop,
  createDomainForWebsite,
  connectWebsiteDomain,
  removeWebsiteDomain,
};
