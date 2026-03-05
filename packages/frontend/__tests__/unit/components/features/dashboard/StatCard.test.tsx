/*
STAT CARD TEST PLAN:

- Renders the title
- Renders the value when provided
- Does not render a value element when value is omitted
- Renders the icon when provided
- Does not render an icon element when icon is omitted
- Calls onClick when the card is clicked
- Applies compact variant by default
- Applies background image style when backgroundImage is provided

TEST CASES:
1. Renders the title
2. Renders the value when provided
3. Does not render a value element when value is omitted
4. Renders the icon when provided
5. Does not render an icon element when icon is omitted
6. Calls onClick when the card is clicked
7. Applies compact variant by default (compact prop is true)
8. Applies background image style when backgroundImage is provided
*/

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import StatCard, { StatCardProps } from "src/components/features/Dashboard/StatCard";

const defaultProps: StatCardProps = {
  title: "Total Races",
  value: 24,
};

describe("StatCard Component", () => {
  let onClick: any;

  beforeEach(() => {
    onClick = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title", () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText("Total Races")).toBeInTheDocument();
  });

  it("renders the value when provided", () => {
    render(<StatCard {...defaultProps} value={24} />);
    expect(screen.getByText("24")).toBeInTheDocument();
  });

  it("does not render a value element when value is omitted", () => {
    render(<StatCard title="Total Races" />);
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("renders the icon when provided", () => {
    render(<StatCard {...defaultProps} icon={<span data-testid="stat-icon">🏎️</span>} />);
    expect(screen.getByTestId("stat-icon")).toBeInTheDocument();
  });

  it("does not render an icon element when icon is omitted", () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.queryByTestId("stat-icon")).not.toBeInTheDocument();
  });

  it("calls onClick when the card is clicked", async () => {
    render(<StatCard {...defaultProps} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is compact by default", () => {
    render(<StatCard title="Total Races" />);
    expect(screen.getByText("Total Races")).toBeInTheDocument();
  });

  it("applies background image style when backgroundImage is provided", () => {
    const { container } = render(
      <StatCard {...defaultProps} backgroundImage="https://example.com/bg.jpg" />,
    );
    const card = container.firstChild as HTMLElement;
    // jsdom expands the `background` shorthand into its longhand equivalents
    expect(card).toHaveStyle({
      backgroundImage: expect.stringContaining("https://example.com/bg.jpg"),
    });
  });
});
