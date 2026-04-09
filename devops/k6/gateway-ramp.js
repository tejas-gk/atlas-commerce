import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.BASE_URL || "http://localhost:8080";

export const options = {
  stages: [
    { duration: "2m", target: 20 },
    { duration: "5m", target: 80 },
    { duration: "3m", target: 120 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<1200", "p(99)<2000"],
  },
};

export default function () {
  const endpoints = ["/gateway-health", "/api/products", "/api/categories"];
  const path = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(`${baseUrl}${path}`, {
    tags: { suite: "gateway-ramp", endpoint: path },
  });

  check(res, {
    "response is not 5xx": (r) => r.status < 500,
  });

  sleep(Math.random() * 2);
}
