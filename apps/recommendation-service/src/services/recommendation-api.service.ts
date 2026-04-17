import { recommendationRepository } from "../repositories/recommendation.repository";
import { recommendationEngine } from "./recommendationService";

export const getRecommendationsForUser = async (userId: string) => {
  const products = await recommendationRepository.findProducts();
  const userAnalytics = await recommendationRepository.findUserAnalytics(userId);
  const now = new Date();
  let recommendedProducts = [];

  if (!userAnalytics) {
    recommendedProducts = products.slice(-10);
  } else {
    const actions = Array.isArray(userAnalytics.actions)
      ? (userAnalytics.actions as any[])
      : [];

    const recommendations = Array.isArray(userAnalytics.recommendations)
      ? (userAnalytics.recommendations as string[])
      : [];

    const lastTrainedTime = userAnalytics.lastTrained
      ? new Date(userAnalytics.lastTrained)
      : null;
    const hoursDiff = lastTrainedTime
      ? (now.getTime() - lastTrainedTime.getTime()) / (1000 * 60 * 60)
      : Infinity;

    if (actions.length < 50) {
      recommendedProducts = products.slice(-10);
    } else if (hoursDiff < 3 && recommendations.length > 0) {
      recommendedProducts = products.filter((product) =>
        recommendations.includes(product.id)
      );
    } else {
      const recommendedProductIds = await recommendationEngine.recommendProducts(
        userId,
        products
      );
      recommendedProducts = products.filter((product) =>
        recommendedProductIds.includes(product.id)
      );

      await recommendationRepository.updateRecommendations(
        userId,
        recommendedProductIds,
        now
      );
    }
  }

  return recommendedProducts;
};

export const recommendationApiService = {
  getRecommendationsForUser,
};
