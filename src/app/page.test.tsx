import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("introduces the RollDesk development workspace", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "TRPG Scenario Workspace" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Initial Setup")).toBeInTheDocument();
  });
});
