import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { createMockAuthContext } from "tests/utils/mocks/authContext.mock";
import Hero, { HeroProps } from "src/components/features/Dashboard/Hero";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual<typeof import("react-router-dom")>("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

vi.mock("src/hooks/useAuth");
import { useAuth } from "src/hooks/useAuth";
const mockedUseAuth = vi.mocked(useAuth);

const defaultProps: HeroProps = {
  title: "Summer",
  subtitle: "The heat is on",
  backgroundImage: undefined,
};

describe("Hero Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockedUseAuth.mockReturnValue(createMockAuthContext({ isAuthenticated: false }));
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
    mockedUseAuth.mockReturnValue(createMockAuthContext({ isAuthenticated: false }));
    render(<Hero {...defaultProps} />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("hides Sign In button when user is authenticated", () => {
    mockedUseAuth.mockReturnValue(createMockAuthContext({ isAuthenticated: true }));
    render(<Hero {...defaultProps} />);
    expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
  });

  it("navigates to /results when View Standings is clicked", async () => {
    render(<Hero {...defaultProps} />);
    await userEvent.click(screen.getByText("View Standings"));
    expect(mockNavigate).toHaveBeenCalledWith("/results");
  });

  it("navigates to /login when Sign In is clicked", async () => {
    mockedUseAuth.mockReturnValue(createMockAuthContext({ isAuthenticated: false }));
    render(<Hero {...defaultProps} />);
    await userEvent.click(screen.getByText("Sign In"));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
