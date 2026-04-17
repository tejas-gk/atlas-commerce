import { NextFunction, Response } from "express";

import {
  getSellerNotifications,
  markSellerNotificationAsRead,
} from "../services/seller-notification.service";
import { SellerRequest } from "../types/seller.types";

export const sellerNotifications = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await getSellerNotifications(req.seller.id);

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const notification = await markSellerNotificationAsRead(req.body.notificationId);

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};
