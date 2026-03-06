import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import AddRaceResultsModal from "src/components/features/Results/AddRaceResultsModal";
import { mockRaceData, mockRacers } from "../../../../utils/fixtures";

vi.mock("src/services/api/races");
import * as racesApi from "src/services/api/races";
const mockedCreateRace = vi.mocked(racesApi.CreateRace);
const mockedUpdateRace = vi.mocked(racesApi.UpdateRace);
const mockedGetRaceById = vi.mocked(racesApi.GetRaceById);

describe("AddRaceResultsModal Component", () => {
  let user: ReturnType<typeof userEvent.setup>;
  let onClose: any;
  let onRacerSelect: any;
  let onSubmit: any;

  beforeEach(() => {
    user = userEvent.setup();
    onClose = vi.fn();
    onRacerSelect = vi.fn();
    onSubmit = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // --- Visibility ---

  it("does not render when isOpen is false", () => {
    render(
      <AddRaceResultsModal
        isOpen={false}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={[]}
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.queryByText("Add Race Results")).not.toBeInTheDocument();
  });

  it("renders 'Add Race Results' title in create mode", () => {
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={[]}
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByText("Add Race Results")).toBeInTheDocument();
  });

  it("renders 'Update Race Results' title in update mode", async () => {
    mockedGetRaceById.mockResolvedValueOnce(mockRaceData);
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1", "racer-2"]}
        selectedRaceId="race-1"
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByText("Update Race Results")).toBeInTheDocument();
  });

  it("calls onRacerSelect and resets points when a racer select is changed", async () => {
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1", "racer-2"]}
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    const racerSelects = screen.getAllByLabelText(/^racer$/i);
    fireEvent.change(racerSelects[0], { target: { value: "racer-2" } });
    expect(onRacerSelect).toHaveBeenCalledWith("racer-2", "racer-1");
  });

  // --- Validation ---

  it("shows error when selectedRacerIds is empty on submit", async () => {
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={[]}
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByText(/save results/i));
    expect(await screen.findByText("Please select at least one racer.")).toBeInTheDocument();
    expect(mockedCreateRace).not.toHaveBeenCalled();
  });

  it("shows error when not all racers are selected on submit", async () => {
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1"]}
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByText(/save results/i));
    expect(await screen.findByText("Please select all racers.")).toBeInTheDocument();
    expect(mockedCreateRace).not.toHaveBeenCalled();
  });

  it("shows error when race name is empty on submit", async () => {
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1", "racer-2"]}
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByText(/save results/i));
    expect(await screen.findByText("Race name is required.")).toBeInTheDocument();
    expect(mockedCreateRace).not.toHaveBeenCalled();
  });

  // --- Create mode ---

  it("calls CreateRace with the correct args on valid create submission", async () => {
    mockedCreateRace.mockResolvedValueOnce({} as any);
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1", "racer-2"]}
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText(/race name/i), { target: { value: "Monaco GP" } });
    await user.click(screen.getByText(/save results/i));
    await waitFor(() => expect(mockedCreateRace).toHaveBeenCalledTimes(1));
    expect(mockedCreateRace).toHaveBeenCalledWith(
      "season-1",
      "Monaco GP",
      expect.any(String),
      expect.arrayContaining([
        expect.objectContaining({ racerId: "racer-1" }),
        expect.objectContaining({ racerId: "racer-2" }),
      ]),
    );
  });

  it("calls onClose and onSubmit after a successful create", async () => {
    mockedCreateRace.mockResolvedValueOnce({} as any);
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1", "racer-2"]}
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText(/race name/i), { target: { value: "Monaco GP" } });
    await user.click(screen.getByText(/save results/i));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows an API error message when CreateRace fails", async () => {
    mockedCreateRace.mockRejectedValueOnce(new Error("Network error"));
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1", "racer-2"]}
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText(/race name/i), { target: { value: "Monaco GP" } });
    await user.click(screen.getByText(/save results/i));
    expect(await screen.findByText("Network error")).toBeInTheDocument();
  });

  it("shows a fallback error message when the thrown value is not an Error instance", async () => {
    mockedCreateRace.mockRejectedValueOnce("unexpected failure");
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1", "racer-2"]}
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText(/race name/i), { target: { value: "Monaco GP" } });
    await user.click(screen.getByText(/save results/i));
    expect(await screen.findByText("Failed to save race results.")).toBeInTheDocument();
  });

  // --- Update mode ---

  it("calls GetRaceById when opened in update mode", async () => {
    mockedGetRaceById.mockResolvedValueOnce(mockRaceData);
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1", "racer-2"]}
        selectedRaceId="race-1"
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    await waitFor(() => expect(mockedGetRaceById).toHaveBeenCalledWith("race-1"));
  });

  it("pre-fills the race name from GetRaceById in update mode", async () => {
    mockedGetRaceById.mockResolvedValueOnce(mockRaceData);
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1", "racer-2"]}
        selectedRaceId="race-1"
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    expect(await screen.findByDisplayValue("Monaco GP")).toBeInTheDocument();
  });

  it("calls UpdateRace on valid submission in update mode", async () => {
    mockedGetRaceById.mockResolvedValueOnce(mockRaceData);
    mockedUpdateRace.mockResolvedValueOnce({} as any);
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1", "racer-2"]}
        selectedRaceId="race-1"
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    // Wait for pre-fill
    await screen.findByDisplayValue("Monaco GP");
    await user.click(screen.getByText(/save results/i));
    await waitFor(() => expect(mockedUpdateRace).toHaveBeenCalledTimes(1));
    expect(mockedUpdateRace).toHaveBeenCalledWith(
      "race-1",
      "Monaco GP",
      expect.any(String),
      expect.arrayContaining([
        expect.objectContaining({ racerId: "racer-1" }),
        expect.objectContaining({ racerId: "racer-2" }),
      ]),
    );
  });

  // --- Points, ghost racer, race date ---

  it("updates points for a racer when the points input is changed", async () => {
    mockedCreateRace.mockResolvedValueOnce({} as any);
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1", "racer-2"]}
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText(/race name/i), { target: { value: "Monaco GP" } });
    const pointsInputs = screen.getAllByLabelText(/^points$/i);
    fireEvent.change(pointsInputs[0], { target: { value: "25" } });
    await user.click(screen.getByText(/save results/i));
    await waitFor(() => expect(mockedCreateRace).toHaveBeenCalledTimes(1));
    expect(mockedCreateRace).toHaveBeenCalledWith(
      "season-1",
      "Monaco GP",
      expect.any(String),
      expect.arrayContaining([expect.objectContaining({ racerId: "racer-1", points: 25 })]),
    );
  });

  it("shows an error when GetRaceById fails in update mode", async () => {
    mockedGetRaceById.mockRejectedValueOnce(new Error("Network error"));
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1", "racer-2"]}
        selectedRaceId="race-1"
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    expect(
      await screen.findByText("Failed to load race data. Please try again."),
    ).toBeInTheDocument();
  });

  it("toggles the ghost racer flag when a ghost checkbox is changed", async () => {
    mockedCreateRace.mockResolvedValueOnce({} as any);
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1", "racer-2"]}
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText(/race name/i), { target: { value: "Monaco GP" } });
    const ghostCheckboxes = screen.getAllByLabelText(/isghost/i);
    fireEvent.click(ghostCheckboxes[0]);
    await user.click(screen.getByText(/save results/i));
    await waitFor(() => expect(mockedCreateRace).toHaveBeenCalledTimes(1));
    const callArgs = mockedCreateRace.mock.calls[0][3];
    expect(callArgs.some((r) => r.ghostRacer === true)).toBe(true);
  });

  it("updates the race date when the date input is changed", async () => {
    mockedCreateRace.mockResolvedValueOnce({} as any);
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={["racer-1", "racer-2"]}
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText(/race name/i), { target: { value: "Monaco GP" } });
    fireEvent.change(screen.getByLabelText(/race date/i), { target: { value: "2025-08-01" } });
    await user.click(screen.getByText(/save results/i));
    await waitFor(() => expect(mockedCreateRace).toHaveBeenCalledTimes(1));
    expect(mockedCreateRace).toHaveBeenCalledWith(
      "season-1",
      "Monaco GP",
      "2025-08-01",
      expect.any(Array),
    );
  });

  // --- Close ---

  it("calls onClose when the modal close button is clicked", async () => {
    render(
      <AddRaceResultsModal
        isOpen={true}
        onClose={onClose}
        seasonId="season-1"
        racers={mockRacers}
        selectedRacerIds={[]}
        onRacerSelect={onRacerSelect}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
