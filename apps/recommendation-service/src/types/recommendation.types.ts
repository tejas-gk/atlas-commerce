import { Request } from "express";

export type RecommendationRequest = Request & {
  user?: {
    id: string;
  };
};
