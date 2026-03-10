import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, ButtonProps } from "src/components/common";

const defaultProps: ButtonProps = {
  type: "button",
  variant: "primary",
  className: "",
  onClick: undefined,
  disabled: false,
  children: "Test Button",
};

describe("Button Component", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let onClick: typeof defaultProps.onClick;

  beforeEach(() => {
    onClick = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders a button with default props", () => {
    render(<Button {...defaultProps} />);
    expect(screen.getByText("Test Button")).toBeInTheDocument();
  });

  it("renders a button with custom className and style", () => {
    render(<Button {...defaultProps} className="custom-btn" />);
    const button = screen.getByText("Test Button");
    expect(button).toHaveClass("custom-btn");
  });

  it("renders a button with different variants", () => {
    const variants: ButtonProps["variant"][] = [
      "primary",
      "secondary",
      "tertiary",
      "danger",
      "link",
      "ghost",
    ];
    variants.forEach((variant) => {
      render(<Button {...defaultProps} variant={variant} />);
      const button = screen.getByText("Test Button");
      expect(button.className).toContain(`btn__${variant}`); // This probably won't work since we are using CSS modules, but we can at least check that the button is rendered
      cleanup();
    });
  });

  it("calls onClick handler when button is clicked", async () => {
    render(<Button {...defaultProps} onClick={onClick} />);
    await userEvent.click(screen.getByText("Test Button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick handler when button is disabled", async () => {
    render(<Button {...defaultProps} onClick={onClick} disabled />);
    await userEvent.click(screen.getByText("Test Button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onClick handler when Enter key is pressed", async () => {
    render(<Button {...defaultProps} onClick={onClick} />);
    screen.getByText("Test Button").focus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick handler when Space key is pressed", async () => {
    render(<Button {...defaultProps} onClick={onClick} />);
    screen.getByText("Test Button").focus();
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
