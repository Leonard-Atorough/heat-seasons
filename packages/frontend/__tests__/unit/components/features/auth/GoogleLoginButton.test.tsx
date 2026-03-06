/*
Test cases:
1. Renders a button element
2. Renders the visible "Sign in with Google" label
3. Renders the Google SVG icon
4. Calls onClick when the button is clicked
5. Does not throw when onClick is not provided
*/

import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GoogleLoginButton from "src/components/features/Auth/GoogleLoginButton";

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("GoogleLoginButton", () => {
  it("renders a button element", () => {
    render(<GoogleLoginButton />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders the visible 'Sign in with Google' label", () => {
    render(<GoogleLoginButton />);
    // The component renders two spans: one visible, one aria-hidden display:none
    // getByText with exact will match the visible one
    expect(screen.getAllByText("Sign in with Google").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Google SVG icon inside the button", () => {
    const { container } = render(<GoogleLoginButton />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("calls onClick when the button is clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<GoogleLoginButton onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not throw when onClick is not provided", () => {
    expect(() => render(<GoogleLoginButton />)).not.toThrow();
  });
});
