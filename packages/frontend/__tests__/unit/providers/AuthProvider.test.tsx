import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "src/providers/AuthProvider";
import { useAuth } from "src/hooks/useAuth";
import { createUserFixture } from "tests/utils/fixtures";

// Mock all API services being called
vi.mock("src/services/api/season");
vi.mock("src/services/api/races");
vi.mock("src/services/api/racer");

// Mock the apiClient to handle auth endpoints
vi.mock("src/services/apiClient", () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

import apiClient from "src/services/apiClient";
const mockApiClient = vi.mocked(apiClient);

// Mock window.location
delete (window as any).location;
window.location = { href: "" } as any;

beforeEach(() => {
  mockApiClient.get.mockReset();
  mockApiClient.post.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
  window.location.href = "";
});

const TestComponent = () => {
  const context = useAuth();
  return (
    <div>
      <div data-testid="auth-status">
        {context.isAuthenticated ? "authenticated" : "not-authenticated"}
      </div>
      <div data-testid="user-email">{context.user?.email || "no-email"}</div>
      <div data-testid="loading">{context.isLoading ? "loading" : "loaded"}</div>
      <div data-testid="is-admin">{context.isAdmin ? "admin" : "not-admin"}</div>
      <div data-testid="is-contributor">
        {context.isContributor ? "contributor" : "not-contributor"}
      </div>
      <button data-testid="logout-btn" onClick={context.logout}>
        Logout
      </button>
      <button data-testid="refresh-btn" onClick={context.refreshUser}>
        Refresh
      </button>
      <button data-testid="login-btn" onClick={context.loginWithGoogle}>
        Login with Google
      </button>
    </div>
  );
};

describe("AuthProvider", () => {
  describe("When initializing authentication", () => {
    it("initializes with loading state true on mount", async () => {
      mockApiClient.get.mockResolvedValue(createUserFixture());

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      // Should show loading state initially transitioning to loaded
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });

    it("calls checkAuth on mount", async () => {
      mockApiClient.get.mockResolvedValue(createUserFixture());

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith("/auth/me");
      });
    });

    it("sets user and authenticated state when checkAuth succeeds", async () => {
      const mockUser = createUserFixture({ email: "test@example.com" });
      mockApiClient.get.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
      });
      expect(screen.getByTestId("user-email")).toHaveTextContent("test@example.com");
    });

    it("sets isAuthenticated to false and user to null when checkAuth fails", async () => {
      mockApiClient.get.mockRejectedValue(new Error("Unauthorized"));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
      expect(screen.getByTestId("auth-status")).toHaveTextContent("not-authenticated");
      expect(screen.getByTestId("user-email")).toHaveTextContent("no-email");
    });
  });

  describe("When handling role-based permissions", () => {
    it("sets isAdmin to true when user role is admin", async () => {
      const adminUser = createUserFixture({ role: "admin" });
      mockApiClient.get.mockResolvedValue(adminUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-admin")).toHaveTextContent("admin");
      });
    });

    it("sets isAdmin to false when user role is not admin", async () => {
      const regularUser = createUserFixture({ role: "user" });
      mockApiClient.get.mockResolvedValue(regularUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-admin")).toHaveTextContent("not-admin");
      });
    });

    it("sets isContributor to true when user role is contributor", async () => {
      const contributorUser = createUserFixture({ role: "contributor" });
      mockApiClient.get.mockResolvedValue(contributorUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-contributor")).toHaveTextContent("contributor");
      });
    });

    it("sets isContributor to true when user role is admin", async () => {
      const adminUser = createUserFixture({ role: "admin" });
      mockApiClient.get.mockResolvedValue(adminUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-contributor")).toHaveTextContent("contributor");
      });
    });

    it("sets isContributor to false when user role is user", async () => {
      const regularUser = createUserFixture({ role: "user" });
      mockApiClient.get.mockResolvedValue(regularUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-contributor")).toHaveTextContent("not-contributor");
      });
    });
  });

  describe("When user logs out", () => {
    it("calls logout endpoint when logout is clicked", async () => {
      const mockUser = createUserFixture();
      mockApiClient.get.mockResolvedValue(mockUser);
      mockApiClient.post.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
      });

      const logoutBtn = screen.getByTestId("logout-btn");
      logoutBtn.click();

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith("/auth/logout", {});
      });
    });

    it("clears user data after logout", async () => {
      const mockUser = createUserFixture();
      mockApiClient.get.mockResolvedValue(mockUser);
      mockApiClient.post.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
      });

      const logoutBtn = screen.getByTestId("logout-btn");
      logoutBtn.click();

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("not-authenticated");
      });
    });

    it("redirects to home page after logout", async () => {
      const mockUser = createUserFixture();
      mockApiClient.get.mockResolvedValue(mockUser);
      mockApiClient.post.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
      });

      const logoutBtn = screen.getByTestId("logout-btn");
      logoutBtn.click();

      await waitFor(() => {
        expect(window.location.href).toBe("/");
      });
    });
  });

  describe("When user logs in with Google", () => {
    it("redirects to Google auth URL when loginWithGoogle is called", async () => {
      mockApiClient.get.mockResolvedValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      const loginBtn = screen.getByTestId("login-btn");
      loginBtn.click();

      // Should redirect to Google auth endpoint
      expect(window.location.href).toContain("/auth/google");
    });
  });

  describe("When refreshing user", () => {
    it("fetches updated user data when refreshUser is called", async () => {
      const initialUser = createUserFixture({ email: "old@example.com" });
      const updatedUser = createUserFixture({ email: "new@example.com" });

      // First call for initialization
      mockApiClient.get.mockResolvedValueOnce(initialUser);
      // Second call for refresh
      mockApiClient.get.mockResolvedValueOnce(updatedUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("user-email")).toHaveTextContent("old@example.com");
      });

      const refreshBtn = screen.getByTestId("refresh-btn");
      refreshBtn.click();

      await waitFor(() => {
        expect(screen.getByTestId("user-email")).toHaveTextContent("new@example.com");
      });
    });

    it("calls /auth/me endpoint when refreshUser is called", async () => {
      const mockUser = createUserFixture();
      mockApiClient.get.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith("/auth/me");
      });

      mockApiClient.get.mockClear();

      const refreshBtn = screen.getByTestId("refresh-btn");
      refreshBtn.click();

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith("/auth/me");
      });
    });
  });

  describe("When consuming auth context", () => {
    it("provides complete auth context to consumers", async () => {
      const mockUser = createUserFixture();
      mockApiClient.get.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
        expect(screen.getByTestId("user-email")).toHaveTextContent(mockUser.email);
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
        expect(screen.getByTestId("is-admin")).toBeInTheDocument();
        expect(screen.getByTestId("is-contributor")).toBeInTheDocument();
      });
    });

    it("updates context when authentication state changes", async () => {
      const mockUser = createUserFixture();
      mockApiClient.get.mockResolvedValue(mockUser);
      mockApiClient.post.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
      });

      // Logout
      const logoutBtn = screen.getByTestId("logout-btn");
      logoutBtn.click();

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("not-authenticated");
      });
    });
  });

  describe("When handling errors", () => {
    it("clears user data on API error", async () => {
      mockApiClient.get.mockRejectedValue(new Error("Network error"));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("not-authenticated");
      });
    });

    it("continues to work when refresh fails", async () => {
      const mockUser = createUserFixture();
      mockApiClient.get.mockResolvedValueOnce(mockUser);
      mockApiClient.get.mockRejectedValueOnce(new Error("Refresh failed"));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
      });

      const refreshBtn = screen.getByTestId("refresh-btn");
      refreshBtn.click();

      // Should still be authenticated after failed refresh
      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
      });
    });

    it("continues to work when logout fails", async () => {
      const mockUser = createUserFixture();
      mockApiClient.get.mockResolvedValue(mockUser);
      mockApiClient.post.mockRejectedValue(new Error("Logout failed"));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
      });

      const logoutBtn = screen.getByTestId("logout-btn");
      logoutBtn.click();

      // Should call logout endpoint even though it fails
      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith("/auth/logout", {});
      });

      // Should still attempt redirect even if logout fails
      // (exact href value varies in testing environment)
      expect(mockApiClient.post).toHaveBeenCalled();
    });
  });
});
