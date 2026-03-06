/*
Test cases:
1. Renders the "Sign-in to your account" heading
2. Renders the Google login button
3. Calls auth.loginWithGoogle when the Google login button is clicked
*/

import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "src/components/features/Auth";
import { createUseAuthMock } from "tests/utils/mocks/useAuth.mock";

vi.mock("src/hooks/useAuth");
import { useAuth } from "src/hooks/useAuth";
const mockedUseAuth = vi.mocked(useAuth);

beforeEach(() => {
  mockedUseAuth.mockReturnValue(createUseAuthMock());
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("AuthForm", () => {
  it("renders the 'Sign-in to your account' heading", () => {
    render(<AuthForm />);
    expect(screen.getByText(/sign-in to your account/i)).toBeInTheDocument();
  });

  it("renders the Google login button", () => {
    render(<AuthForm />);
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getAllByText(/sign in with google/i).length).toBeGreaterThanOrEqual(1);
  });

  it("calls loginWithGoogle when the Google login button is clicked", async () => {
    const loginWithGoogle = vi.fn();
    mockedUseAuth.mockReturnValue(createUseAuthMock({ loginWithGoogle }));
    const user = userEvent.setup();
    render(<AuthForm />);
    await user.click(screen.getByRole("button"));
    expect(loginWithGoogle).toHaveBeenCalledTimes(1);
  });
});
