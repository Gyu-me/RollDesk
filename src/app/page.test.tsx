import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("renders the scenario workspace", async () => {
    render(<Home />);

    expect(screen.getByText("TRPG Scenario Workspace")).toBeInTheDocument();
    expect(
      await screen.findByRole("textbox", { name: "시나리오 제목" }),
    ).toHaveValue("제목 없는 시나리오");
    expect(
      screen.getByRole("button", { name: "새 시나리오 만들기" }),
    ).toBeInTheDocument();
  });
});
