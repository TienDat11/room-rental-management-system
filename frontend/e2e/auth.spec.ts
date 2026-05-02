import { test, expect } from "@playwright/test";

const FE_BASE = process.env.BASE_URL || "http://localhost:5173";

const credentials = {
  username: process.env.E2E_USERNAME || "admin_test",
  password: process.env.E2E_PASSWORD || "Admin@123",
};

test.describe("@smoke Authentication Flow", () => {
  test("login page renders and form fields are visible", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1:has-text('Quản Lý Phòng Trọ')")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Nhập tên đăng nhập" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Nhập mật khẩu" })).toBeVisible();
  });

  test("protected routes redirect to login when unauthenticated", async ({ page }) => {
    for (const path of ["/", "/rooms", "/tenants", "/contracts", "/bills"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/login/);
    }
  });

  test("login call returns backend response (not Vercel route error)", async ({ page }) => {
    test.setTimeout(60000);

    await page.goto("/login");

    await page.getByRole("textbox", { name: "Nhập tên đăng nhập" }).fill(credentials.username);
    await page.getByRole("textbox", { name: "Nhập mật khẩu" }).fill(credentials.password);

    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) => resp.url().includes("/api/auth/login/") && resp.request().method() === "POST",
        { timeout: 60000 }
      ),
      page.getByRole("button", { name: "Đăng Nhập" }).click(),
    ]);

    expect([200, 400, 401]).toContain(response.status());
    expect([404, 405]).not.toContain(response.status());
  });

  test("no fatal runtime crash on login page", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    await page.goto(`${FE_BASE}/login`);
    await page.waitForTimeout(1200);

    expect(pageErrors).toEqual([]);
  });
});
