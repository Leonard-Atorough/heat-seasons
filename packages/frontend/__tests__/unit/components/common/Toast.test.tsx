import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toast, ToastProps } from "src/components/common";

const defaultProps: ToastProps = {
  title: "Test Title",
  message: "Test message",
};

describe("Toast Component", () => {
  function getToastRoot() {
    const el = screen.getByText("Test message");
    let node: HTMLElement | null = el.closest("div");
    while (node && !(node.className.includes("toast") && !node.className.includes("__"))) {
      node = node.parentElement as HTMLElement | null;
    }
    return node;
  }
  it("renders the message text", () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders the title", () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("always applies the base toast class", () => {
    render(<Toast {...defaultProps} />);
    const toast = getToastRoot();
    expect(toast!.className).toContain("toast");
  });

  it("defaults to the info variant class when type is not provided", () => {
    render(<Toast {...defaultProps} />);
    const toast = getToastRoot();
    expect(toast!.className).toContain("info");
    expect(toast!.getAttribute("data-testid")).toBe("toast-root-informational");
  });

  it.each(["success", "error", "info", "warning"] as ToastProps["type"][])(
    'applies the "%s" type class',
    (type) => {
      render(<Toast title="t" message="Test message" type={type} />);
      const toast = getToastRoot();
      expect(toast!.className).toContain(type!);
      expect(toast!.getAttribute("data-testid")).toBe(`toast-root-informational`);
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

  it("renders actionable variant action when provided", () => {
    render(<Toast {...defaultProps} variant="actionable" action={<button>Retry</button>} />);

    const toast = getToastRoot();
    expect(toast?.getAttribute("data-testid")).toBe("toast-root-actionable");
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });
});
