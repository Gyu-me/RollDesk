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

  await page.getByRole("button", { name: "템플릿" }).click();
  const macroDialog = page.getByRole("dialog", {
    name: "매크로 템플릿 보관함",
  });
  await expect(macroDialog.getByLabel("ScriptLine 내용")).toHaveValue(
    "수정된 첫 줄",
  );
  await expect(macroDialog.getByLabel("생성된 코드")).toHaveValue(
    /수정된 첫 줄/,
  );
  const narrationPreview = macroDialog.getByRole("img", {
    name: "나레이션 미리보기",
  });
  await expect(narrationPreview).toContainText("수정된 첫 줄");
  await macroDialog.getByLabel("글자색 색상 선택").fill("#ff0000");
  await expect(narrationPreview.locator("p")).toHaveCSS(
    "color",
    "rgb(255, 0, 0)",
  );
  await macroDialog.getByRole("button", { name: "사용자 템플릿 추가" }).click();
  await macroDialog.getByLabel("이름").fill("내 강조 템플릿");
  await macroDialog.getByLabel("설명").fill("직접 저장한 코드");
  await macroDialog.getByLabel("매크로 코드").fill("/desc [{{content}}]");
  await macroDialog.getByRole("button", { name: "저장" }).click();
  await expect(
    macroDialog.getByRole("heading", { name: "내 강조 템플릿" }),
  ).toBeVisible();
  await macroDialog
    .getByRole("button", { name: "매크로 템플릿 보관함 닫기" })
    .click();

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

  await page.getByRole("button", { name: "새 ScriptLine 추가" }).click();
  await expect(page.getByText("4 lines")).toBeVisible();
  await page
    .getByRole("textbox", { name: /4번 ScriptLine/ })
    .fill("중간에 추가한 줄");

  await page.getByRole("button", { name: "3번 ScriptLine 삭제" }).click();
  const deleteDialog = page.getByRole("dialog", { name: "ScriptLine 삭제" });
  await expect(deleteDialog).toBeVisible();
  await expect(deleteDialog).toContainText("조사자가 안으로 들어간다.");
  await deleteDialog.getByRole("button", { name: "삭제" }).click();
  await expect(page.getByText("3 lines")).toBeVisible();

  const thirdLineHandle = page.getByRole("button", {
    name: "3번 ScriptLine 순서 이동",
  });
  const secondLineHandle = page.getByRole("button", {
    name: "2번 ScriptLine 순서 이동",
  });
  const sourceBox = await thirdLineHandle.boundingBox();
  const targetBox = await secondLineHandle.boundingBox();
  if (!sourceBox || !targetBox) {
    throw new Error("ScriptLine 순서 이동 손잡이의 위치를 찾지 못했습니다.");
  }
  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height / 2,
    { steps: 10 },
  );
  await page.mouse.up();
  await expect(
    page.getByRole("textbox", { name: /2번 ScriptLine/ }),
  ).toHaveValue("중간에 추가한 줄");
  await expect(
    page.getByRole("textbox", { name: /3번 ScriptLine/ }),
  ).toHaveValue("Enter로 분리한 줄");

  const editedWorkspaceBox = await workspace.boundingBox();
  expect(editedWorkspaceBox?.width).toBe(initialWorkspaceBox?.width);
  await expect(page.locator("header").getByRole("status")).toContainText(
    "저장됨",
  );

  await page.reload();

  await expect(
    page.getByRole("textbox", { name: "시나리오 제목" }),
  ).toHaveValue("첫 모험");
  await expect(
    page
      .getByRole("list", { name: "구조화된 ScriptLine 목록" })
      .getByRole("textbox", { name: /3번 ScriptLine/ }),
  ).toHaveValue("Enter로 분리한 줄");
  await expect(
    page
      .getByRole("list", { name: "구조화된 ScriptLine 목록" })
      .getByRole("textbox", { name: /2번 ScriptLine/ }),
  ).toHaveValue("중간에 추가한 줄");
  await expect(
    page.getByRole("combobox", { name: "1번 ScriptLine 태그" }),
  ).toHaveValue("dialogue");
  await page.getByRole("button", { name: "템플릿" }).click();
  await expect(
    page
      .getByRole("dialog", { name: "매크로 템플릿 보관함" })
      .getByRole("button", { name: /내 강조 템플릿/ }),
  ).toBeVisible();
  await page
    .getByRole("dialog", { name: "매크로 템플릿 보관함" })
    .getByRole("button", { name: "매크로 템플릿 보관함 닫기" })
    .click();
  await page.getByRole("button", { name: "태그 색상 설정" }).click();
  await expect(
    page
      .getByRole("dialog", { name: "태그 색상 설정" })
      .getByLabel("대사 태그 색상"),
  ).toHaveValue("#e04f8a");

  const pageScrollSize = await page.evaluate(() => ({
    viewportHeight: window.innerHeight,
    documentHeight: document.documentElement.scrollHeight,
  }));
  expect(pageScrollSize.documentHeight).toBeLessThanOrEqual(
    pageScrollSize.viewportHeight,
  );
});
