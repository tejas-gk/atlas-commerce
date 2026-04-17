import { NextFunction, Response } from "express";

import {
  getSellerEventsPreview,
  getSellerProductsPreview,
  getSellerPublicInfo,
  resolvePublishedWebsite,
} from "../services/seller-public.service";
import { SellerRequest } from "../types/seller.types";

export const getSellerInfo = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getSellerPublicInfo(req.params.id);

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerProducts = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getSellerProductsPreview(req.query);

    res.status(200).json({
      success: true,
      products: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerEvents = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getSellerEventsPreview(req.query);

    res.status(200).json({
      success: true,
      products: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const resolvePublishedWebsiteByDomain = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await resolvePublishedWebsite(String(req.query.domain || ""));

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
