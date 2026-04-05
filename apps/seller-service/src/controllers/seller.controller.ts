import { NextFunction, Request, Response } from "express";
import db from "@repo/db";
import {
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@repo/error-handler";
import { imagekit } from "@atlas/imagekit";

const getPrimaryShop = (seller: any, requestedShopId?: string) => {
  if (!seller?.shops?.length) return null;
  if (requestedShopId) {
    return seller.shops.find((shop: any) => shop.id === requestedShopId) ?? null;
  }
  return seller.shops.find((shop: any) => !shop.isDeleted) ?? seller.shops[0] ?? null;
};

const getAccessibleShop = async (sellerId: string, requestedShopId?: string) => {
  const shop = await db.shops.findFirst({
    where: {
      sellerId,
      ...(requestedShopId ? { id: requestedShopId } : {}),
    },
  });

  return shop;
};

// delete shop (soft delete)
export const deleteShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;
    const requestedShopId = req.body?.shopId || req.query?.shopId;

    const seller = await db.users.findFirst({
      where: { id: sellerId, role: "seller" },
      include: { shops: true },
    });
    const shop = getPrimaryShop(seller, requestedShopId);

    if (!seller || !shop) {
      return next(new NotFoundError("Seller or Shop not found"));
    }

    // 28 days from now
    const deletedAt = new Date();
    deletedAt.setDate(deletedAt.getDate() + 28);

    await db.shops.update({
      where: { id: shop.id },
      data: {
        isDeleted: true,
        deletedAt,
      },
    });

    return res.status(200).json({
      message: "Shop marked for deletion. It will be permanently removed in 28 days.",
    });
  } catch (error) {
    return next(error);
  }
};

// restore shop
export const restoreShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;
    const requestedShopId = req.body?.shopId || req.query?.shopId;

    const seller = await db.users.findFirst({
      where: { id: sellerId, role: "seller" },
      include: { shops: true },
    });
    const shop = getPrimaryShop(seller, requestedShopId);

    if (!seller || !shop) {
      return next(new NotFoundError("Seller or Shop not found"));
    }

    if (!shop.isDeleted || !shop.deletedAt) {
      return next(new ForbiddenError("Shop is not marked for deletion"));
    }

    const now = new Date();
    const deletedAt = new Date(shop.deletedAt);

    if (now > deletedAt) {
      return next(
        new ForbiddenError(
          "Cannot restore. The 28-day recovery period has expired."
        )
      );
    }

    await db.shops.update({
      where: { id: shop.id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return res.status(200).json({
      message: "Shop has been successfully restored.",
    });
  } catch (error) {
    return next(error);
  }
};

// Upload Image
export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { file, fileName, folder } = req.body;

    if (!file || !fileName || !folder) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields!" });
    }

    // Upload image to ImageKit
    const uploadResponse = await imagekit.upload({
      file,
      fileName,
      folder,
    });

    return res.status(201).json({
      success: true,
      file_id: uploadResponse.fileId,
      url: uploadResponse.url,
    });
  } catch (error) {
    console.error("Image Upload Failed:", error);
    return next(error);
  }
};

// update avatar & cover photo
export const updateProfilePictures = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { editType, imageUrl } = req.body;

    if (!editType || !imageUrl) {
      return next(new ValidationError("Missing required fields!"));
    }

    // Ensure the user is authenticated
    if (!req.seller?.id) {
      return next(new AuthError("Only sellers can update profile pictures!"));
    }

    // Determine update field (avatar or cover)
    const updateField =
      editType === "cover" ? { coverBanner: imageUrl } : { avatar: imageUrl };

    // Update seller's profile
    const updatedSeller = await db.shops.update({
      where: { id: req.body.shopId || req.seller.shop?.id },
      data: updateField,
      select: {
        id: true,
        avatar: true,
        coverBanner: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `${
        editType === "cover" ? "Cover photo" : "Avatar"
      } updated successfully!`,
      updatedSeller,
    });
  } catch (error) {
    return next(error);
  }
};

// edit seller profile
export const editSellerProfile = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, socialLinks } =
      req.body;

    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      !website ||
      !socialLinks
    ) {
      return next(new ValidationError("Please fill all the fields!"));
    }

    // Ensure the user is authenticated
    if (!req.seller?.id) {
      return next(new AuthError("Only sellers can edit their profile!"));
    }

    // Check if the shop exists for the seller
    const existingShop = await db.shops.findFirst({
      where: {
        sellerId: req.seller.id,
        ...(req.body.shopId ? { id: req.body.shopId } : {}),
      },
    });

    if (!existingShop) {
      return next(new ValidationError("Shop not found for this seller!"));
    }

    // Update the shop profile
    const updatedShop = await db.shops.update({
      where: { id: existingShop.id },
      data: {
        name,
        bio,
        address,
        opening_hours,
        website,
        socialLinks,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        address: true,
        opening_hours: true,
        website: true,
        socialLinks: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Shop profile updated successfully!",
      updatedShop,
    });
  } catch (error) {
    return next(error);
  }
};

