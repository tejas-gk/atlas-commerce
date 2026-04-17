import { ForbiddenError } from "@repo/error-handler";

import { sellerRepository } from "../repositories/seller.repository";
import { getSellerShopOrThrow } from "./seller-shared.service";

export const markShopForDeletion = async (
  sellerId?: string,
  requestedShopId?: string
) => {
  const shop = await getSellerShopOrThrow(sellerId, requestedShopId);
  const deletedAt = new Date();

  deletedAt.setDate(deletedAt.getDate() + 28);

  await sellerRepository.softDeleteShop(shop.id, deletedAt);
};

export const restoreDeletedShop = async (
  sellerId?: string,
  requestedShopId?: string
) => {
  const shop = await getSellerShopOrThrow(sellerId, requestedShopId);

  if (!shop.isDeleted || !shop.deletedAt) {
    throw new ForbiddenError("Shop is not marked for deletion");
  }

  const now = new Date();
  const deletedAt = new Date(shop.deletedAt);

  if (now > deletedAt) {
    throw new ForbiddenError(
      "Cannot restore. The 28-day recovery period has expired."
    );
  }

  await sellerRepository.restoreShop(shop.id);
};

export const sellerShopService = {
  markShopForDeletion,
  restoreDeletedShop,
};
