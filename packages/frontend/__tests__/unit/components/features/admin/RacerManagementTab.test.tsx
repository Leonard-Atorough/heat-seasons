import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AdminCreateRacerInput } from "src/models";
import type { Racer } from "shared";
import RacerManagementTab from "src/components/features/Admin/RacerManagementTab";
import * as adminApi from "src/services/api/admin";
import { createAdminRacerInput, createAdminUser, createRacer } from "tests/utils/fixtures";

vi.mock("src/services/api/admin");

const mockAdminApi = vi.mocked(adminApi);

const defaultCreateInput: AdminCreateRacerInput = createAdminRacerInput({
  name: "Carlos Sainz",
  team: "Ferrari",
  nationality: "Spanish",
  age: 30,
  teamColor: "#e63946",
  active: true,
  badgeUrl: undefined,
  userId: undefined,
});

function getExpectedPayload(input: AdminCreateRacerInput): AdminCreateRacerInput {
  return {
    name: input.name,
    team: input.team,
    teamColor: input.teamColor,
    nationality: input.nationality,
    age: input.age,
    active: input.active,
    // RHF submits empty-string for unfilled optional fields (no longer normalised to undefined)
    badgeUrl: input.badgeUrl ?? "",
    userId: input.userId ?? "",
  };
}

async function renderTab() {
  render(<RacerManagementTab />);

  await waitFor(() => {
    expect(mockAdminApi.adminListUsers).toHaveBeenCalledTimes(1);
    expect(mockAdminApi.adminListRacers).toHaveBeenCalledTimes(1);
  });
}

function getRacerRow(racerName: string): HTMLElement {
  const racerCell = screen.getByText(racerName);
  const racerRow = racerCell.closest("tr");

  if (!racerRow) {
    throw new Error(`Could not find table row for racer \"${racerName}\".`);
  }

  return racerRow;
}

async function fillCreateForm(
  user: ReturnType<typeof userEvent.setup>,
  input: AdminCreateRacerInput = defaultCreateInput,
) {
  const nameInput = screen.getByPlaceholderText("e.g. Max Verstappen");
  const nationalityInput = screen.getByPlaceholderText("e.g. Dutch");
  const teamInput = screen.getByPlaceholderText("e.g. Red Bull Racing");
  const ageInput = screen.getByRole("spinbutton", { name: /age/i });

  await user.clear(nameInput);
  await user.type(nameInput, input.name);
  await user.clear(nationalityInput);
  await user.type(nationalityInput, input.nationality);
  await user.clear(teamInput);
  await user.type(teamInput, input.team);
  await user.clear(ageInput);
  await user.type(ageInput, String(input.age));

  if (input.badgeUrl) {
    const badgeUrlInput = screen.getByPlaceholderText("https://...");
    await user.clear(badgeUrlInput);
    await user.type(badgeUrlInput, input.badgeUrl);
  }
}

async function openEditModal(user: ReturnType<typeof userEvent.setup>, racer: Racer) {
  const racerRow = getRacerRow(racer.name);
  await user.click(within(racerRow).getByRole("button", { name: "Edit" }));

  return await screen.findByRole("dialog");
}

async function openDeleteModal(user: ReturnType<typeof userEvent.setup>, racer: Racer) {
  const racerRow = getRacerRow(racer.name);
  await user.click(within(racerRow).getByRole("button", { name: "Delete" }));

  return await screen.findByRole("dialog");
}

function submitDialogForm(dialog: HTMLElement) {
  const form = dialog.querySelector("form");

  if (!(form instanceof HTMLFormElement)) {
    throw new Error("Expected the dialog to contain a form.");
  }

  fireEvent.submit(form);
}

