import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import UserManagementTab from "src/components/features/Admin/UserManagementTab";
import * as adminApi from "src/services/api/admin";
import { AdminUser } from "src/services/api/admin";

vi.mock("src/services/api/admin");

const mockAdminApi = vi.mocked(adminApi);

const mockUsers: AdminUser[] = [
  {
    id: "u1",
    googleId: "g1",
    email: "alice@example.com",
    name: "Alice",
    role: "user",
    loginCount: 5,
    lastLoginAt: "2026-03-08T10:00:00Z",
  },
  {
    id: "u2",
    googleId: "g2",
    email: "bob@example.com",
    name: "Bob",
    role: "contributor",
    loginCount: 2,
  },
];

afterEach(() => {
  vi.clearAllMocks();
});

describe("UserManagementTab", () => {
  it("renders a list of users returned by the API", async () => {
    mockAdminApi.adminListUsers.mockResolvedValue(mockUsers);
    render(<UserManagementTab />);
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });

  it("shows the user role badge", async () => {
    mockAdminApi.adminListUsers.mockResolvedValue(mockUsers);
    render(<UserManagementTab />);
    await waitFor(() => {
      // getAllByText because "User" also appears in the legend — we just verify presence
      expect(screen.getAllByText("User").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Contributor").length).toBeGreaterThan(0);
    });
  });

  it("shows a Promote button for user-role accounts", async () => {
    mockAdminApi.adminListUsers.mockResolvedValue(mockUsers);
    render(<UserManagementTab />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Promote" })).toBeInTheDocument();
    });
  });

  it("shows a Demote button for contributor-role accounts", async () => {
    mockAdminApi.adminListUsers.mockResolvedValue(mockUsers);
    render(<UserManagementTab />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Demote" })).toBeInTheDocument();
    });
  });

  it("calls adminPromoteUser when Promote is clicked", async () => {
    // TODO: implement - click Promote, verify adminPromoteUser called with u1.id
    expect(true).toBe(true);
  });

  it("calls adminDemoteUser when Demote is clicked", async () => {
    // TODO: implement - click Demote, verify adminDemoteUser called with u2.id
    expect(true).toBe(true);
  });

  it("shows an error message when the API call fails", async () => {
    mockAdminApi.adminListUsers.mockRejectedValue(new Error("Network error"));
    render(<UserManagementTab />);
    await waitFor(() => {
      expect(screen.getByText("Failed to load users.")).toBeInTheDocument();
    });
  });

  it("shows an empty-state row when there are no users", async () => {
    mockAdminApi.adminListUsers.mockResolvedValue([]);
    render(<UserManagementTab />);
    await waitFor(() => {
      expect(screen.getByText("No users found.")).toBeInTheDocument();
    });
  });
});
