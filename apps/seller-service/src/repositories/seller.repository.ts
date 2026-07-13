import db from "@repo/db";

export const sellerRepository = {
  findSellerWithShops: (sellerId: string) =>
    db.users.findFirst({
      where: {
        id: sellerId,
        OR: [{ role: "seller" }, { shopMembers: { some: {} } }],
      },
      include: { shops: true, shopMembers: { include: { shop: true } } },
    }),

  findAccessibleShop: (sellerId: string, requestedShopId?: string) =>
    db.shops.findFirst({
      where: {
        OR: [{ sellerId }, { shopMembers: { some: { userId: sellerId } } }],
        ...(requestedShopId ? { id: requestedShopId } : {}),
      },
    }),

  softDeleteShop: (shopId: string, deletedAt: Date) =>
    db.shops.update({
      where: { id: shopId },
      data: {
        isDeleted: true,
        deletedAt,
      },
    }),

  restoreShop: (shopId: string) =>
    db.shops.update({
      where: { id: shopId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    }),

  updateShopById: (shopId: string, data: any, select?: any) =>
    db.shops.update({
      where: { id: shopId },
      data,
      ...(select ? { select } : {}),
    }),

  findPublicShopById: (shopId: string) =>
    db.shops.findUnique({
      where: { id: shopId },
    }),

  countFollowersByShopId: (shopId?: string) =>
    db.followers.count({
      where: { shopsId: shopId },
    }),

  findProductsByShopId: (shopId: string, skip: number, take: number) =>
    db.products.findMany({
      where: {
        starting_date: null,
        shopId,
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: true,
        Shop: true,
      },
    }),

  countProductsByShopId: (shopId: string) =>
    db.products.count({
      where: {
        starting_date: null,
        shopId,
      },
    }),

  findEventsByShopId: (shopId: string, skip: number, take: number) =>
    db.products.findMany({
      where: {
        starting_date: {
          not: null,
        },
        shopId,
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: true,
      },
    }),

  countEventsByShopId: (shopId: string) =>
    db.products.count({
      where: {
        starting_date: {
          not: null,
        },
        shopId,
      },
    }),

  findFollow: (userId: string, shopId: string) =>
    db.followers.findFirst({
      where: {
        userId,
        shopsId: shopId,
      },
    }),

  createFollow: (userId: string, shopId: string) =>
    db.followers.create({
      data: {
        userId,
        shopsId: shopId,
      },
    }),

  deleteFollow: (followId: string) =>
    db.followers.delete({
      where: {
        id: followId,
      },
    }),

  findNotificationsByReceiverId: (receiverId: string) =>
    db.notifications.findMany({
      where: {
        receiverId,
      },
      orderBy: {
        cratedAt: "desc",
      },
    }),

  updateNotificationStatus: (notificationId: string, status: string) =>
    db.notifications.update({
      where: { id: notificationId },
      data: { status },
    }),

  findShopMembers: (shopId: string) =>
    db.shopMembers.findMany({
      where: { shopId },
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
    }),

  findUserByEmail: (email: string) =>
    db.users.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    }),

  upsertShopMember: (shopId: string, userId: string, role: string) =>
    db.shopMembers.upsert({
      where: {
        shopId_userId: {
          shopId,
          userId,
        },
      },
      create: {
        shopId,
        userId,
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
    }),

  findShopMemberById: (memberId: string) =>
    db.shopMembers.findUnique({
      where: { id: memberId },
    }),

  deleteShopMember: (memberId: string) =>
    db.shopMembers.delete({
      where: { id: memberId },
    }),

  findShopWebsites: (shopId: string) =>
    db.shopWebsites.findMany({
      where: {
        shopId,
        isArchived: false,
      },
      include: {
        domains: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
      },
      orderBy: { updatedAt: "desc" },
    }),

  findWebsiteByShopAndSlug: (shopId: string, slug: string) =>
    db.shopWebsites.findFirst({
      where: {
        shopId,
        slug,
      },
    }),

  createShopWebsite: (data: any) =>
    db.shopWebsites.create({
      data,
      include: {
        domains: true,
      },
    }),

  findWebsiteAccess: (websiteId: string) =>
    db.shopWebsites.findUnique({
      where: { id: websiteId },
      include: {
        shop: true,
        domains: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
      },
    }),

  findConflictingWebsiteSlug: (
    shopId: string,
    slug: string,
    websiteId: string,
  ) =>
    db.shopWebsites.findFirst({
      where: {
        shopId,
        slug,
        NOT: { id: websiteId },
      },
    }),

  updateShopWebsiteById: (websiteId: string, data: any) =>
    db.shopWebsites.update({
      where: { id: websiteId },
      data,
      include: {
        domains: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
      },
    }),

  findDomainByName: (domain: string) =>
    db.websiteDomains.findUnique({
      where: { domain },
    }),

  createWebsiteDomain: (data: any) =>
    db.websiteDomains.create({
      data,
    }),

  updateWebsiteDomainById: (domainId: string, data: any) =>
    db.websiteDomains.update({
      where: { id: domainId },
      data,
    }),

  updateWebsiteDomains: (websiteId: string, domainId: string, data: any) =>
    db.websiteDomains.updateMany({
      where: {
        websiteId,
        NOT: { id: domainId },
      },
      data,
    }),

  deleteWebsiteDomain: (domainId: string) =>
    db.websiteDomains.delete({
      where: { id: domainId },
    }),

  findPublishedDomain: (domain: string) =>
    db.websiteDomains.findUnique({
      where: { domain },
      include: {
        website: {
          include: {
            shop: true,
          },
        },
      },
    }),
};
