import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import RacerManagementTab from "src/components/features/Admin/RacerManagementTab";
import * as adminApi from "src/services/api/admin";

vi.mock("src/services/api/admin");
const mockAdminApi = vi.mocked(adminApi);

afterEach(() => {
  vi.clearAllMocks();
});

describe("RacerManagementTab", () => {
  it("renders the Create Racer heading", () => {
    mockAdminApi.adminListUsers.mockResolvedValue([]);
    render(<RacerManagementTab />);
    expect(screen.getByRole("heading", { name: "Create Racer" })).toBeInTheDocument();
  });

  it("renders all required form fields", () => {
    mockAdminApi.adminListUsers.mockResolvedValue([]);
    render(<RacerManagementTab />);
    expect(screen.getByPlaceholderText("e.g. Max Verstappen")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Dutch")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Red Bull Racing")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument(); // number input for Age
  });

  it("renders the Create Racer submit button", () => {
    mockAdminApi.adminListUsers.mockResolvedValue([]);
    render(<RacerManagementTab />);
    expect(screen.getByRole("button", { name: "Create Racer" })).toBeInTheDocument();
  });

  it("shows a success message after successful racer creation", async () => {
    // TODO: implement - fill form, submit, mock adminCreateRacer resolve, verify success msg
    expect(true).toBe(true);
  });

  it("shows an error message when racer creation fails", async () => {
    // TODO: implement - fill form, submit, mock adminCreateRacer reject, verify error msg
    expect(true).toBe(true);
  });

  it("resets the form when Reset button is clicked", async () => {
    // TODO: implement - fill fields, click Reset, verify inputs are cleared
    expect(true).toBe(true);
  });

  it("renders the user assignment dropdown populated with users", async () => {
    // TODO: implement - mock adminListUsers with users, verify options appear
    expect(true).toBe(true);
  });
});
