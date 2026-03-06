/*
TOAST TEST PLAN:

- Renders the message text
- Always applies the base `toast` CSS module class
- Defaults `type` to "info" when omitted
- Applies the correct type-specific class for each variant:
  success | error | info | warning
- Does not render a close button when onClose is not provided
- Renders a close button when onClose is provided
- Calls onClose when the close button is clicked

TEST CASES:
1. Renders the message
2. Applies base toast class regardless of type
3. Defaults to the "info" variant class when type is not provided
4. Applies each type-specific class (parameterised)
5. Does not render close button when onClose is omitted
6. Renders close button when onClose is provided
7. Calls onClose when close button is clicked
*/
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toast, ToastProps } from "src/components/common";

const defaultProps: ToastProps = {
  message: "Test message",
};

describe("Toast Component", () => {
  it("renders the message text", () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("always applies the base toast class", () => {
    render(<Toast {...defaultProps} />);
    const toast = screen.getByText("Test message").closest("div");
    expect(toast!.className).toContain("toast");
  });

  it("defaults to the info variant class when type is not provided", () => {
    render(<Toast {...defaultProps} />);
    const toast = screen.getByText("Test message").closest("div");
    expect(toast!.className).toContain("info");
  });

  it.each(["success", "error", "info", "warning"] as ToastProps["type"][])(
    'applies the "%s" type class',
    (type) => {
      render(<Toast message="Test message" type={type} />);
      const toast = screen.getByText("Test message").closest("div");
      expect(toast!.className).toContain(type!);
    },
  );

  // --- Close button ---

  it("does not render a close button when onClose is not provided", () => {
    render(<Toast {...defaultProps} />);
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });

  it("renders a close button when onClose is provided", () => {
    render(<Toast {...defaultProps} onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(<Toast {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
