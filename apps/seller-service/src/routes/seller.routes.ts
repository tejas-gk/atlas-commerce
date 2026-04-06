import isAuthenticated from "@repo/middleware";
import { isSeller } from "@repo/middleware/authorizeRoles";
import express from "express";
import {
  addShopMember,
  createShopWebsite,
  createWebsiteDomain,
  deleteShop,
  deleteShopWebsite,
  deleteWebsiteDomain,
  editSellerProfile,
  followShop,
  getSellerEvents,
  getSellerInfo,
  getShopMembers,
  getShopWebsite,
  getShopWebsites,
  getSellerProducts,
  isFollowing,
  markNotificationAsRead,
  markWebsiteDomainConnected,
  publishShopWebsite,
  resolvePublishedWebsiteByDomain,
  removeShopMember,
  restoreShop,
  sellerNotifications,
  unfollowShop,
  updateShopWebsite,
  updateProfilePictures,
  uploadImage,
} from "../controllers/seller.controller";

const router = express.Router();

router.get("/websites/resolve", resolvePublishedWebsiteByDomain);
router.delete("/delete", isAuthenticated, deleteShop);
router.patch("/restore", isAuthenticated, restoreShop);
router.post("/upload-image", isAuthenticated, uploadImage);
router.put("/update-image", isAuthenticated, updateProfilePictures);
router.put("/edit-profile", isAuthenticated, editSellerProfile);
router.get("/shop-members", isAuthenticated, isSeller, getShopMembers);
router.post("/shop-members", isAuthenticated, isSeller, addShopMember);
router.delete("/shop-members", isAuthenticated, isSeller, removeShopMember);
router.get("/websites", isAuthenticated, isSeller, getShopWebsites);
router.post("/websites", isAuthenticated, isSeller, createShopWebsite);
router.get("/websites/:websiteId", isAuthenticated, isSeller, getShopWebsite);
router.put("/websites/:websiteId", isAuthenticated, isSeller, updateShopWebsite);
router.post(
  "/websites/:websiteId/publish",
  isAuthenticated,
  isSeller,
  publishShopWebsite
);
router.delete(
  "/websites/:websiteId",
  isAuthenticated,
  isSeller,
  deleteShopWebsite
);
router.post(
  "/websites/:websiteId/domains",
  isAuthenticated,
  isSeller,
  createWebsiteDomain
);
router.delete(
  "/websites/:websiteId/domains/:domainId",
  isAuthenticated,
  isSeller,
  deleteWebsiteDomain
);
router.patch(
  "/websites/:websiteId/domains/:domainId/connect",
  isAuthenticated,
  isSeller,
  markWebsiteDomainConnected
);
router.get("/get-seller/:id", getSellerInfo);
router.get("/get-seller-products/:id", getSellerProducts);
router.get("/get-seller-events/:id", getSellerEvents);
router.get(
  "/seller-notifications",
  isAuthenticated,
  isSeller,
  sellerNotifications
);
router.post("/follow-shop", isAuthenticated, followShop);
router.post("/unfollow-shop", isAuthenticated, unfollowShop);
router.get("/is-following/:id", isAuthenticated, isFollowing);
router.post(
  "/mark-notification-as-read",
  isAuthenticated,
  markNotificationAsRead
);

export default router;
