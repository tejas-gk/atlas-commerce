import { ValidationError } from "@repo/error-handler";

import { sellerRepository } from "../repositories/seller.repository";

export const followSellerShop = async (userId: string, shopId?: string) => {
  if (!shopId) {
    throw new ValidationError("Shop id is required!");
  }

  const existingFollow = await sellerRepository.findFollow(userId, shopId);

  if (existingFollow) {
    return {
      alreadyFollowing: true,
    };
  }

  const follow = await sellerRepository.createFollow(userId, shopId);

  return { follow, alreadyFollowing: false };
};

export const unfollowSellerShop = async (userId: string, shopId?: string) => {
  if (!shopId) {
    throw new ValidationError("Shop id is required!");
  }

  const existingFollow = await sellerRepository.findFollow(userId, shopId);

  if (!existingFollow) {
    return { removed: false };
  }

  await sellerRepository.deleteFollow(existingFollow.id);

  return { removed: true };
};

export const getFollowStatus = async (userId: string, shopId?: string) => {
  if (!shopId) {
    throw new ValidationError("Shop id is required!");
  }

  return sellerRepository.findFollow(userId, shopId);
};

export const sellerFollowService = {
  followSellerShop,
  unfollowSellerShop,
  getFollowStatus,
};
