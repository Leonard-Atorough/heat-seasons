/*
FORM GROUP TESTS
- Renders label and children
- Applies custom className and style
- Associates label with input using htmlFor and id
- Renders input element when element prop is "input"
- Renders textarea element when element prop is "textarea"
- Calls onChange handler when input value changes
- Disables input when disabled prop is true

*/

import FormGroup, { FormGroupProps } from "@src/components/common/FormGroup";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const formGroupProps: FormGroupProps = {
  element: "input",
  type: "text",
  label: "Test Label",
  id: "test-input",
  placeholder: "Enter text",
  value: "",
  onChange: () => {},
  disabled: false,
  className: "",
  children: null,
};

describe("FormGroup Component", () => {
  let onChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onChange = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  it("renders label and children", () => {
    render(<FormGroup {...formGroupProps} />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<FormGroup {...formGroupProps} className="custom-class" />);
    const formGroup = screen.getByText("Test Label").parentElement;
    expect(formGroup?.className).toContain("custom-class");
  });

  it("associates label with input using htmlFor and id", () => {
    render(<FormGroup {...formGroupProps} />);
    const label = screen.getByText("Test Label");
    const input = screen.getByPlaceholderText("Enter text");
    expect(label).toHaveAttribute("for", "test-input");
    expect(input).toHaveAttribute("id", "test-input");
  });

  it("renders input element when element prop is 'input'", () => {
    render(<FormGroup {...formGroupProps} element="input" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders textarea element when element prop is 'textarea'", () => {
    render(<FormGroup {...formGroupProps} element="textarea" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("calls onChange handler when input value changes", async () => {
    const onChange = vi.fn();
    render(<FormGroup {...formGroupProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Enter text");
    input.focus();
    await userEvent.type(input, "Hello");
    expect(onChange).toHaveBeenCalledTimes(5); // "H", "e", "l", "l", "o"
  });

  it("disables input when disabled prop is true", () => {
    render(<FormGroup {...formGroupProps} disabled />);
    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toBeDisabled();
  });

  it("renders children when element prop is not 'input' or 'textarea'", () => {
    render(<FormGroup {...formGroupProps} element="div" children={<span>Child Element</span>} />);
    expect(screen.getByText("Child Element")).toBeInTheDocument();
  });
});
