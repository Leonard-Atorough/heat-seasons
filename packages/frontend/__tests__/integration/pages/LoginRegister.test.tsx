import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LoginRegister from "src/pages/LoginRegister";
import { useAuth } from "src/hooks/useAuth";
import { createUseAuthMock } from "tests/utils/mocks/useAuth.mock";

vi.mock("src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("Given the LoginRegister page", () => {
  describe("When handling authentication", () => {
    // 1. Renders login form when user is not authenticated
    // 2. Redirects to profile page when user is authenticated

    it("renders the auth form when unauthenticated", () => {
      mockedUseAuth.mockReturnValue(
        createUseAuthMock({
          isAuthenticated: false,
          user: null,
        }),
      );

      render(
        <MemoryRouter
          initialEntries={["/login"]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/login" element={<LoginRegister />} />
            <Route path="/profile" element={<div>Profile Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText(/sign-in to your account/i)).toBeInTheDocument();
      expect(screen.queryByText("Profile Page")).not.toBeInTheDocument();
    });

    it("redirects to profile when authenticated", async () => {
      mockedUseAuth.mockReturnValue(
        createUseAuthMock({
          isAuthenticated: true,
        }),
      );

      render(
        <MemoryRouter
          initialEntries={["/login"]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/login" element={<LoginRegister />} />
            <Route path="/profile" element={<div>Profile Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(await screen.findByText("Profile Page")).toBeInTheDocument();
    });
  });
});
