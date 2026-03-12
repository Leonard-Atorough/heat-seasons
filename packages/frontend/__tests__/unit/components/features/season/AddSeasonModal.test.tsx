import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createSeasonRequest } from "tests/utils/fixtures";
import { AddSeasonModal } from "src/components/features/Season";

vi.mock("src/services/api/season");
import * as seasonApi from "src/services/api/season";
const mockedCreateSeason = vi.mocked(seasonApi.createSeason);

describe("AddSeasonModal Component", () => {
  let onClose: any;
  let onSubmit: any;

  beforeEach(() => {
    onClose = vi.fn();
    onSubmit = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // --- Visibility ---

  it("does not render the modal when isOpen is false", () => {
    render(<AddSeasonModal isOpen={false} onClose={onClose} onSubmit={onSubmit} />);
    expect(screen.queryByText(/add new season/i)).not.toBeInTheDocument();
  });

  it("renders the modal when isOpen is true", () => {
    render(<AddSeasonModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);
    expect(screen.getByText(/add new season/i)).toBeInTheDocument();
  });

  it("calls onClose when the modal close button is clicked", async () => {
    const user = userEvent.setup();
    render(<AddSeasonModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);
    await user.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // --- Validation ---

  it("shows a validation error and does not call createSeason when season name is missing", async () => {
    const user = userEvent.setup();
    render(<AddSeasonModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: "2026-06-01" } });
    await user.click(screen.getByText(/create season/i));
    expect(
      await screen.findByText("Season name is required"),
    ).toBeInTheDocument();
    expect(mockedCreateSeason).not.toHaveBeenCalled();
  });

  it("shows a validation error and does not call createSeason when start date is missing", async () => {
    const user = userEvent.setup();
    render(<AddSeasonModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/season name/i), {
      target: { value: createSeasonRequest().name },
    });
    await user.click(screen.getByText(/create season/i));
    expect(
      await screen.findByText("Start date is required"),
    ).toBeInTheDocument();
    expect(mockedCreateSeason).not.toHaveBeenCalled();
  });

  // --- Create ---

  it("calls createSeason with the correct args on valid submission", async () => {
    const user = userEvent.setup();
    mockedCreateSeason.mockResolvedValueOnce({} as any);
    render(<AddSeasonModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);
    const { name, startDate } = createSeasonRequest();
    fireEvent.change(screen.getByLabelText(/season name/i), { target: { value: name } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: startDate } });
    await user.click(screen.getByText(/create season/i));
    await waitFor(() => expect(mockedCreateSeason).toHaveBeenCalledTimes(1));
    expect(mockedCreateSeason).toHaveBeenCalledWith(name, new Date(startDate).toISOString());
  });

  it("calls onSubmit after a successful create", async () => {
    const user = userEvent.setup();
    mockedCreateSeason.mockResolvedValueOnce({} as any);
    render(<AddSeasonModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);
    const { name, startDate } = createSeasonRequest();
    fireEvent.change(screen.getByLabelText(/season name/i), { target: { value: name } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: startDate } });
    await user.click(screen.getByText(/create season/i));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("shows an error message in the DOM when createSeason fails", async () => {
    const user = userEvent.setup();
    mockedCreateSeason.mockRejectedValueOnce(new Error("Network error"));
    render(<AddSeasonModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);
    const { name, startDate } = createSeasonRequest();
    fireEvent.change(screen.getByLabelText(/season name/i), { target: { value: name } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: startDate } });
    await user.click(screen.getByText(/create season/i));
    expect(
      await screen.findByText("Failed to create season. Please try again."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
