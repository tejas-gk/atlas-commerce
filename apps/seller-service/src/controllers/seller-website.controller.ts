import { NextFunction, Response } from "express";

import {
  archiveWebsiteForShop,
  connectWebsiteDomain,
  createDomainForWebsite,
  createWebsiteForShop,
  getWebsiteForShop,
  listShopWebsites,
  publishWebsiteForShop,
  removeWebsiteDomain,
  updateWebsiteForShop,
} from "../services/seller-website.service";
import { getRequestedShopId } from "../services/seller-shared.service";
import { SellerRequest } from "../types/seller.types";

export const getShopWebsites = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await listShopWebsites(req.seller?.id, getRequestedShopId(req));

    res.status(200).json({
      success: true,
      shop: result.shop,
      websites: result.websites,
    });
  } catch (error) {
    next(error);
  }
};

export const createShopWebsite = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createWebsiteForShop(
      req.seller?.id,
      getRequestedShopId(req),
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Storefront website created successfully.",
      website: result.website,
    });
  } catch (error) {
    next(error);
  }
};

export const getShopWebsite = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getWebsiteForShop(
      req.seller?.id,
      req.params.websiteId,
      getRequestedShopId(req)
    );

    res.status(200).json({
      success: true,
      website: result.website,
    });
  } catch (error) {
    next(error);
  }
};

export const updateShopWebsite = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await updateWebsiteForShop(
      req.seller?.id,
      req.params.websiteId,
      getRequestedShopId(req),
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Storefront website updated successfully.",
      website: result.website,
    });
  } catch (error) {
    next(error);
  }
};

export const publishShopWebsite = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await publishWebsiteForShop(
      req.seller?.id,
      req.params.websiteId,
      getRequestedShopId(req)
    );

    res.status(200).json({
      success: true,
      message: "Website published successfully.",
      website: result.website,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteShopWebsite = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await archiveWebsiteForShop(
      req.seller?.id,
      req.params.websiteId,
      getRequestedShopId(req)
    );

    res.status(200).json({
      success: true,
      message: "Website archived successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const createWebsiteDomain = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createDomainForWebsite(
      req.seller?.id,
      req.params.websiteId,
      getRequestedShopId(req),
      req.body.domain
    );

    res.status(201).json({
      success: true,
      message: "Domain added. Complete DNS setup to connect it.",
      domain: result.domain,
    });
  } catch (error) {
    next(error);
  }
};

export const markWebsiteDomainConnected = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await connectWebsiteDomain(
      req.seller?.id,
      req.params.websiteId,
      req.params.domainId,
      getRequestedShopId(req),
      req.body.isPrimary
    );

    res.status(200).json({
      success: true,
      message:
        "Domain marked as connected. You can now point traffic to the published website.",
      domain: result.domain,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWebsiteDomain = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await removeWebsiteDomain(
      req.seller?.id,
      req.params.websiteId,
      req.params.domainId,
      getRequestedShopId(req)
    );

    res.status(200).json({
      success: true,
      message: "Domain removed successfully.",
    });
  } catch (error) {
    next(error);
  }
};
