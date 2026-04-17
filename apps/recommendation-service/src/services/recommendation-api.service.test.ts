import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

import { recommendationRepository } from "../repositories/recommendation.repository";
import { recommendationApiService } from "./recommendation-api.service";
import { recommendationEngine } from "./recommendationService";

afterEach(() => {
  mock.restoreAll();
});

describe("recommendationApiService", () => {
  it("returns recent products when analytics are missing", async () => {
    mock.method(recommendationRepository, "findProducts", async () =>
      Array.from({ length: 12 }, (_, index) => ({ id: `product-${index + 1}` })) as any
    );
    mock.method(recommendationRepository, "findUserAnalytics", async () => null);

    const recommendations = await recommendationApiService.getRecommendationsForUser("user-1");

    assert.equal(recommendations.length, 10);
    assert.equal((recommendations[0] as any).id, "product-3");
  });

  it("reuses cached recommendations when training is still fresh", async () => {
    mock.method(recommendationRepository, "findProducts", async () =>
      [{ id: "p1" }, { id: "p2" }, { id: "p3" }] as any
    );
    mock.method(recommendationRepository, "findUserAnalytics", async () => ({
      actions: Array.from({ length: 50 }, () => ({ type: "view" })),
      recommendations: ["p2", "p3"],
      lastTrained: new Date(),
    }) as any);

    const recommendations = await recommendationApiService.getRecommendationsForUser("user-1");

    assert.deepEqual(
      recommendations.map((item: any) => item.id),
      ["p2", "p3"]
    );
  });

  it("recomputes and persists recommendations when cache is stale", async () => {
    mock.method(recommendationRepository, "findProducts", async () =>
      [{ id: "p1" }, { id: "p2" }, { id: "p3" }] as any
    );
    mock.method(recommendationRepository, "findUserAnalytics", async () => ({
      actions: Array.from({ length: 60 }, () => ({ type: "view" })),
      recommendations: [],
      lastTrained: new Date(Date.now() - 4 * 60 * 60 * 1000),
    }) as any);
    mock.method(recommendationEngine, "recommendProducts", async () => ["p3", "p1"] as any);
    const updateMock = mock.method(recommendationRepository, "updateRecommendations", async () => ({}) as any);

    const recommendations = await recommendationApiService.getRecommendationsForUser("user-1");

    assert.deepEqual(
      recommendations.map((item: any) => item.id),
      ["p1", "p3"]
    );
    assert.equal(updateMock.mock.callCount(), 1);
  });
});
