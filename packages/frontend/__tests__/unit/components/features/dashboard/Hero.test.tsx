/*
HERO TEST PLAN:

- Renders the title with "Season" suffix
- Renders subtitle when provided
- Does not render subtitle when omitted
- Shows "Sign In" button when user is not authenticated
- Hides "Sign In" button when user is authenticated
- "View Standings" button navigates to /results
- "Sign In" button navigates to /login

TEST CASES:
1. Renders title with "Season" suffix
2. Renders subtitle when provided
3. Does not render subtitle when not provided
4. Shows Sign In button when unauthenticated
5. Hides Sign In button when authenticated
6. Navigates to /results when View Standings is clicked
7. Navigates to /login when Sign In is clicked
*/

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { createUseAuthMock } from "../../../../utils/mocks/useAuth.mock";
import Hero, { HeroProps } from "@src/components/features/Dashboard/Hero";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual<typeof import("react-router-dom")>("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

vi.mock("@src/hooks/useAuth");
import { useAuth } from "@src/hooks/useAuth";
const mockedUseAuth = vi.mocked(useAuth);

const defaultProps: HeroProps = {
  title: "Summer",
  subtitle: "The heat is on",
  backgroundImage: undefined,
};

describe("Hero Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockedUseAuth.mockReturnValue(createUseAuthMock({ isAuthenticated: false }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title with 'Season' suffix", () => {
    render(<Hero {...defaultProps} />);
    expect(screen.getByText("Summer Season")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<Hero {...defaultProps} />);
    expect(screen.getByText("The heat is on")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    render(<Hero title="Summer" />);
    expect(screen.queryByText("The heat is on")).not.toBeInTheDocument();
  });

  it("shows Sign In button when user is not authenticated", () => {
    mockedUseAuth.mockReturnValue(createUseAuthMock({ isAuthenticated: false }));
    render(<Hero {...defaultProps} />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("hides Sign In button when user is authenticated", () => {
    mockedUseAuth.mockReturnValue(createUseAuthMock({ isAuthenticated: true }));
    render(<Hero {...defaultProps} />);
    expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
  });

  it("navigates to /results when View Standings is clicked", async () => {
    render(<Hero {...defaultProps} />);
    await userEvent.click(screen.getByText("View Standings"));
    expect(mockNavigate).toHaveBeenCalledWith("/results");
  });

  it("navigates to /login when Sign In is clicked", async () => {
    mockedUseAuth.mockReturnValue(createUseAuthMock({ isAuthenticated: false }));
    render(<Hero {...defaultProps} />);
    await userEvent.click(screen.getByText("Sign In"));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
