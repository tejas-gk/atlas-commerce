import { ForbiddenError, NotFoundError, ValidationError } from "@repo/error-handler";

import { sellerRepository } from "../repositories/seller.repository";
import { getAccessibleShopOrThrow } from "./seller-shared.service";

export const getMembersForShop = async (sellerId?: string, requestedShopId?: string) => {
  const shop = await getAccessibleShopOrThrow(sellerId, requestedShopId);
  const members = await sellerRepository.findShopMembers(shop.id);

  return { members };
};

export const addMemberToShop = async (
  sellerId: string | undefined,
  body: any
) => {
  const { shopId, email, role } = body;

  if (!shopId || !email || !role) {
    throw new ValidationError("Shop id, email and role are required!");
  }

  if (!["owner", "manager", "staff"].includes(role)) {
    throw new ValidationError("Invalid shop member role!");
  }

  const shop = await getAccessibleShopOrThrow(sellerId, shopId);
  const user = await sellerRepository.findUserByEmail(email);

  if (!user) {
    throw new NotFoundError("User not found with this email!");
  }

  const member = await sellerRepository.upsertShopMember(shop.id, user.id, role);

  return { member };
};

export const removeMemberFromShop = async (
  sellerId: string | undefined,
  body: any
) => {
  const { shopId, memberId } = body;

  if (!shopId || !memberId) {
    throw new ValidationError("Shop id and member id are required!");
  }

  const shop = await getAccessibleShopOrThrow(sellerId, shopId);
  const membership = await sellerRepository.findShopMemberById(memberId);

  if (!membership || membership.shopId !== shop.id) {
    throw new NotFoundError("Shop member not found!");
  }

  if (membership.role === "owner") {
    throw new ForbiddenError("Owner cannot be removed from the shop!");
  }

  await sellerRepository.deleteShopMember(memberId);
};

export const sellerMemberService = {
  getMembersForShop,
  addMemberToShop,
  removeMemberFromShop,
};