beforeEach(() => {
  mockAdminApi.adminListUsers.mockResolvedValue([createAdminUser()]);
  mockAdminApi.adminListRacers.mockResolvedValue([]);
  mockAdminApi.adminCreateRacer.mockResolvedValue(createRacer(defaultCreateInput));
  mockAdminApi.adminUpdateRacer.mockResolvedValue(createRacer(defaultCreateInput));
  mockAdminApi.adminDeleteRacer.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("RacerManagementTab", () => {
  // 1. Given the tab mounts when the admin page loads then it fetches users and racers and renders the two main sections.
  // 2. Given racer loading fails when the tab mounts then it shows the racer list error state.
  // 3. Given there are no racers when the tab loads then it shows the empty-state message.
  // 4. Given racers exist when the tab loads then it renders each row with row-level actions.
  // 5. Given valid create-form input when the admin submits then it sends the expected payload to adminCreateRacer.
  // 6. Given a successful racer creation when the form submits then it shows the success toast and resets the form.
  // 7. Given the create request fails when the form submits then it shows the submit-level error toast.
  // 8. Given a field-level validation error when the admin edits the field then the inline error and summary clear.
  // 9. Given an existing racer when Edit is clicked then the modal opens with the racer's current values pre-filled.
  // 10. Given a successful edit when Save Changes is clicked then it updates the racer, closes the modal, and refetches the list.
  // 11. Given the update request fails when Save Changes is clicked then the edit modal shows an error toast.
  // 12. Given the admin cancels an edit when the modal is open then the modal closes without updating.
  // 13. Given an existing racer when Delete is clicked then the confirmation modal opens with the racer's name.
  // 14. Given deletion is confirmed when the request succeeds then it deletes the racer, closes the modal, and refetches the list.
  // 15. Given the delete request fails when deletion is confirmed then the delete modal shows an error toast.
  // 16. Given the admin cancels deletion when the confirm modal is open then the modal closes without deleting.
  // 17. Given the racer list is already loaded when Refresh is clicked then it fetches racers again.

  it("fetches racers and users on mount and renders the admin sections", async () => {
    await renderTab();

    expect(screen.getByRole("heading", { name: "All Racers" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create Racer" })).toBeInTheDocument();
  });

  it("displays the racer list error when fetching racers fails", async () => {
    mockAdminApi.adminListRacers.mockRejectedValueOnce(new Error("Network error"));

    await renderTab();

    expect(screen.getByText("Failed to load racers.")).toBeInTheDocument();
  });

  it("displays the empty state when no racers exist", async () => {
    await renderTab();

    expect(screen.getByText("No racers found. Create one below.")).toBeInTheDocument();
  });

  it("renders a row for each racer with Edit and Delete actions", async () => {
    const firstRacer = createRacer({ id: "racer-1", name: "Lewis Hamilton" });
    const secondRacer = createRacer({ id: "racer-2", name: "Max Verstappen" });
    mockAdminApi.adminListRacers.mockResolvedValueOnce([firstRacer, secondRacer]);

    await renderTab();

    const firstRow = getRacerRow(firstRacer.name);
    const secondRow = getRacerRow(secondRacer.name);

    expect(within(firstRow).getByRole("button", { name: "Edit" })).toBeVisible();
    expect(within(firstRow).getByRole("button", { name: "Delete" })).toBeVisible();
    expect(within(secondRow).getByRole("button", { name: "Edit" })).toBeVisible();
    expect(within(secondRow).getByRole("button", { name: "Delete" })).toBeVisible();
  });

  describe("Create racer", () => {
    it("submits the expected payload when the create form is valid", async () => {
      const user = userEvent.setup();

      await renderTab();
      await fillCreateForm(user, defaultCreateInput);
      await user.click(screen.getByRole("button", { name: "Create Racer" }));

      await waitFor(() => {
        expect(mockAdminApi.adminCreateRacer).toHaveBeenCalledWith(
          getExpectedPayload(defaultCreateInput),
        );
      });
    });

    it("shows a success toast and resets the form after a successful creation", async () => {
      const user = userEvent.setup();
      const createdRacer = createRacer({ name: defaultCreateInput.name });
      mockAdminApi.adminCreateRacer.mockResolvedValueOnce(createdRacer);

      await renderTab();
      await fillCreateForm(user, defaultCreateInput);
      await user.click(screen.getByRole("button", { name: "Create Racer" }));

      await waitFor(() => {
        expect(screen.getByText("Racer created")).toBeInTheDocument();
        expect(
          screen.getByText(`Racer \"${createdRacer.name}\" created successfully.`),
        ).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText("e.g. Max Verstappen")).toHaveValue("");
    });

    it("shows a submit error toast when creation fails", async () => {
      const user = userEvent.setup();
      mockAdminApi.adminCreateRacer.mockRejectedValueOnce(new Error("Racer already exists"));

      await renderTab();
      await fillCreateForm(user, defaultCreateInput);
      await user.click(screen.getByRole("button", { name: "Create Racer" }));

      await waitFor(() => {
        expect(screen.getByText("Failed to create racer")).toBeInTheDocument();
        expect(screen.getByText("Racer already exists")).toBeInTheDocument();
      });
    });

    it("clears validation errors when the user fixes the invalid field", async () => {
      const user = userEvent.setup();

      await renderTab();
      await fillCreateForm(user, { ...defaultCreateInput, name: "A" });
      await user.click(screen.getByRole("button", { name: "Create Racer" }));

      await waitFor(() => {
        // zod message has no trailing period; only one inline error node (no summary toast)
        expect(screen.getByText("Name must be at least 2 characters")).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText("e.g. Max Verstappen"), "b");

      await waitFor(() => {
        expect(screen.queryByText("Name must be at least 2 characters")).not.toBeInTheDocument();
      });
      expect(mockAdminApi.adminCreateRacer).not.toHaveBeenCalled();
    });
  });

  describe("Edit racer", () => {
    it("opens the edit modal with the racer's current values", async () => {
      const user = userEvent.setup();
      const racer = createRacer({ id: "racer-1", name: "Lewis Hamilton" });
      mockAdminApi.adminListRacers.mockResolvedValueOnce([racer]);

      await renderTab();
      const dialog = await openEditModal(user, racer);

      expect(within(dialog).getByDisplayValue(racer.name)).toBeInTheDocument();
      expect(within(dialog).getByDisplayValue(racer.nationality)).toBeInTheDocument();
      expect(within(dialog).getByDisplayValue(racer.team)).toBeInTheDocument();
    });

    it("updates the racer, closes the modal, and refetches the list after a successful edit", async () => {
      const user = userEvent.setup();
      const racer = createRacer({ id: "racer-1", name: "Lewis Hamilton" });
      const updatedName = "Lewis Hamilton II";
      mockAdminApi.adminListRacers.mockResolvedValue([racer]);
      mockAdminApi.adminUpdateRacer.mockResolvedValueOnce(
        createRacer({ ...racer, name: updatedName }),
      );

      await renderTab();
      const initialFetchCount = mockAdminApi.adminListRacers.mock.calls.length;
      const dialog = await openEditModal(user, racer);
      const nameInput = within(dialog).getByPlaceholderText("e.g. Max Verstappen");

      fireEvent.change(nameInput, { target: { value: updatedName, name: "name" } });
      expect(within(screen.getByRole("dialog")).getByDisplayValue(updatedName)).toBeInTheDocument();
      submitDialogForm(screen.getByRole("dialog"));

      await waitFor(() => {
        expect(mockAdminApi.adminUpdateRacer).toHaveBeenCalledTimes(1);
      });

      const [submittedRacerId, submittedPayload] = mockAdminApi.adminUpdateRacer.mock.calls[0];

      expect(submittedRacerId).toBe(racer.id);
      expect(submittedPayload).toMatchObject({ name: updatedName });

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(mockAdminApi.adminListRacers.mock.calls.length).toBeGreaterThan(initialFetchCount);
      });
    });

    it("shows an error toast in the edit modal when the update fails", async () => {
      const user = userEvent.setup();
      const racer = createRacer({ id: "racer-1", name: "Lewis Hamilton" });
      mockAdminApi.adminListRacers.mockResolvedValueOnce([racer]);
      mockAdminApi.adminUpdateRacer.mockRejectedValueOnce(new Error("Server error"));

      await renderTab();
      await openEditModal(user, racer);
      submitDialogForm(screen.getByRole("dialog"));

      await waitFor(() => {
        expect(screen.getByText("Failed to update racer")).toBeInTheDocument();
        expect(screen.getByText("Server error")).toBeInTheDocument();
      });
    });

    it("closes the edit modal without updating when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const racer = createRacer({ id: "racer-1", name: "Lewis Hamilton" });
      mockAdminApi.adminListRacers.mockResolvedValueOnce([racer]);

      await renderTab();
      const dialog = await openEditModal(user, racer);
      await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
      expect(mockAdminApi.adminUpdateRacer).not.toHaveBeenCalled();
    });
  });

  describe("Delete racer", () => {
    it("opens the delete confirmation modal with the racer's name", async () => {
      const user = userEvent.setup();
      const racer = createRacer({ id: "racer-1", name: "Test Racer" });
      mockAdminApi.adminListRacers.mockResolvedValueOnce([racer]);

      await renderTab();
      const dialog = await openDeleteModal(user, racer);

      expect(within(dialog).getByText("Delete Racer")).toBeInTheDocument();
      expect(within(dialog).getByText(/This action cannot be undone\./)).toBeInTheDocument();
      expect(within(dialog).getByText(racer.name)).toBeInTheDocument();
    });

    it("deletes the racer, closes the modal, and refetches the list when deletion is confirmed", async () => {
      const user = userEvent.setup();
      const racer = createRacer({ id: "racer-1", name: "Test Racer" });
      mockAdminApi.adminListRacers.mockResolvedValue([racer]);

      await renderTab();
      const initialFetchCount = mockAdminApi.adminListRacers.mock.calls.length;
      const dialog = await openDeleteModal(user, racer);
      await user.click(within(dialog).getByRole("button", { name: "Delete" }));

      await waitFor(() => {
        expect(mockAdminApi.adminDeleteRacer).toHaveBeenCalledWith(racer.id);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(mockAdminApi.adminListRacers.mock.calls.length).toBeGreaterThan(initialFetchCount);
      });
    });

    it("shows an error toast in the delete modal when deletion fails", async () => {
      const user = userEvent.setup();
      const racer = createRacer({ id: "racer-1", name: "Test Racer" });
      mockAdminApi.adminListRacers.mockResolvedValueOnce([racer]);
      mockAdminApi.adminDeleteRacer.mockRejectedValueOnce(new Error("Conflict"));

      await renderTab();
      const dialog = await openDeleteModal(user, racer);
      await user.click(within(dialog).getByRole("button", { name: "Delete" }));

      await waitFor(() => {
        const visibleDialog = screen.getByRole("dialog");
        expect(within(visibleDialog).getByText("Failed to delete racer")).toBeInTheDocument();
        expect(within(visibleDialog).getByText("Conflict")).toBeInTheDocument();
      });
    });

    it("closes the delete modal without deleting when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const racer = createRacer({ id: "racer-1", name: "Test Racer" });
      mockAdminApi.adminListRacers.mockResolvedValueOnce([racer]);

      await renderTab();
      const dialog = await openDeleteModal(user, racer);
      await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
      expect(mockAdminApi.adminDeleteRacer).not.toHaveBeenCalled();
    });
  });

  it("refetches racers when Refresh is clicked", async () => {
    const user = userEvent.setup();
    const racer = createRacer({ id: "racer-1", name: "Lewis Hamilton" });
    mockAdminApi.adminListRacers.mockResolvedValue([racer]);

    await renderTab();
    const initialFetchCount = mockAdminApi.adminListRacers.mock.calls.length;

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => {
      expect(mockAdminApi.adminListRacers).toHaveBeenCalledTimes(initialFetchCount + 1);
    });
  });
});
