import { expect, test } from "@playwright/test";

test("shows the RollDesk development shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "TRPG Scenario Workspace" }),
  ).toBeVisible();
  await expect(page.getByText("Initial Setup")).toBeVisible();
});
