import { test, expect } from "@playwright/test";

test.describe("Frontend Page Structure", () => {
  test("login page should have correct structure", async ({ page }) => {
    await page.goto("/login");

    // Check title
    await expect(page.locator("h1")).toContainText("Quản Lý Phòng Trọ");

    // Check form elements
    await expect(page.locator('input[placeholder="Nhập tên đăng nhập"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Nhập mật khẩu"]')).toBeVisible();
    await expect(page.locator('button:has-text("Đăng Nhập")')).toBeVisible();

    // Check register link
    await expect(page.locator("text=Đăng ký")).toBeVisible();
  });

  test("register page should have correct structure", async ({ page }) => {
    await page.goto("/register");

    // Check title
    await expect(page.locator("text=Đăng Ký Tài Khoản")).toBeVisible();

    // Check form elements
    await expect(page.locator('input[placeholder="Nhập tên đăng nhập"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Nhập họ và tên đầy đủ"]')).toBeVisible();
    await expect(page.locator('button:has-text("Đăng Ký")')).toBeVisible();
  });

  test("frontend should serve static files correctly", async ({ page }) => {
    await page.goto("/");

    // Should redirect to login
    await page.waitForURL(/login/);

    // Check that React is loaded
    const appRoot = page.locator("#root");
    await expect(appRoot).toBeVisible();
  });
});

test.describe("Navigation Structure", () => {
  test("login page should have correct form validation", async ({ page }) => {
    await page.goto("/login");

    // Submit empty form
    await page.click('button:has-text("Đăng Nhập")');

    // Form should not navigate away (HTML5 validation)
    await expect(page).toHaveURL(/login/);
  });

  test("should navigate between login and register", async ({ page }) => {
    await page.goto("/login");
    await page.click("a:has-text('Đăng ký')");
    await expect(page).toHaveURL(/register/);

    await page.click("a:has-text('Đăng nhập')");
    await expect(page).toHaveURL(/login/);
  });
});
