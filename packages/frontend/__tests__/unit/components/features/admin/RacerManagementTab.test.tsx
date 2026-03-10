import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RacerManagementTab from "src/components/features/Admin/RacerManagementTab";
import * as adminApi from "src/services/api/admin";
import { createRacerFixture } from "tests/utils/fixtures";

vi.mock("src/services/api/admin");
const mockAdminApi = vi.mocked(adminApi);

// ── Test setup ──────────────────────────────────────────────────────────
const createMockRacer = (overrides = {}) =>
  createRacerFixture(overrides) as unknown as adminApi.AdminCreateRacerInput & { id: string };

beforeEach(() => {
  mockAdminApi.adminListUsers.mockResolvedValue([]);
  mockAdminApi.adminListRacers.mockResolvedValue([]);
  mockAdminApi.adminCreateRacer.mockResolvedValue({
    ...createMockRacer(),
    joinDate: new Date(),
    active: true,
  });
  mockAdminApi.adminUpdateRacer.mockResolvedValue({
    ...createMockRacer(),
    joinDate: new Date(),
    active: true,
  });
  mockAdminApi.adminDeleteRacer.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("RacerManagementTab", () => {
  // ── Initialization & Data Fetching ─────────────────────────────────
  describe("Initialization", () => {
    it("fetches racers and users on mount", async () => {
      render(<RacerManagementTab />);
      await waitFor(() => {
        expect(mockAdminApi.adminListRacers).toHaveBeenCalledOnce();
        expect(mockAdminApi.adminListUsers).toHaveBeenCalledOnce();
      });
    });

    it("renders with RacerList and CreateRacerForm sections", () => {
      render(<RacerManagementTab />);
      expect(screen.getByRole("heading", { name: "All Racers" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Create Racer" })).toBeInTheDocument();
    });

    it("displays racer list error when fetch fails", async () => {
      mockAdminApi.adminListRacers.mockRejectedValue(new Error("Network error"));
      render(<RacerManagementTab />);
      await waitFor(() => {
        expect(screen.getByText("Failed to load racers.")).toBeInTheDocument();
      });
    });
  });

  // ── Create Racer Form ──────────────────────────────────────────────
  describe("Create Racer Form", () => {
    it("submits racer creation with valid form data", async () => {
      const user = userEvent.setup();
      const newRacer = createMockRacer({ name: "Carlos Sainz", nationality: "Spanish" });
      mockAdminApi.adminCreateRacer.mockResolvedValue({
        ...newRacer,
        joinDate: new Date(),
        active: true,
      });

      render(<RacerManagementTab />);

      const nameInput = screen.getByPlaceholderText("e.g. Max Verstappen");
      const nationalityInput = screen.getByPlaceholderText("e.g. Dutch");
      const teamInput = screen.getByPlaceholderText("e.g. Red Bull Racing");

      await user.clear(nameInput);
      await user.type(nameInput, "Carlos Sainz");
      await user.clear(nationalityInput);
      await user.type(nationalityInput, "Spanish");
      await user.clear(teamInput);
      await user.type(teamInput, "Ferrari");

      await user.click(screen.getByRole("button", { name: "Create Racer" }));

      await waitFor(() => {
        expect(mockAdminApi.adminCreateRacer).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Carlos Sainz",
            nationality: "Spanish",
            team: "Ferrari",
          }),
        );
      });
    });

    it("displays success message and resets form after creation", async () => {
      const user = userEvent.setup();
      mockAdminApi.adminCreateRacer.mockResolvedValue({
        ...createMockRacer({ name: "New Racer" }),
        joinDate: new Date(),
        active: true,
      });

      render(<RacerManagementTab />);

      const nameInput = screen.getByPlaceholderText("e.g. Max Verstappen") as HTMLInputElement;
      await user.clear(nameInput);
      await user.type(nameInput, "New Racer");
      await user.clear(screen.getByPlaceholderText("e.g. Dutch"));
      await user.type(screen.getByPlaceholderText("e.g. Dutch"), "Test");
      await user.clear(screen.getByPlaceholderText("e.g. Red Bull Racing"));
      await user.type(screen.getByPlaceholderText("e.g. Red Bull Racing"), "Test");

      await user.click(screen.getByRole("button", { name: "Create Racer" }));

      await waitFor(() => {
        expect(screen.getByText(/New Racer.*created successfully/)).toBeInTheDocument();
      });

      expect(nameInput.value).toBe("");
    });

    it("refetches racer list after successful creation", async () => {
      const user = userEvent.setup();
      mockAdminApi.adminCreateRacer.mockResolvedValue({
        ...createMockRacer(),
        joinDate: new Date(),
        active: true,
      });

      render(<RacerManagementTab />);

      const initialCallCount = mockAdminApi.adminListRacers.mock.calls.length;

      const nameInput = screen.getByPlaceholderText("e.g. Max Verstappen");
      await user.clear(nameInput);
      await user.type(nameInput, "Test");
      await user.clear(screen.getByPlaceholderText("e.g. Dutch"));
      await user.type(screen.getByPlaceholderText("e.g. Dutch"), "Test");
      await user.clear(screen.getByPlaceholderText("e.g. Red Bull Racing"));
      await user.type(screen.getByPlaceholderText("e.g. Red Bull Racing"), "Test");

      await user.click(screen.getByRole("button", { name: "Create Racer" }));

      await waitFor(() => {
        expect(mockAdminApi.adminListRacers.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });

    it("displays API error message on creation failure", async () => {
      const user = userEvent.setup();
      mockAdminApi.adminCreateRacer.mockRejectedValue(
        new Error("Racer with this name already exists"),
      );

      render(<RacerManagementTab />);

      const nameInput = screen.getByPlaceholderText("e.g. Max Verstappen");
      await user.clear(nameInput);
      await user.type(nameInput, "Duplicate");
      await user.clear(screen.getByPlaceholderText("e.g. Dutch"));
      await user.type(screen.getByPlaceholderText("e.g. Dutch"), "Test");
      await user.clear(screen.getByPlaceholderText("e.g. Red Bull Racing"));
      await user.type(screen.getByPlaceholderText("e.g. Red Bull Racing"), "Test");

      await user.click(screen.getByRole("button", { name: "Create Racer" }));

      await waitFor(() => {
        expect(screen.getByText("Racer with this name already exists")).toBeInTheDocument();
      });
    });

    it("clears field errors when user modifies input", async () => {
      const user = userEvent.setup();

      render(<RacerManagementTab />);

      const nameInput = screen.getByPlaceholderText("e.g. Max Verstappen") as HTMLInputElement;

      await user.clear(nameInput);
      await user.type(nameInput, "A");
      await user.clear(screen.getByPlaceholderText("e.g. Dutch"));
      await user.type(screen.getByPlaceholderText("e.g. Dutch"), "Test");
      await user.clear(screen.getByPlaceholderText("e.g. Red Bull Racing"));
      await user.type(screen.getByPlaceholderText("e.g. Red Bull Racing"), "Test");

      await user.click(screen.getByRole("button", { name: "Create Racer" }));

      await waitFor(() => {
        expect(screen.getByText("Name must be at least 2 characters.")).toBeInTheDocument();
      });

      await user.type(nameInput, "B");

      await waitFor(() => {
        expect(screen.queryByText("Name must be at least 2 characters.")).not.toBeInTheDocument();
      });
    });
  });

  // ── Edit Racer Modal ──────────────────────────────────────────────
  describe("Edit Racer Modal", () => {
    it("opens edit modal with racer data pre-filled", async () => {
      const user = userEvent.setup();
      const existingRacer = createRacerFixture({
        id: "racer-1",
        name: "Lewis Hamilton",
        nationality: "British",
      }) as unknown as adminApi.AdminCreateRacerInput & { id: string };

      mockAdminApi.adminListRacers.mockResolvedValue([existingRacer]);

      render(<RacerManagementTab />);
``
      await waitFor(() => {
        expect(screen.getByText("Lewis Hamilton")).toBeInTheDocument();
      });

      const editButton = screen.queryAllByRole("button", { name: "Edit" });
      if (editButton.length > 0) {
        await user.click(editButton[0]);
        await waitFor(() => {
          expect(
            screen.getByRole("heading", { name: /Edit "Lewis Hamilton"/i }),
          ).toBeInTheDocument();
        });
      }
    });

    it("submits racer update with modified form data", async () => {
      const user = userEvent.setup();
      const existingRacer = createRacerFixture({ id: "racer-1", name: "Lewis" });

      mockAdminApi.adminListRacers.mockResolvedValue([existingRacer]);

      render(<RacerManagementTab />);

      await waitFor(() => {
        expect(screen.getByText("Lewis")).toBeInTheDocument();
      });

      const editButton = screen.queryAllByRole("button", { name: "Edit" });
      if (editButton.length > 0) {
        await user.click(editButton[0]);

        await waitFor(() => {
          expect(screen.getByRole("heading", { name: /Edit/i })).toBeInTheDocument();
        });

        const saveButton = screen.getByRole("button", { name: "Save Changes" });
        await user.click(saveButton);

        await waitFor(() => {
          expect(mockAdminApi.adminUpdateRacer).toHaveBeenCalledWith("racer-1", expect.any(Object));
        });
      }
    });

    it("refetches racer list after successful update", async () => {
      const user = userEvent.setup();
      const existingRacer = createRacerFixture({ id: "racer-1" });

      mockAdminApi.adminListRacers.mockResolvedValue([existingRacer]);

      render(<RacerManagementTab />);

      await waitFor(() => {
        expect(mockAdminApi.adminListRacers).toHaveBeenCalled();
      });

      const initialCallCount = mockAdminApi.adminListRacers.mock.calls.length;

      const editButtons = screen.queryAllByRole("button", { name: "Edit" });
      if (editButtons.length > 0) {
        await user.click(editButtons[0]);

        await waitFor(() => {
          expect(screen.getByRole("heading", { name: /Edit/i })).toBeInTheDocument();
        });

        const saveButton = screen.getByRole("button", { name: "Save Changes" });
        await user.click(saveButton);

        await waitFor(() => {
          expect(mockAdminApi.adminListRacers.mock.calls.length).toBeGreaterThan(initialCallCount);
        });
      }
    });

    it("displays error message on update failure", async () => {
      const user = userEvent.setup();
      const existingRacer = createRacerFixture({ id: "racer-1" });

      mockAdminApi.adminListRacers.mockResolvedValue([existingRacer]);
      mockAdminApi.adminUpdateRacer.mockRejectedValue(new Error("Update failed"));

      render(<RacerManagementTab />);

      await waitFor(() => {
        expect(screen.getByText(existingRacer.name)).toBeInTheDocument();
      });

      const editButtons = screen.queryAllByRole("button", { name: "Edit" });
      if (editButtons.length > 0) {
        await user.click(editButtons[0]);

        await waitFor(() => {
          expect(screen.getByRole("heading", { name: /Edit/i })).toBeInTheDocument();
        });

        const saveButton = screen.getByRole("button", { name: "Save Changes" });
        await user.click(saveButton);

        await waitFor(() => {
          expect(screen.getByText("Update failed")).toBeInTheDocument();
        });
      }
    });

    it("closes modal when cancelling without saving", async () => {
      const user = userEvent.setup();
      const existingRacer = createRacerFixture({ id: "racer-1" });

      mockAdminApi.adminListRacers.mockResolvedValue([existingRacer]);

      render(<RacerManagementTab />);

      await waitFor(() => {
        expect(screen.getByText(existingRacer.name)).toBeInTheDocument();
      });

      const editButtons = screen.queryAllByRole("button", { name: "Edit" });
      if (editButtons.length > 0) {
        await user.click(editButtons[0]);

        await waitFor(() => {
          expect(screen.getByRole("heading", { name: /Edit/i })).toBeInTheDocument();
        });

        const cancelButtons = screen.queryAllByRole("button", { name: "Cancel" });
        const editCancelButton = cancelButtons[cancelButtons.length - 1];
        await user.click(editCancelButton);

        await waitFor(() => {
          expect(screen.queryByRole("heading", { name: /Edit/i })).not.toBeInTheDocument();
        });
      }
    });
  });

  // ── Delete Racer Modal ────────────────────────────────────────────
  describe("Delete Racer Modal", () => {
    it("opens delete modal with confirmation message", async () => {
      const user = userEvent.setup();
      const existingRacer = createRacerFixture({
        id: "racer-1",
        name: "Test Racer",
      });

      mockAdminApi.adminListRacers.mockResolvedValue([existingRacer]);

      render(<RacerManagementTab />);

      await waitFor(() => {
        expect(screen.getByText("Test Racer")).toBeInTheDocument();
      });

      const deleteButtons = screen.queryAllByRole("button", { name: "Delete" });
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);
        await waitFor(() => {
          expect(screen.getByText("Are you sure you want to delete")).toBeInTheDocument();
        });
      }
    });

    it("confirms deletion and refetches racer list", async () => {
      const user = userEvent.setup();
      const existingRacer = createRacerFixture({ id: "racer-1", name: "Test Racer" });

      mockAdminApi.adminListRacers.mockResolvedValue([existingRacer]);

      render(<RacerManagementTab />);

      await waitFor(() => {
        expect(screen.getByText("Test Racer")).toBeInTheDocument();
      });

      const initialCallCount = mockAdminApi.adminListRacers.mock.calls.length;

      const deleteButtons = screen.queryAllByRole("button", { name: "Delete" });
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByText("Are you sure you want to delete")).toBeInTheDocument();
        });

        const allDeleteButtons = screen.queryAllByRole("button", { name: "Delete" });
        const deleteConfirmButton = allDeleteButtons[allDeleteButtons.length - 1];
        await user.click(deleteConfirmButton);

        await waitFor(() => {
          expect(mockAdminApi.adminDeleteRacer).toHaveBeenCalledWith("racer-1");
          expect(mockAdminApi.adminListRacers.mock.calls.length).toBeGreaterThan(initialCallCount);
        });
      }
    });

    it("displays error message on deletion failure", async () => {
      const user = userEvent.setup();
      const existingRacer = createRacerFixture({ id: "racer-1", name: "Test Racer" });

      mockAdminApi.adminListRacers.mockResolvedValue([existingRacer]);
      mockAdminApi.adminDeleteRacer.mockRejectedValue(new Error("Cannot delete racer"));

      render(<RacerManagementTab />);

      await waitFor(() => {
        expect(screen.getByText("Test Racer")).toBeInTheDocument();
      });

      const deleteButtons = screen.queryAllByRole("button", { name: "Delete" });
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByText("Are you sure you want to delete")).toBeInTheDocument();
        });

        const allDeleteButtons = screen.queryAllByRole("button", { name: "Delete" });
        const deleteConfirmButton = allDeleteButtons[allDeleteButtons.length - 1];
        await user.click(deleteConfirmButton);

        await waitFor(() => {
          expect(screen.getByText("Cannot delete racer")).toBeInTheDocument();
        });
      }
    });

    it("closes modal when cancelling deletion", async () => {
      const user = userEvent.setup();
      const existingRacer = createRacerFixture({ id: "racer-1", name: "Test Racer" });

      mockAdminApi.adminListRacers.mockResolvedValue([existingRacer]);

      render(<RacerManagementTab />);

      await waitFor(() => {
        expect(screen.getByText("Test Racer")).toBeInTheDocument();
      });

      const deleteButtons = screen.queryAllByRole("button", { name: "Delete" });
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByText("Are you sure you want to delete")).toBeInTheDocument();
        });

        const cancelButtons = screen.queryAllByRole("button", { name: "Cancel" });
        await user.click(cancelButtons[cancelButtons.length - 1]);

        await waitFor(() => {
          expect(screen.queryByText("Are you sure you want to delete")).not.toBeInTheDocument();
        });
      }
    });
  });

  // ── Refresh Racer List ────────────────────────────────────────────
  describe("Refresh Racer List", () => {
    it("refetches racers when refresh button is clicked", async () => {
      const user = userEvent.setup();
      mockAdminApi.adminListRacers.mockResolvedValue([createRacerFixture({ id: "racer-1" })]);

      render(<RacerManagementTab />);

      await waitFor(() => {
        expect(mockAdminApi.adminListRacers).toHaveBeenCalled();
      });

      const initialCallCount = mockAdminApi.adminListRacers.mock.calls.length;

      const refreshButton = screen.getByRole("button", { name: "Refresh" });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockAdminApi.adminListRacers.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });
  });
});
