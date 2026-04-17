import { Request } from "express";

export type AuthRole = "user" | "seller" | "admin";

export type AuthenticatedRequest = Request & {
    body: any;
    cookies: Record<string, string | undefined>;
    headers: Request["headers"] & { "x-shop-id"?: string };
    query: Request["query"] & { shopId?: string };
    role?: AuthRole;
    seller?: any;
    user?: any;
};
