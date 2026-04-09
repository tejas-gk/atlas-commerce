import http from "k6/http";
import { check, group, sleep } from "k6";

const publicUrl = __ENV.PUBLIC_URL || "http://localhost:3001";
const sellerUrl = __ENV.SELLER_URL || "http://localhost:3000";
const adminUrl = __ENV.ADMIN_URL || "http://localhost:3002";

export const options = {
  scenarios: {
    browsing: {
      executor: "constant-vus",
      vus: 15,
      duration: "5m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<1500"],
  },
};

export default function () {
  group("public-web", () => {
    const home = http.get(publicUrl, { tags: { suite: "ui-browse", app: "web" } });
    check(home, { "public home loads": (r) => r.status >= 200 && r.status < 400 });
  });

  group("seller-ui", () => {
    const inbox = http.get(`${sellerUrl}/dashboard/inbox`, {
      tags: { suite: "ui-browse", app: "seller-ui" },
    });
    check(inbox, { "seller inbox loads": (r) => r.status >= 200 && r.status < 400 });
  });

  group("admin-ui", () => {
    const dashboard = http.get(`${adminUrl}/dashboard`, {
      tags: { suite: "ui-browse", app: "admin-ui" },
    });
    check(dashboard, { "admin dashboard loads": (r) => r.status >= 200 && r.status < 400 });
  });

  sleep(1);
}
