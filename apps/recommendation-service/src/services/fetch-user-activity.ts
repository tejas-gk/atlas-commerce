import db from "@repo/db";

export const getUserActivity = async (userId: string) => {
  try {
    const userActivity = await db.userAnalytics.findUnique({
      where: { userId },
      select: { actions: true },
    });

    return userActivity?.actions || [];
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return [];
  }
};
