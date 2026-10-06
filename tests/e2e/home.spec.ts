import { expect, test } from "@playwright/test";

test("creates and structures a scenario", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("TRPG Scenario Workspace")).toBeVisible();
  const workspace = page.locator("main > div");
  const initialWorkspaceBox = await workspace.boundingBox();

  await page.getByRole("textbox", { name: "시나리오 제목" }).fill("첫 모험");
  await page
    .getByRole("textbox", { name: "시나리오 원문" })
    .fill("낡은 문이 열린다. 조사자가 안으로 들어간다.");
  await page.getByRole("button", { name: "구조화" }).click();

  await expect(page.getByText("2 lines")).toBeVisible();
  const firstLine = page.getByRole("textbox", { name: /1번 ScriptLine/ });
  await firstLine.fill("수정된 첫 줄");
  await page
    .getByRole("combobox", { name: "1번 ScriptLine 태그" })
    .selectOption("dialogue");
  await page.getByRole("button", { name: "태그 색상 설정" }).click();
  const tagColorDialog = page.getByRole("dialog", { name: "태그 색상 설정" });
  await tagColorDialog.getByLabel("대사 태그 색상").fill("#e04f8a");
  await tagColorDialog.getByRole("button", { name: "완료" }).click();
  await firstLine.press("End");
  await firstLine.press("Enter");

  await expect(page.getByText("3 lines")).toBeVisible();
  await page
    .getByRole("textbox", { name: /2번 ScriptLine/ })
    .fill("Enter로 분리한 줄");

  await page
    .getByRole("button", { name: "2번 줄 뒤에 새 ScriptLine 추가" })
    .click();
  await expect(page.getByText("4 lines")).toBeVisible();
  await page
    .getByRole("textbox", { name: /3번 ScriptLine/ })
    .fill("중간에 추가한 줄");

  await page.getByRole("button", { name: "4번 ScriptLine 삭제" }).click();
  const deleteDialog = page.getByRole("dialog", { name: "ScriptLine 삭제" });
  await expect(deleteDialog).toBeVisible();
  await expect(deleteDialog).toContainText("조사자가 안으로 들어간다.");
  await deleteDialog.getByRole("button", { name: "삭제" }).click();
  await expect(page.getByText("3 lines")).toBeVisible();
  const editedWorkspaceBox = await workspace.boundingBox();
  expect(editedWorkspaceBox?.width).toBe(initialWorkspaceBox?.width);
  await expect(page.getByRole("status")).toContainText("저장됨");

  await page.reload();

  await expect(
    page.getByRole("textbox", { name: "시나리오 제목" }),
  ).toHaveValue("첫 모험");
  await expect(
    page
      .getByRole("list", { name: "구조화된 ScriptLine 목록" })
      .getByRole("textbox", { name: /3번 ScriptLine/ }),
  ).toHaveValue("중간에 추가한 줄");
  await expect(
    page.getByRole("combobox", { name: "1번 ScriptLine 태그" }),
  ).toHaveValue("dialogue");
  await page.getByRole("button", { name: "태그 색상 설정" }).click();
  await expect(
    page
      .getByRole("dialog", { name: "태그 색상 설정" })
      .getByLabel("대사 태그 색상"),
  ).toHaveValue("#e04f8a");
});
