import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tabs from "src/components/common/Tabs";

const tabs = [
  { id: "a", label: "Tab A" },
  { id: "b", label: "Tab B" },
  { id: "c", label: "Tab C" },
];

describe("Tabs Component", () => {
  it("renders all tab labels", () => {
    render(<Tabs tabs={tabs} activeTab="a" onTabChange={vi.fn()} />);
    expect(screen.getByText("Tab A")).toBeInTheDocument();
    expect(screen.getByText("Tab B")).toBeInTheDocument();
    expect(screen.getByText("Tab C")).toBeInTheDocument();
  });

  it("marks the active tab with aria-selected=true", () => {
    render(<Tabs tabs={tabs} activeTab="b" onTabChange={vi.fn()} />);
    const activeBtn = screen.getByRole("tab", { name: "Tab B" });
    expect(activeBtn).toHaveAttribute("aria-selected", "true");
  });

  it("marks inactive tabs with aria-selected=false", () => {
    render(<Tabs tabs={tabs} activeTab="b" onTabChange={vi.fn()} />);
    const inactiveBtn = screen.getByRole("tab", { name: "Tab A" });
    expect(inactiveBtn).toHaveAttribute("aria-selected", "false");
  });

  it("calls onTabChange with the clicked tab id", async () => {
    const onTabChange = vi.fn();
    render(<Tabs tabs={tabs} activeTab="a" onTabChange={onTabChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Tab C" }));
    expect(onTabChange).toHaveBeenCalledWith("c");
  });

  it("renders a tablist role", () => {
    render(<Tabs tabs={tabs} activeTab="a" onTabChange={vi.fn()} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });
});
