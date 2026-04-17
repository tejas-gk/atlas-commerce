import { NextFunction, Response } from "express";

import {
  followSellerShop,
  getFollowStatus,
  unfollowSellerShop,
} from "../services/seller-follow.service";
import { SellerRequest } from "../types/seller.types";

export const followShop = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await followSellerShop(req.user?.id, req.body.shopId);

    if (result.alreadyFollowing) {
      return res.status(200).json({
        success: true,
        message: "Already following this shop",
      });
    }

    res.status(201).json({
      success: true,
      follow: result.follow,
    });
  } catch (error) {
    next(error);
  }
};

export const unfollowShop = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await unfollowSellerShop(req.user?.id, req.body.shopId);

    if (!result.removed) {
      return res.status(404).json({
        success: false,
        message: "You are not following this shop.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully unfollowed the shop.",
    });
  } catch (error) {
    next(error);
  }
};

export const isFollowing = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const follow = await getFollowStatus(req.user?.id, req.params.id);

    res.status(200).json({
      success: true,
      isFollowing: follow,
    });
  } catch (error) {
    next(error);
  }
};
