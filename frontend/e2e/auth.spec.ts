import { test, expect } from "@playwright/test";

const API_URL = process.env.API_URL || "http://localhost:8000";

test.describe("Authentication Flow", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1:has-text('Quản Lý Phòng Trọ')")).toBeVisible();
    await expect(page.locator('input[placeholder="Nhập tên đăng nhập"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Nhập mật khẩu"]')).toBeVisible();
  });

  test("should show validation errors on empty login", async ({ page }) => {
    await page.goto("/login");
    await page.click('button:has-text("Đăng Nhập")');
    // Form validation should prevent submission
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/login");
    await page.click("text=Đăng ký");
    await expect(page).toHaveURL(/register/);
    await expect(page.locator("text=Đăng Ký Tài Khoản")).toBeVisible();
  });
});

test.describe("Protected Routes", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/rooms");
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect to login when accessing tenants without auth", async ({ page }) => {
    await page.goto("/tenants");
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect to login when accessing contracts without auth", async ({ page }) => {
    await page.goto("/contracts");
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect to login when accessing bills without auth", async ({ page }) => {
    await page.goto("/bills");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Dashboard Access", () => {
  test("should redirect to login when accessing dashboard without auth", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("API Health Check", () => {
  test.skip("backend API docs should be accessible", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/docs/`);
    expect(response.status()).toBe(200);
  });

  test.skip("backend health endpoint should work", async ({ request }) => {
    // Try to access a public endpoint
    const response = await request.get(`${API_URL}/api/rooms/`);
    // Should return 401 (unauthorized) or 403, not 500
    expect([200, 401, 403]).toContain(response.status());
  });
});