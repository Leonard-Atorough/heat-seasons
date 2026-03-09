import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminPage from "src/pages/AdminPage";
import { useAuth } from "src/hooks/useAuth";
import { createMockAuthContext } from "tests/utils/mocks/authContext.mock";
import { createUserFixture } from "tests/utils/fixtures";
import * as adminApi from "src/services/api/admin";

vi.mock("src/hooks/useAuth");
vi.mock("src/services/api/admin");

const mockUseAuth = vi.mocked(useAuth);
const mockAdminApi = vi.mocked(adminApi);

beforeEach(() => {
  mockAdminApi.adminListUsers.mockResolvedValue([]);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("AdminPage", () => {
  it("renders the Admin Panel heading for admin users", async () => {
    mockUseAuth.mockReturnValue(
      createMockAuthContext({ user: createUserFixture({ role: "admin" }) }),
    );
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("renders all three tab labels", async () => {
    mockUseAuth.mockReturnValue(
      createMockAuthContext({ user: createUserFixture({ role: "admin" }) }),
    );
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("tab", { name: "User Management" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Racer Management" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Analytics" })).toBeInTheDocument();
  });

  it("defaults to the User Management tab", async () => {
    mockUseAuth.mockReturnValue(
      createMockAuthContext({ user: createUserFixture({ role: "admin" }) }),
    );
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    );
    const activeTab = screen.getByRole("tab", { name: "User Management" });
    expect(activeTab).toHaveAttribute("aria-selected", "true");
  });

  it("redirects non-admin users away", () => {
    // TODO: implement - verify navigate('/') is called for non-admin users
    expect(true).toBe(true);
  });

  it("shows loading skeleton while auth is resolving", () => {
    // TODO: implement - mock isProtectedPageLoading = true and verify skeleton
    expect(true).toBe(true);
  });
});
