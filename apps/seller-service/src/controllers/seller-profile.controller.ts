import { NextFunction, Response } from "express";

import {
  editSellerShopProfile,
  updateSellerProfilePictures,
  uploadSellerImage,
} from "../services/seller-profile.service";
import { SellerRequest } from "../types/seller.types";

export const uploadImage = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const upload = await uploadSellerImage(req.body);

    return res.status(201).json({
      success: true,
      ...upload,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProfilePictures = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await updateSellerProfilePictures(req);

    res.status(200).json({
      success: true,
      message: result.message,
      updatedSeller: result.updatedSeller,
    });
  } catch (error) {
    return next(error);
  }
};

export const editSellerProfile = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedShop = await editSellerShopProfile(req);

    res.status(200).json({
      success: true,
      message: "Shop profile updated successfully!",
      updatedShop,
    });
  } catch (error) {
    return next(error);
  }
};
