import { cleanup, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Results from "src/pages/Results";
import { useAuth } from "src/hooks/useAuth";
import { useRaceResult, useSeasons } from "src/hooks/data";
import { createSeason, createUserFixture, mockRacers } from "tests/utils/fixtures";
import { createMockAuthContext } from "tests/utils/mocks/authContext.mock";
import { MemoryRouter } from "react-router-dom";
import { Race, RaceResult, RacerWithStats } from "shared";
import { CreateRace, GetRaceById, UpdateRace } from "src/services/api/races";

vi.mock("src/hooks/data", () => ({
  useSeasons: vi.fn(),
  useRaceResult: vi.fn(),
}));

vi.mock("src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("src/services/api/races", () => ({
  CreateRace: vi.fn(),
  GetRaceById: vi.fn(),
  UpdateRace: vi.fn(),
}));

const mockedUseSeasons = vi.mocked(useSeasons);
const mockedUseRaceResult = vi.mocked(useRaceResult);
const mockedUseAuth = vi.mocked(useAuth);
const mockedCreateRace = vi.mocked(CreateRace);
const mockedGetRaceById = vi.mocked(GetRaceById);
const mockedUpdateRace = vi.mocked(UpdateRace);

const seasons = [
  createSeason({ id: "season-1", name: "Summer 2025", status: "active" }),
  createSeason({ id: "season-2", name: "Winter 2025", status: "upcoming" }),
];

const racesBySeason: Record<string, Race[]> = {
  "season-1": [
    {
      id: "race-1",
      name: "Monaco GP",
      seasonId: "season-1",
      raceNumber: 1,
      date: new Date("2025-06-15"),
      completed: true,
      results: [
        { racerId: "racer-1", position: 2, points: 18, constructorPoints: 18 },
        { racerId: "racer-2", position: 1, points: 25, constructorPoints: 25 },
      ],
    },
  ],
  "season-2": [
    {
      id: "race-2",
      name: "Silverstone GP",
      seasonId: "season-2",
      raceNumber: 1,
      date: new Date("2025-12-01"),
      completed: false,
      results: [
        { racerId: "racer-1", position: 1, points: 25, constructorPoints: 25 },
        { racerId: "racer-2", position: 2, points: 18, constructorPoints: 18 },
      ],
    },
  ],
};

const aggregatedResultsBySeason: Record<string, RaceResult[]> = {
  "season-1": [
    { racerId: "racer-2", position: 1, points: 25, constructorPoints: 25 },
    { racerId: "racer-1", position: 2, points: 18, constructorPoints: 18 },
  ],
  "season-2": [
    { racerId: "racer-1", position: 1, points: 25, constructorPoints: 25 },
    { racerId: "racer-2", position: 2, points: 18, constructorPoints: 18 },
  ],
};

function setupHookMocks() {
  mockedUseSeasons.mockReturnValue({
    data: seasons,
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  });

  mockedUseRaceResult.mockImplementation((seasonId: string, raceId: string) => {
    const activeSeasonId = seasonId || "season-1";
    const races = racesBySeason[activeSeasonId] ?? [];
    const aggregate = aggregatedResultsBySeason[activeSeasonId] ?? [];

    const selectedRace = races.find((race) => race.id === raceId);

    return {
      races,
      results: selectedRace ? selectedRace.results : aggregate,
      racers: mockRacers as RacerWithStats[],
      isLoading: false,
      error: null,
    };
  });
}

