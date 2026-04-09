import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.BASE_URL || "http://localhost:8080";

export const options = {
  vus: 1,
  iterations: 5,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
  },
};

export default function () {
  const res = http.get(`${baseUrl}/gateway-health`, {
    tags: { suite: "smoke", target: "gateway-health" },
  });

  check(res, {
    "gateway health is 2xx": (r) => r.status >= 200 && r.status < 300,
  });

  sleep(1);
}
