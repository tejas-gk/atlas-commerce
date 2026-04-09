import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.BASE_URL || "http://localhost:8080";

export const options = {
  scenarios: {
    checkout_spike: {
      executor: "ramping-vus",
      stages: [
        { duration: "30s", target: 10 },
        { duration: "30s", target: 150 },
        { duration: "2m", target: 150 },
        { duration: "30s", target: 0 },
      ],
      gracefulRampDown: "15s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.03"],
    http_req_duration: ["p(95)<1800"],
  },
};

export default function () {
  const payload = JSON.stringify({
    items: [
      { productId: "sku-1", quantity: 1, price: 1299 },
      { productId: "sku-2", quantity: 2, price: 399 },
    ],
    currency: "INR",
    addressId: "load-test-address",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    tags: {
      suite: "checkout-spike",
      endpoint: "/api/orders",
    },
  };

  const res = http.post(`${baseUrl}/api/orders`, payload, params);

  check(res, {
    "order endpoint avoids 5xx": (r) => r.status < 500,
  });

  sleep(1);
}
