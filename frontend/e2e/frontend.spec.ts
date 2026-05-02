import { test, expect } from "@playwright/test";

test.describe("Frontend Structure and Runtime", () => {
  test("login page structure is intact", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Quản Lý Phòng Trọ");
    await expect(page.getByRole("textbox", { name: "Nhập tên đăng nhập" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Nhập mật khẩu" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Đăng Nhập" })).toBeVisible();
  });

  test("register navigation works", async ({ page }) => {
    await page.goto("/login");
    await page.click("a:has-text('Đăng ký')");
    await expect(page).toHaveURL(/register/);
    await expect(page.locator("text=Đăng Ký Tài Khoản")).toBeVisible();
  });

  test("no failed /api network requests on initial login render", async ({ page }) => {
    const failedApi: string[] = [];
    page.on("response", (resp) => {
      if (resp.url().includes("/api/") && resp.status() >= 500) {
        failedApi.push(`${resp.status()} ${resp.url()}`);
      }
    });

    await page.goto("/login");
    await page.waitForTimeout(1000);
    expect(failedApi).toEqual([]);
  });
});