// get seller (public preview)
export const getSellerInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shop = await db.shops.findUnique({
      where: { id: req.params.id },
    });

    const followersCount = await db.followers.count({
      where: { shopsId: shop?.id },
    });

    res.status(201).json({
      success: true,
      shop,
      followersCount,
    });
  } catch (error) {
    next(error);
  }
};

// get seller products (public preview)
export const getSellerProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.products.findMany({
        where: {
          starting_date: null,
          shopId: req.query.id!,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          images: true,
          Shop: true,
        },
      }),

      db.products.count({
        where: {
          starting_date: null,
          shopId: req.query.id!,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// get seller events (public preview)
export const getSellerEvents = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.products.findMany({
        where: {
          starting_date: {
            not: null,
          },
          shopId: req.query.id!,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          images: true,
        },
      }),

      db.products.count({
        where: {
          starting_date: null,
          shopId: req.query.id!,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// follow a shop
export const followShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body;

    if (!shopId) {
      return next(new ValidationError("Shop id is required!"));
    }

    // Check if already followed
    const existingFollow = await db.followers.findFirst({
      where: {
        userId: req.user?.id,
        shopsId: shopId,
      },
    });

    if (existingFollow) {
      return res.status(200).json({
        success: true,
        message: "Already following this shop",
      });
    }

    // Create new follow
    const follow = await db.followers.create({
      data: {
        userId: req.user?.id,
        shopsId: shopId,
      },
    });

    res.status(201).json({
      success: true,
      follow,
    });
  } catch (error) {
    next(error);
  }
};

// unfollow a shop
export const unfollowShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body;

    if (!shopId) {
      return next(new ValidationError("Shop id is required!"));
    }

    const existingFollow = await db.followers.findFirst({
      where: {
        userId: req.user?.id,
        shopsId: shopId,
      },
    });

    if (!existingFollow) {
      return res.status(404).json({
        success: false,
        message: "You are not following this shop.",
      });
    }

    await db.followers.delete({
      where: {
        id: existingFollow.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully unfollowed the shop.",
    });
  } catch (error) {
    next(error);
  }
};

// is following
export const isFollowing = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = req.params.id;
    if (!shopId) {
      return next(new ValidationError("Shop id is required!"));
    }

    const isFollowing = await db.followers.findFirst({
      where: {
        userId: req.user?.id,
        shopsId: shopId,
      },
    });

    res.status(200).json({
      success: true,
      isFollowing,
    });
  } catch (error) {
    next(error);
  }
};

// fetching notifications for sellers
export const sellerNotifications = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;

    const notifications = await db.notifications.findMany({
      where: {
        receiverId: sellerId,
      },
      orderBy: {
        cratedAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {}
};

export const getShopMembers = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shop = await getAccessibleShop(req.seller.id, req.query.shopId);

    if (!shop) {
      return next(new NotFoundError("Shop not found!"));
    }

    const members = await db.shopMembers.findMany({
      where: { shopId: shop.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
            country: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      members,
    });
  } catch (error) {
    next(error);
  }
};

export const addShopMember = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId, email, role } = req.body;

    if (!shopId || !email || !role) {
      return next(new ValidationError("Shop id, email and role are required!"));
    }

    if (!["owner", "manager", "staff"].includes(role)) {
      return next(new ValidationError("Invalid shop member role!"));
    }

    const shop = await getAccessibleShop(req.seller.id, shopId);

    if (!shop) {
      return next(new NotFoundError("Shop not found!"));
    }

    const user = await db.users.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return next(new NotFoundError("User not found with this email!"));
    }

    const member = await db.shopMembers.upsert({
      where: {
        shopId_userId: {
          shopId: shop.id,
          userId: user.id,
        },
      },
      create: {
        shopId: shop.id,
        userId: user.id,
        role,
      },
      update: {
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    next(error);
  }
};

export const removeShopMember = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId, memberId } = req.body;

    if (!shopId || !memberId) {
      return next(new ValidationError("Shop id and member id are required!"));
    }

    const shop = await getAccessibleShop(req.seller.id, shopId);

    if (!shop) {
      return next(new NotFoundError("Shop not found!"));
    }

    const membership = await db.shopMembers.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.shopId !== shop.id) {
      return next(new NotFoundError("Shop member not found!"));
    }

    if (membership.role === "owner") {
      return next(new ForbiddenError("Owner cannot be removed from the shop!"));
    }

    await db.shopMembers.delete({
      where: { id: memberId },
    });

    res.status(200).json({
      success: true,
      message: "Shop member removed successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// mark notification as read
export const markNotificationAsRead = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return next(new ValidationError("Notification id is required!"));
    }

    const notification = await db.notifications.update({
      where: { id: notificationId },
      data: { status: "Read" },
    });

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};
