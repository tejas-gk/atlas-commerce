import db from "@repo/db";

export const recommendationRepository = {
  findProducts: () =>
    db.products.findMany({
      include: { images: true, Shop: true },
    }),

  findUserAnalytics: (userId: string) =>
    db.userAnalytics.findUnique({
      where: { userId },
      select: { actions: true, recommendations: true, lastTrained: true },
    }),

  updateRecommendations: (userId: string, recommendations: string[], lastTrained: Date) =>
    db.userAnalytics.update({
      where: { userId },
      data: {
        recommendations,
        lastTrained,
      },
    }),
};
