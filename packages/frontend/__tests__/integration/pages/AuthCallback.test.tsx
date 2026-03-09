import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AuthCallback from "src/pages/AuthCallback";
import { useAuth } from "src/hooks/useAuth";
import { createMockAuthContext } from "tests/utils/mocks/authContext.mock";

vi.mock("src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
  window.history.pushState({}, "", "/");
});

describe("Given the AuthCallback page", () => {
  describe("When handling OAuth callback", () => {
    // 1. Redirects to login with query error when OAuth callback has an error param
    // 2. Redirects to dashboard when auth is loaded and user is authenticated
    // 3. Redirects to login auth_failed when auth is loaded and user is unauthenticated
    // 4. Shows loading message while auth is still loading and does not redirect

    it("redirects to login with provider error when URL contains error query", async () => {
      mockedUseAuth.mockReturnValue(
        createMockAuthContext({
          isLoading: false,
          isAuthenticated: false,
        }),
      );

      window.history.pushState({}, "", "/auth/callback?error=access_denied");

      render(
        <MemoryRouter
          initialEntries={["/auth/callback?error=access_denied"]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(await screen.findByText("Login Page")).toBeInTheDocument();
    });

    it("redirects to dashboard when auth is loaded and authenticated", async () => {
      mockedUseAuth.mockReturnValue(
        createMockAuthContext({
          isLoading: false,
          isAuthenticated: true,
        }),
      );

      window.history.pushState({}, "", "/auth/callback");

      render(
        <MemoryRouter
          initialEntries={["/auth/callback"]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={<div>Dashboard Page</div>} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
    });

    it("redirects to login with auth_failed when auth is loaded and unauthenticated", async () => {
      mockedUseAuth.mockReturnValue(
        createMockAuthContext({
          isLoading: false,
          isAuthenticated: false,
        }),
      );

      window.history.pushState({}, "", "/auth/callback");

      render(
        <MemoryRouter
          initialEntries={["/auth/callback"]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(await screen.findByText("Login Page")).toBeInTheDocument();
    });

    it("shows authenticating message while auth is loading", () => {
      mockedUseAuth.mockReturnValue(
        createMockAuthContext({
          isLoading: true,
          isAuthenticated: false,
        }),
      );

      window.history.pushState({}, "", "/auth/callback");

      render(
        <MemoryRouter
          initialEntries={["/auth/callback"]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/" element={<div>Dashboard Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Authenticating...")).toBeInTheDocument();
      expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
      expect(screen.queryByText("Dashboard Page")).not.toBeInTheDocument();
    });
  });
});
