import db from "@repo/db";
import cron from "node-cron";

// Run daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();

    const expiredShops = await db.shops.findMany({
      where: {
        isDeleted: true,
        deletedAt: { lte: now },
      },
    });

    for (const shop of expiredShops) {
      await db.shops.delete({
        where: { id: shop.id },
      });
    }
  } catch (error) {
    console.error("Error deleting expired shops:", error);
  }
});