function renderPage() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Results />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("Given the Results page", () => {
  describe("When interacting with the page", () => {
    // 1. Renders season/race selectors and aggregated rows from hooks
    // 2. Toggles points sort order when the Points header is clicked repeatedly
    // 3. Shows Add RaceResults for admins and opens add modal
    // 4. Shows Update RaceResults after race selection and opens update modal
    // 5. Hides Add/Update actions for non-admin users
    // 6. Calls useRaceResult with selected season id after season selection changes
    // 7. Passes loading and error states from hook to the table view
    // 8. Resets update mode when closing modal and opening add mode
    // 9. Submits add results in page flow and closes modal

    it("renders selectors and aggregated standings rows", () => {
      setupHookMocks();
      mockedUseAuth.mockReturnValue(createMockAuthContext({ isAdmin: true }));

      renderPage();

      expect(screen.getByRole("combobox", { name: /select season/i })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /select race/i })).toBeInTheDocument();
      expect(screen.getByText("Max Verstappen")).toBeInTheDocument();
      expect(screen.getByText("Lewis Hamilton")).toBeInTheDocument();
    });

    it("toggles points sorting between ascending and descending", async () => {
      setupHookMocks();
      mockedUseAuth.mockReturnValue(createMockAuthContext({ isAdmin: true }));
      const user = userEvent.setup();

      renderPage();

      const pointsHeader = screen.getByRole("columnheader", { name: "Points" });

      await user.click(pointsHeader);
      let rows = screen.getAllByRole("row");
      expect(within(rows[1]).getByText("Lewis Hamilton")).toBeInTheDocument();

      await user.click(pointsHeader);
      rows = screen.getAllByRole("row");
      expect(within(rows[1]).getByText("Max Verstappen")).toBeInTheDocument();
    });

    it("shows add action for admins and opens add results modal", async () => {
      setupHookMocks();
      mockedUseAuth.mockReturnValue(
        createMockAuthContext({
          isAdmin: true,
          user: createUserFixture({ role: "admin" }),
        }),
      );
      const user = userEvent.setup();

      renderPage();

      await user.click(screen.getByRole("button", { name: /add raceresults/i }));

      expect(await screen.findByRole("heading", { name: /add race results/i })).toBeInTheDocument();
    });

    it("shows update action after race selection and opens update modal", async () => {
      setupHookMocks();
      mockedUseAuth.mockReturnValue(
        createMockAuthContext({
          isAdmin: true,
          user: createUserFixture({ role: "admin" }),
        }),
      );
      const user = userEvent.setup();

      renderPage();

      await user.selectOptions(screen.getByRole("combobox", { name: /select race/i }), "race-1");

      const updateButton = await screen.findByRole("button", { name: /update raceresults/i });
      await user.click(updateButton);

      expect(
        await screen.findByRole("heading", { name: /update race results/i }),
      ).toBeInTheDocument();
    });

    it("hides add and update actions for non-admin users", async () => {
      setupHookMocks();
      mockedUseAuth.mockReturnValue(
        createMockAuthContext({
          isAdmin: false,
          user: createUserFixture({ role: "user" }),
        }),
      );
      const user = userEvent.setup();

      renderPage();

      expect(screen.queryByRole("button", { name: /add raceresults/i })).not.toBeInTheDocument();

      await user.selectOptions(screen.getByRole("combobox", { name: /select race/i }), "race-1");

      expect(screen.queryByRole("button", { name: /update raceresults/i })).not.toBeInTheDocument();
    });

    it("calls useRaceResult with the selected season id after season change", async () => {
      setupHookMocks();
      mockedUseAuth.mockReturnValue(createMockAuthContext({ isAdmin: true }));
      const user = userEvent.setup();

      renderPage();

      await user.selectOptions(
        screen.getByRole("combobox", { name: /select season/i }),
        "season-2",
      );

      expect(mockedUseRaceResult).toHaveBeenCalledWith("season-2", "");
    });

    it("passes loading and error states from hook to table rendering", () => {
      mockedUseSeasons.mockReturnValue({
        data: seasons,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      });

      mockedUseRaceResult.mockReturnValue({
        races: [],
        results: [],
        racers: mockRacers as RacerWithStats[],
        isLoading: true,
        error: null,
      });

      mockedUseAuth.mockReturnValue(createMockAuthContext({ isAdmin: true }));

      const { rerender } = renderPage();

      expect(screen.queryByRole("columnheader", { name: "Position" })).not.toBeInTheDocument();

      mockedUseRaceResult.mockReturnValue({
        races: [],
        results: [],
        racers: mockRacers as RacerWithStats[],
        isLoading: false,
        error: "Failed to load race results",
      });

      rerender(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Results />
        </MemoryRouter>,
      );

      expect(screen.getByText("Failed to load race results")).toBeInTheDocument();
    });

    it("resets update mode when modal closes and add flow is reopened", async () => {
      setupHookMocks();
      mockedGetRaceById.mockResolvedValue(racesBySeason["season-1"][0]);
      mockedUseAuth.mockReturnValue(
        createMockAuthContext({
          isAdmin: true,
          user: createUserFixture({ role: "admin" }),
        }),
      );
      const user = userEvent.setup();

      renderPage();

      await user.selectOptions(screen.getByRole("combobox", { name: /select race/i }), "race-1");
      await user.click(await screen.findByRole("button", { name: /update raceresults/i }));

      expect(
        await screen.findByRole("heading", { name: /update race results/i }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /close/i }));
      expect(
        screen.queryByRole("heading", { name: /update race results/i }),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /add raceresults/i }));
      expect(await screen.findByRole("heading", { name: /add race results/i })).toBeInTheDocument();
    });

    it("submits add race results and closes modal", async () => {
      setupHookMocks();
      mockedCreateRace.mockResolvedValue({} as Race);
      mockedUseAuth.mockReturnValue(
        createMockAuthContext({
          isAdmin: true,
          user: createUserFixture({ role: "admin" }),
        }),
      );

      const user = userEvent.setup();

      renderPage();

      // Open add modal
      await user.click(screen.getByRole("button", { name: /add raceresults/i }));
      expect(await screen.findByRole("heading", { name: /add race results/i })).toBeInTheDocument();

      // Fill race name
      fireEvent.change(screen.getByLabelText(/race name/i), { target: { value: "Test Race" } });

      // Select racers in each select (one per racer)
      const racerSelects = screen.getAllByLabelText(/racer/i);
      await user.selectOptions(racerSelects[0], "racer-1");
      await user.selectOptions(racerSelects[1], "racer-2");

      // Submit the form
      await user.click(screen.getByText("Save Results"));

      await waitFor(() => {
        expect(mockedCreateRace).toHaveBeenCalledWith(
          "season-1",
          "Test Race",
          expect.any(String),
          expect.any(Array),
        );
      });

      expect(screen.queryByRole("heading", { name: /add race results/i })).not.toBeInTheDocument();
    });

    it("submits update race results and closes modal", async () => {
      setupHookMocks();
      mockedGetRaceById.mockResolvedValue(racesBySeason["season-1"][0]);
      mockedUpdateRace.mockResolvedValue({} as Race);
      mockedUseAuth.mockReturnValue(
        createMockAuthContext({
          isAdmin: true,
          user: createUserFixture({ role: "admin" }),
        }),
      );

      const user = userEvent.setup();

      renderPage();

      await user.selectOptions(screen.getByRole("combobox", { name: /select race/i }), "race-1");
      await user.click(await screen.findByRole("button", { name: /update raceresults/i }));

      expect(await screen.findByLabelText(/race name/i)).toHaveValue("Monaco GP");

      await user.click(screen.getByText("Save Results"));

      expect(mockedUpdateRace).toHaveBeenCalledWith(
        "race-1",
        "Monaco GP",
        expect.any(String),
        expect.any(Array),
      );
      expect(
        screen.queryByRole("heading", { name: /update race results/i }),
      ).not.toBeInTheDocument();
    });
  });
});
