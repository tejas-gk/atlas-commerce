import { Request } from "express";

export type SellerRequest = Request & {
  body: any;
  params: Record<string, string | undefined>;
  query: Request["query"] & {
    id?: string;
    page?: string;
    limit?: string;
    shopId?: string;
    domain?: string;
  };
  seller?: any;
  user?: any;
};
