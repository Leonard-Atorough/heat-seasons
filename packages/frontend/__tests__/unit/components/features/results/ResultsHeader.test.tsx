import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import ResultsHeader from "src/components/features/Results/ResultsHeader";
import { createMockAuthContext } from "tests/utils/mocks/authContext.mock";
import { createSeason, createMockRace } from "../../../../utils/fixtures";

vi.mock("src/hooks/useAuth");
import { useAuth } from "src/hooks/useAuth";
const mockedUseAuth = vi.mocked(useAuth);

const mockSeasons = [
  createSeason({ id: "season-1", name: "Summer 2025", status: "active", startDate: new Date("2025-06-01") }),
  createSeason({ id: "season-2", name: "Winter 2025", status: "completed", startDate: new Date("2025-11-01") }),
];

const mockRaces = [
  createMockRace(),
  createMockRace({ id: "race-2", name: "Silverstone GP", raceNumber: 2, date: new Date("2025-07-10") }),
];

describe("ResultsHeader Component", () => {
  let onSeasonChange: any;
  let onRaceChange: any;
  let onAddResults: any;
  let onUpdateResults: any;

  beforeEach(() => {
    onSeasonChange = vi.fn();
    onRaceChange = vi.fn();
    onAddResults = vi.fn();
    onUpdateResults = vi.fn();
    mockedUseAuth.mockReturnValue(createMockAuthContext({ user: { id: "1", name: "Admin", email: "admin@test.com", role: "admin" }, isAdmin: true }));
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a season option for each season in the list", () => {
    render(
      <ResultsHeader
        seasons={mockSeasons}
        races={[]}
        selectedRaceId={null}
        onSeasonChange={onSeasonChange}
        onRaceChange={onRaceChange}
        onAddResults={onAddResults}
      />,
    );
    expect(screen.getByRole("option", { name: "Summer 2025" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Winter 2025" })).toBeInTheDocument();
  });

  it("renders an 'All' option and a race option for each race", () => {
    render(
      <ResultsHeader
        seasons={mockSeasons}
        races={mockRaces}
        selectedRaceId={null}
        onSeasonChange={onSeasonChange}
        onRaceChange={onRaceChange}
        onAddResults={onAddResults}
      />,
    );
    expect(screen.getByRole("option", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Monaco GP" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Silverstone GP" })).toBeInTheDocument();
  });

  it("calls onSeasonChange with the new season id when the season select changes", () => {
    render(
      <ResultsHeader
        seasons={mockSeasons}
        races={[]}
        selectedRaceId={null}
        onSeasonChange={onSeasonChange}
        onRaceChange={onRaceChange}
        onAddResults={onAddResults}
      />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: /select season/i }), {
      target: { value: "season-2" },
    });
    expect(onSeasonChange).toHaveBeenCalledWith("season-2");
  });

  it("calls onRaceChange with the new race id when the race select changes", () => {
    render(
      <ResultsHeader
        seasons={mockSeasons}
        races={mockRaces}
        selectedRaceId={null}
        onSeasonChange={onSeasonChange}
        onRaceChange={onRaceChange}
        onAddResults={onAddResults}
      />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: /select race/i }), {
      target: { value: "race-1" },
    });
    expect(onRaceChange).toHaveBeenCalledWith("race-1");
  });

  it("shows the 'Add RaceResults' button when the user is an admin", () => {
    render(
      <ResultsHeader
        seasons={mockSeasons}
        races={[]}
        selectedRaceId={null}
        onSeasonChange={onSeasonChange}
        onRaceChange={onRaceChange}
        onAddResults={onAddResults}
      />,
    );
    expect(screen.getByRole("button", { name: /add raceresults/i })).toBeInTheDocument();
  });

  it("hides the 'Add RaceResults' button when the user is not an admin", () => {
    mockedUseAuth.mockReturnValue(createMockAuthContext({ user: { id: "1", name: "User", email: "user@test.com", role: "user" }, isAdmin: false }));
    render(
      <ResultsHeader
        seasons={mockSeasons}
        races={[]}
        selectedRaceId={null}
        onSeasonChange={onSeasonChange}
        onRaceChange={onRaceChange}
        onAddResults={onAddResults}
      />,
    );
    expect(screen.queryByRole("button", { name: /add raceresults/i })).not.toBeInTheDocument();
  });

  it("hides the 'Add RaceResults' button when there is no logged-in user", () => {
    mockedUseAuth.mockReturnValue(createMockAuthContext({ user: null as any, isAuthenticated: false, isAdmin: false }));
    render(
      <ResultsHeader
        seasons={mockSeasons}
        races={[]}
        selectedRaceId={null}
        onSeasonChange={onSeasonChange}
        onRaceChange={onRaceChange}
        onAddResults={onAddResults}
      />,
    );
    expect(screen.queryByRole("button", { name: /add raceresults/i })).not.toBeInTheDocument();
  });

  it("calls onAddResults when the 'Add RaceResults' button is clicked", async () => {
    render(
      <ResultsHeader
        seasons={mockSeasons}
        races={[]}
        selectedRaceId={null}
        onSeasonChange={onSeasonChange}
        onRaceChange={onRaceChange}
        onAddResults={onAddResults}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /add raceresults/i }));
    expect(onAddResults).toHaveBeenCalledTimes(1);
  });

  it("shows the 'Update RaceResults' button when admin, onUpdateResults, and selectedRaceId are all present", () => {
    render(
      <ResultsHeader
        seasons={mockSeasons}
        races={mockRaces}
        selectedRaceId="race-1"
        onSeasonChange={onSeasonChange}
        onRaceChange={onRaceChange}
        onAddResults={onAddResults}
        onUpdateResults={onUpdateResults}
      />,
    );
    expect(screen.getByRole("button", { name: /update raceresults/i })).toBeInTheDocument();
  });

  it("hides the 'Update RaceResults' button when selectedRaceId is null", () => {
    render(
      <ResultsHeader
        seasons={mockSeasons}
        races={mockRaces}
        selectedRaceId={null}
        onSeasonChange={onSeasonChange}
        onRaceChange={onRaceChange}
        onAddResults={onAddResults}
        onUpdateResults={onUpdateResults}
      />,
    );
    expect(screen.queryByRole("button", { name: /update raceresults/i })).not.toBeInTheDocument();
  });

  it("hides the 'Update RaceResults' button when onUpdateResults is not provided", () => {
    render(
      <ResultsHeader
        seasons={mockSeasons}
        races={mockRaces}
        selectedRaceId="race-1"
        onSeasonChange={onSeasonChange}
        onRaceChange={onRaceChange}
        onAddResults={onAddResults}
      />,
    );
    expect(screen.queryByRole("button", { name: /update raceresults/i })).not.toBeInTheDocument();
  });

  it("hides the 'Update RaceResults' button when the user is not an admin", () => {
    mockedUseAuth.mockReturnValue(createMockAuthContext({ user: { id: "1", name: "User", email: "user@test.com", role: "user" }, isAdmin: false }));
    render(
      <ResultsHeader
        seasons={mockSeasons}
        races={mockRaces}
        selectedRaceId="race-1"
        onSeasonChange={onSeasonChange}
        onRaceChange={onRaceChange}
        onAddResults={onAddResults}
        onUpdateResults={onUpdateResults}
      />,
    );
    expect(screen.queryByRole("button", { name: /update raceresults/i })).not.toBeInTheDocument();
  });

  it("calls onUpdateResults when the 'Update RaceResults' button is clicked", async () => {
    render(
      <ResultsHeader
        seasons={mockSeasons}
        races={mockRaces}
        selectedRaceId="race-1"
        onSeasonChange={onSeasonChange}
        onRaceChange={onRaceChange}
        onAddResults={onAddResults}
        onUpdateResults={onUpdateResults}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /update raceresults/i }));
    expect(onUpdateResults).toHaveBeenCalledTimes(1);
  });
});
