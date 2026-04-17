import { ValidationError } from "@repo/error-handler";

import { sellerRepository } from "../repositories/seller.repository";

export const getSellerNotifications = (sellerId: string) =>
  sellerRepository.findNotificationsByReceiverId(sellerId);

export const markSellerNotificationAsRead = async (notificationId?: string) => {
  if (!notificationId) {
    throw new ValidationError("Notification id is required!");
  }

  return sellerRepository.updateNotificationStatus(notificationId, "Read");
};

export const sellerNotificationService = {
  getSellerNotifications,
  markSellerNotificationAsRead,
};
