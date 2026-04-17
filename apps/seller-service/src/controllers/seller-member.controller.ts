import { NextFunction, Response } from "express";

import {
  addMemberToShop,
  getMembersForShop,
  removeMemberFromShop,
} from "../services/seller-member.service";
import { getRequestedShopId } from "../services/seller-shared.service";
import { SellerRequest } from "../types/seller.types";

export const getShopMembers = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getMembersForShop(req.seller?.id, getRequestedShopId(req));

    res.status(200).json({
      success: true,
      members: result.members,
    });
  } catch (error) {
    next(error);
  }
};

export const addShopMember = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await addMemberToShop(req.seller?.id, req.body);

    res.status(200).json({
      success: true,
      member: result.member,
    });
  } catch (error) {
    next(error);
  }
};

export const removeShopMember = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await removeMemberFromShop(req.seller?.id, req.body);

    res.status(200).json({
      success: true,
      message: "Shop member removed successfully!",
    });
  } catch (error) {
    next(error);
  }
};
