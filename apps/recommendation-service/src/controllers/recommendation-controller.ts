import { NextFunction, Response } from "express";

import { getRecommendationsForUser } from "../services/recommendation-api.service";
import { RecommendationRequest } from "../types/recommendation.types";

// get recommended products
export const getRecommendedProducts = async (
  req: RecommendationRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const recommendations = await getRecommendationsForUser(req.user!.id);

    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    return next(error);
  }
};
