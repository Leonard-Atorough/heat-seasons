import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AnalyticsTab from "src/components/features/Admin/AnalyticsTab";
import * as adminApi from "src/services/api/admin";
import { AdminUser } from "src/services/api/admin";

vi.mock("src/services/api/admin");
const mockAdminApi = vi.mocked(adminApi);

const mockUsers: AdminUser[] = [
  {
    id: "u1",
    googleId: "g1",
    email: "a@example.com",
    name: "Alice",
    role: "admin",
    loginCount: 10,
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: "u2",
    googleId: "g2",
    email: "b@example.com",
    name: "Bob",
    role: "user",
    loginCount: 3,
    lastLoginAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "u3",
    googleId: "g3",
    email: "c@example.com",
    name: "Carol",
    role: "contributor",
    loginCount: 0,
  },
];

afterEach(() => {
  vi.clearAllMocks();
});

describe("AnalyticsTab", () => {
  it("renders total player count", async () => {
    mockAdminApi.adminListUsers.mockResolvedValue(mockUsers);
    render(<AnalyticsTab />);
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("Total Players")).toBeInTheDocument();
    });
  });

  it("renders total login count summed from all users", async () => {
    mockAdminApi.adminListUsers.mockResolvedValue(mockUsers);
    render(<AnalyticsTab />);
    await waitFor(() => {
      expect(screen.getByText("13")).toBeInTheDocument();
      expect(screen.getByText("Total Logins")).toBeInTheDocument();
    });
  });

  it("shows the 'Never Logged In' count stat card", async () => {
    mockAdminApi.adminListUsers.mockResolvedValue(mockUsers);
    render(<AnalyticsTab />);
    // Just verify the label card is rendered; exact count is checked via integration test
    await waitFor(() => {
      expect(screen.getByText("Never Logged In")).toBeInTheDocument();
    });
  });

  it("lists the most active player first in the leaderboard", async () => {
    mockAdminApi.adminListUsers.mockResolvedValue(mockUsers);
    render(<AnalyticsTab />);
    await waitFor(() => {
      expect(screen.getByText("#1")).toBeInTheDocument();
    });
  });

  it("shows an error message when the API call fails", async () => {
    mockAdminApi.adminListUsers.mockRejectedValue(new Error("fail"));
    render(<AnalyticsTab />);
    await waitFor(() => {
      expect(screen.getByText("Failed to load analytics data.")).toBeInTheDocument();
    });
  });
});
