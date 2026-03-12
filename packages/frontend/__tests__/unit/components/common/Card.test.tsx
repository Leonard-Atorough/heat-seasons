import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Card, CardProps } from "src/components/common";

const defaultProps: CardProps = {
  children: "Test Card",
};

describe("Card Component", () => {

  let onClick: typeof defaultProps.onClick;

  beforeEach(() => {
    onClick = vi.fn();
  });

  it("renders a card with default props", () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText("Test Card")).toBeInTheDocument();
  });

  it("renders a card with custom className and style", () => {
    render(<Card {...defaultProps} className="custom-card" style={{ backgroundColor: "red" }} />);
    const card = screen.getByText("Test Card");
    expect(card).toHaveClass("custom-card");
    expect(card.style.backgroundColor).toBe("red");
  });

  it("renders a card with the compact variant", () => {
    render(<Card {...defaultProps} variant="compact" />);
    expect(screen.getByText("Test Card")).toBeInTheDocument();
  });

  it("calls onClick handler when card is clicked", async () => {
    render(<Card {...defaultProps} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick handler when Enter key is pressed", async () => {
    render(<Card {...defaultProps} onClick={onClick} />);
    screen.getByRole("button").focus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not have button role when onClick is not provided", () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText("Test Card")).not.toHaveAttribute("role", "button");
  });
});
