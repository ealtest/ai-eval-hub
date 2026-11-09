import { expect, test } from "@playwright/test";

test("validates structured JSON through the server API", async ({ page }) => {
  await page.goto("/playground");
  await page.getByRole("button", { name: /JSON Schema validation/ }).click();
  await page.locator("textarea").nth(0).fill('{"id":42,"status":"open"}');
  await page.getByRole("button", { name: "Run evaluation" }).click();
  await expect(page.getByText("Passed", { exact: true })).toBeVisible();
  await expect(page.getByText("Schema compliance")).toBeVisible();
});

test("runs AST-based Python static analysis", async ({ page }) => {
  await page.goto("/playground");
  await page.getByRole("button", { name: /Python static security scan/ }).click();
  await page.locator("textarea").nth(0).fill("value = eval(user_input)");
  await page.getByRole("button", { name: "Run evaluation" }).click();
  await expect(page.getByText(/eval\(\)/)).toBeVisible();
});

test("scans adversarial prompt patterns", async ({ page }) => {
  await page.goto("/red-teaming");
  await page.getByRole("button", { name: "Credential harvesting" }).click();
  await page.getByRole("button", { name: "Scan payload" }).click();
  await expect(page.getByText("high-risk", { exact: true })).toBeVisible();
  await expect(page.getByText("Credential harvesting", { exact: true }).last()).toBeVisible();
});
