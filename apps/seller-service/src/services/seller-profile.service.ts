import { imagekit } from "@atlas/imagekit";
import { AuthError, ValidationError } from "@repo/error-handler";

import { sellerRepository } from "../repositories/seller.repository";

export const uploadSellerImage = async (body: any) => {
  const { file, fileName, folder } = body;

  if (!file || !fileName || !folder) {
    throw new ValidationError("Missing required fields!");
  }

  const uploadResponse = await imagekit.upload({
    file,
    fileName,
    folder,
  });

  return {
    file_id: uploadResponse.fileId,
    url: uploadResponse.url,
  };
};

export const updateSellerProfilePictures = async (req: any) => {
  const { editType, imageUrl } = req.body;

  if (!editType || !imageUrl) {
    throw new ValidationError("Missing required fields!");
  }

  if (!req.seller?.id) {
    throw new AuthError("Only sellers can update profile pictures!");
  }

  const updateField =
    editType === "cover" ? { coverBanner: imageUrl } : { avatar: imageUrl };

  const updatedSeller = await sellerRepository.updateShopById(
    req.body.shopId || req.seller.shop?.id,
    updateField,
    {
      id: true,
      avatar: true,
      coverBanner: true,
    }
  );

  return {
    updatedSeller,
    message: `${editType === "cover" ? "Cover photo" : "Avatar"} updated successfully!`,
  };
};

export const editSellerShopProfile = async (req: any) => {
  const { name, bio, address, opening_hours, website, socialLinks } = req.body;

  if (!name || !bio || !address || !opening_hours || !website || !socialLinks) {
    throw new ValidationError("Please fill all the fields!");
  }

  if (!req.seller?.id) {
    throw new AuthError("Only sellers can edit their profile!");
  }

  const existingShop = await sellerRepository.findAccessibleShop(
    req.seller.id,
    req.body.shopId
  );

  if (!existingShop) {
    throw new ValidationError("Shop not found for this seller!");
  }

  return sellerRepository.updateShopById(
    existingShop.id,
    {
      name,
      bio,
      address,
      opening_hours,
      website,
      socialLinks,
    },
    {
      id: true,
      name: true,
      bio: true,
      address: true,
      opening_hours: true,
      website: true,
      socialLinks: true,
      updatedAt: true,
    }
  );
};

export const sellerProfileService = {
  uploadSellerImage,
  updateSellerProfilePictures,
  editSellerShopProfile,
};
