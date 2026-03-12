import express, { Router } from "express";
import isAuthenticated from "@repo/middleware";
import { getRecommendedProducts } from "../controllers/recommendation-controller";

const router: Router = express.Router();

router.get(
  "/get-recommendation-products",
  isAuthenticated as any,
  getRecommendedProducts
);

export default router;
