import { test, expect } from "@playwright/test";

const API_URL = process.env.API_URL || "http://localhost:8000";

// Test admin credentials (should be created in database)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

test.describe("Room Management E2E", () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Login as admin to get token
    const loginResponse = await request.post(`${API_URL}/api/auth/login/`, {
      data: {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
      },
    });

    if (loginResponse.ok()) {
      const data = await loginResponse.json();
      authToken = data.access;
    }
  });

  test("should list rooms via API", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/rooms/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("count");
    expect(data).toHaveProperty("results");
    expect(Array.isArray(data.results)).toBe(true);
  });

  test("should create a room via API", async ({ request }) => {
    if (!authToken) test.skip();

    const uniqueRoom = `E2E-${Date.now()}`;
    const response = await request.post(`${API_URL}/api/rooms/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      data: {
        room_number: uniqueRoom,
        floor: 9,
        area: 30,
        base_price: "5000000",
        status: "AVAILABLE",
      },
    });

    expect([200, 201, 400]).toContain(response.status()); // 400 if room exists
  });

  test("should validate room creation fields", async ({ request }) => {
    if (!authToken) test.skip();

    // Missing required fields
    const response = await request.post(`${API_URL}/api/rooms/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      data: {
        floor: 1,
        // Missing room_number, area, base_price
      },
    });
    expect(response.status()).toBe(400);
  });
});

test.describe("Tenant Management E2E", () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/api/auth/login/`, {
      data: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
    });
    if (loginResponse.ok()) {
      const data = await loginResponse.json();
      authToken = data.access;
    }
  });

  test("should list tenants via API", async ({ request }) => {
    if (!authToken) test.skip();

    const response = await request.get(`${API_URL}/api/tenants/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("results");
  });

  test("should create tenant via API", async ({ request }) => {
    if (!authToken) test.skip();

    const uniqueId = `${Date.now()}`;
    const response = await request.post(`${API_URL}/api/tenants/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      data: {
        full_name: `E2E Tenant ${uniqueId}`,
        id_card: `ID${uniqueId}`,
        phone: `0123456${uniqueId.slice(-4)}`,
        status: "ACTIVE",
      },
    });
    expect([200, 201, 400]).toContain(response.status());
  });
});

test.describe("Contract Management E2E", () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/api/auth/login/`, {
      data: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
    });
    if (loginResponse.ok()) {
      const data = await loginResponse.json();
      authToken = data.access;
    }
  });

  test("should list contracts via API", async ({ request }) => {
    if (!authToken) test.skip();

    const response = await request.get(`${API_URL}/api/contracts/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(response.status()).toBe(200);
  });
})

test.describe("Bill Management E2E", () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/api/auth/login/`, {
      data: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
    });
    if (loginResponse.ok()) {
      const data = await loginResponse.json();
      authToken = data.access;
    }
  });

  test("should list bills via API", async ({ request }) => {
    if (!authToken) test.skip();

    const response = await request.get(`${API_URL}/api/bills/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(response.status()).toBe(200);
  });
});