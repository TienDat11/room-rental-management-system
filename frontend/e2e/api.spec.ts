import { test, expect } from "@playwright/test";

const API_URL = process.env.API_URL || "http://localhost:8000";
const FE_BASE = process.env.BASE_URL || "http://localhost:5173";

const credentials = {
  username: process.env.E2E_USERNAME || "admin_test",
  password: process.env.E2E_PASSWORD || "Admin@123",
};

test.describe("@smoke API Proxy and CORS Integrity", () => {
  test("preflight for FE proxied login endpoint returns CORS headers", async ({ request }) => {
    test.setTimeout(60000);

    const response = await request.fetch(`${FE_BASE}/api/auth/login/`, {
      method: "OPTIONS",
      timeout: 60000,
      headers: {
        Origin: FE_BASE,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);
    const allowMethods = response.headers()["access-control-allow-methods"] || "";
    expect(allowMethods.toUpperCase()).toContain("POST");
  });

  test("proxied FE login endpoint does not return routing mismatch", async ({ request }) => {
    const response = await request.post(`${FE_BASE}/api/auth/login/`, {
      data: credentials,
      headers: { Origin: FE_BASE },
    });

    expect([404, 405]).not.toContain(response.status());
    expect([200, 400, 401]).toContain(response.status());
  });
});

test.describe("Backend API Contract", () => {
  test("backend docs endpoint is reachable", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/docs/`);
    expect(response.status()).toBe(200);
  });

  test("login endpoint method contract is correct", async ({ request }) => {
    const response = await request.fetch(`${API_URL}/api/auth/login/`, { method: "OPTIONS" });
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);
    const allow = (response.headers()["allow"] || "").toUpperCase();
    expect(allow).toContain("POST");
  });

  test("core list endpoints require auth but do not crash", async ({ request }) => {
    const endpoints = ["rooms", "tenants", "contracts", "bills"];
    for (const endpoint of endpoints) {
      const response = await request.get(`${API_URL}/api/${endpoint}/`);
      expect([200, 401, 403]).toContain(response.status());
      expect(response.status()).not.toBeGreaterThanOrEqual(500);
    }
  });
});
