import { Modal, ModalProps } from "src/components/common";
import { render, screen } from "@testing-library/react";

const modalProps: ModalProps = {
  isOpen: true,
  onClose: vi.fn(),
  title: "Test Modal",
  children: <div>Modal Content</div>,
};

describe("Modal Component", () => {
  let onClose: any;

  beforeEach(() => {
    onClose = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal with title and content when isOpen is true", () => {
    render(<Modal {...modalProps} onClose={onClose} />);
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("does not render modal when isOpen is false", () => {
    render(<Modal {...modalProps} isOpen={false} onClose={onClose} />);
    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
    expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();
  });

  it("calls onClose when overlay is clicked", async () => {
    render(<Modal {...modalProps} onClose={onClose} />);
    await screen.getByText("Test Modal").parentElement?.parentElement?.parentElement?.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", async () => {
    render(<Modal {...modalProps} onClose={onClose} />);
    await screen.getByText("×").click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when modal content is clicked", async () => {
    render(<Modal {...modalProps} onClose={onClose} />);
    await screen.getByText("Modal Content").click();
    expect(onClose).not.toHaveBeenCalled();
  });
});
