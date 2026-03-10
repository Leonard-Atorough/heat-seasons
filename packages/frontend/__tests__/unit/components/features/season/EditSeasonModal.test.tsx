import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSeason } from "tests/utils/fixtures";
import { EditSeasonModal } from "src/components/features/Season";

vi.mock("src/services/api/season");
import * as seasonApi from "src/services/api/season";
const mockedUpdateSeason = vi.mocked(seasonApi.updateSeason);

describe("EditSeasonModal Component", () => {
  let onClose: any;
  let onSubmit: any;
  const defaultSeason = createSeason();

  beforeEach(() => {
    onClose = vi.fn();
    onSubmit = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // --- Visibility ---

  it("does not render when isOpen is false", () => {
    render(
      <EditSeasonModal
        isOpen={false}
        season={defaultSeason}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.queryByText(/edit season/i)).not.toBeInTheDocument();
  });

  it("renders the modal when isOpen is true", () => {
    render(
      <EditSeasonModal
        isOpen={true}
        season={defaultSeason}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByText(/edit season/i)).toBeInTheDocument();
  });

  // --- Pre-fill ---

  it("pre-fills the season name from the season prop", () => {
    render(
      <EditSeasonModal
        isOpen={true}
        season={defaultSeason}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByDisplayValue(defaultSeason.name)).toBeInTheDocument();
  });

  it("pre-fills the start date from the season prop", () => {
    render(
      <EditSeasonModal
        isOpen={true}
        season={defaultSeason}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    const expectedDate = new Date(defaultSeason.startDate).toISOString().split("T")[0];
    expect(screen.getByDisplayValue(expectedDate)).toBeInTheDocument();
  });

  it("pre-fills the status from the season prop", () => {
    render(
      <EditSeasonModal
        isOpen={true}
        season={defaultSeason}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByDisplayValue(/upcoming/i)).toBeInTheDocument();
  });

  // --- Hint text ---

  it("shows hint text when status is set to completed and season has no end date", async () => {
    const user = userEvent.setup();
    render(
      <EditSeasonModal
        isOpen={true}
        season={defaultSeason}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    await user.selectOptions(screen.getByRole("combobox"), "completed");
    expect(
      screen.getByText(/setting status to completed will automatically record today/i),
    ).toBeInTheDocument();
  });

  it("shows hint text when status is set to archived and season has no end date", async () => {
    const user = userEvent.setup();
    render(
      <EditSeasonModal
        isOpen={true}
        season={defaultSeason}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    await user.selectOptions(screen.getByRole("combobox"), "archived");
    expect(
      screen.getByText(/setting status to completed will automatically record today/i),
    ).toBeInTheDocument();
  });

  it("does not show hint text when the season already has an end date", async () => {
    const user = userEvent.setup();
    const seasonWithEndDate = { ...defaultSeason, endDate: new Date("2024-12-01") };
    render(
      <EditSeasonModal
        isOpen={true}
        season={seasonWithEndDate}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    await user.selectOptions(screen.getByRole("combobox"), "completed");
    expect(
      screen.queryByText(/setting status to completed will automatically record today/i),
    ).not.toBeInTheDocument();
  });

  // --- Cancel ---

  it("calls onClose when the Cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <EditSeasonModal
        isOpen={true}
        season={defaultSeason}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the modal × button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <EditSeasonModal
        isOpen={true}
        season={defaultSeason}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // --- Update ---

  it("calls updateSeason with the correct args on valid submission", async () => {
    const user = userEvent.setup();
    mockedUpdateSeason.mockResolvedValueOnce({} as any);
    render(
      <EditSeasonModal
        isOpen={true}
        season={defaultSeason}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText(/season name/i), {
      target: { value: "Updated Season" },
    });
    await user.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(mockedUpdateSeason).toHaveBeenCalledTimes(1));
    expect(mockedUpdateSeason).toHaveBeenCalledWith(defaultSeason.id, {
      name: "Updated Season",
      startDate: expect.any(String),
      status: defaultSeason.status,
    });
  });

  it("calls onSubmit after a successful update", async () => {
    const user = userEvent.setup();
    mockedUpdateSeason.mockResolvedValueOnce({} as any);
    render(
      <EditSeasonModal
        isOpen={true}
        season={defaultSeason}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("shows an error message when updateSeason fails", async () => {
    const user = userEvent.setup();
    mockedUpdateSeason.mockRejectedValueOnce(new Error("Server error"));
    render(
      <EditSeasonModal
        isOpen={true}
        season={defaultSeason}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Save Changes" }));
    expect(
      await screen.findByText("Failed to update season. Please try again."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables the submit button while submitting", async () => {
    const user = userEvent.setup();
    let resolveUpdate: () => void;
    mockedUpdateSeason.mockReturnValueOnce(
      new Promise((res) => {
        resolveUpdate = () => res({} as any);
      }),
    );
    render(
      <EditSeasonModal
        isOpen={true}
        season={defaultSeason}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Save Changes" }));
    expect(screen.getByRole("button", { name: "Saving\u2026" })).toBeDisabled();
    resolveUpdate!();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Save Changes" })).not.toBeDisabled(),
    );
  });
});
