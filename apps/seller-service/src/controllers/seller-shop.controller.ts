import { NextFunction, Response } from "express";

import {
  markShopForDeletion,
  restoreDeletedShop,
} from "../services/seller-shop.service";
import { getRequestedShopId } from "../services/seller-shared.service";
import { SellerRequest } from "../types/seller.types";

export const deleteShop = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await markShopForDeletion(req.seller?.id, getRequestedShopId(req));

    return res.status(200).json({
      message: "Shop marked for deletion. It will be permanently removed in 28 days.",
    });
  } catch (error) {
    return next(error);
  }
};

export const restoreShop = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await restoreDeletedShop(req.seller?.id, getRequestedShopId(req));

    return res.status(200).json({
      message: "Shop has been successfully restored.",
    });
  } catch (error) {
    return next(error);
  }
};
