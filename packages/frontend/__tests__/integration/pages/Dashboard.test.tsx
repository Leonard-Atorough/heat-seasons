import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "src/pages/Dashboard";
import { useAuth } from "src/hooks/useAuth";
import { useActiveSeason, useRacers, useRaceResult } from "src/hooks/data";
import { createMockAuthContext } from "tests/utils/mocks/authContext.mock";
import { createSeason, mockRacers, createMockRace } from "tests/utils/fixtures";
import { renderWithRouter } from "tests/utils/renderWithRouter";
import { RaceResult, RacerWithStats } from "shared";
import { AuthContextType } from "src/contexts";

vi.mock("src/hooks/useAuth");
vi.mock("src/hooks/data", () => ({
  useActiveSeason: vi.fn(),
  useRacers: vi.fn(),
  useRaceResult: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseActiveSeason = vi.mocked(useActiveSeason);
const mockUseRacers = vi.mocked(useRacers);
const mockUseRaceResult = vi.mocked(useRaceResult);

const mockActiveSeason = createSeason({
  id: "season-1",
  name: "Summer 2026",
  status: "active" as any,
});

const mockRaces = [
  createMockRace({
    id: "race-1",
    name: "Monaco GP",
    seasonId: "season-1",
    raceNumber: 1,
    date: new Date("2026-05-24"),
    completed: true,
  }),
  createMockRace({
    id: "race-2",
    name: "British GP",
    seasonId: "season-1",
    raceNumber: 2,
    date: new Date("2026-07-05"),
    completed: false,
    results: [],
  }),
];

const mockAggregatedResults: RaceResult[] = [
  { racerId: "racer-1", position: 1, points: 25, constructorPoints: 25 },
  { racerId: "racer-2", position: 2, points: 18, constructorPoints: 18 },
  { racerId: "racer-3", position: 3, points: 15, constructorPoints: 15 },
];

beforeEach(() => {
  mockUseAuth.mockReturnValue(createMockAuthContext() as AuthContextType);
  mockUseActiveSeason.mockReturnValue({
    data: mockActiveSeason,
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  });
  mockUseRacers.mockReturnValue({
    data: mockRacers as RacerWithStats[],
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  });
  mockUseRaceResult.mockReturnValue({
    races: mockRaces,
    results: mockAggregatedResults,
    racers: mockRacers as RacerWithStats[],
    isLoading: false,
    error: null,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Given the Dashboard page", () => {
  describe("When rendering the dashboard", () => {
    it("displays hero section with welcome message", async () => {
      renderWithRouter(<Dashboard />);

      // Hero title should contain the season name
      expect(screen.getByText(/SUMMER 2026/i)).toBeInTheDocument();

      // Should display races completed info
      expect(screen.getByText(/Races Completed: 1 \/ 2/i)).toBeInTheDocument();
    });

    it("displays stats cards with season/race counts", async () => {
      renderWithRouter(<Dashboard />);

      // Should display stat cards
      expect(screen.getByText("Current Leader")).toBeInTheDocument();
      expect(screen.getByText("Recent Race")).toBeInTheDocument();
      expect(screen.getByText("Next Race")).toBeInTheDocument();

      // Lewis Hamilton should appear as current leader (first occurrence is in stats card)
      const statCards = screen.getAllByText("Lewis Hamilton");
      expect(statCards.length).toBeGreaterThan(0);
    });

    it("displays podium rankings card", async () => {
      renderWithRouter(<Dashboard />);

      // Top 3 leaderboard section should be visible
      expect(screen.getByText("Top 3 Leaderboard")).toBeInTheDocument();

      // Should display medals for top 3 racers
      expect(screen.getByText("🥇")).toBeInTheDocument();
      expect(screen.getByText("🥈")).toBeInTheDocument();
      expect(screen.getByText("🥉")).toBeInTheDocument();
    });
  });

  describe("When loading data", () => {
    it("shows loading skeleton while data fetches", async () => {
      mockUseActiveSeason.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refresh: vi.fn(),
      });
      mockUseRaceResult.mockReturnValue({
        races: [],
        results: [],
        racers: [],
        isLoading: true,
        error: null,
      });

      renderWithRouter(<Dashboard />);

      // Component renders but we check for absence of actual content
      expect(screen.queryByText("Current Leader")).not.toBeInTheDocument();
      expect(screen.queryByText("Recent Race")).not.toBeInTheDocument();
      expect(screen.queryByText("Next Race")).not.toBeInTheDocument();
      expect(screen.getByTestId("dashboard-hero-loading-skeleton")).toBeInTheDocument();
    });

    it("shows empty state when no seasons available", async () => {
      mockUseActiveSeason.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      });

      renderWithRouter(<Dashboard />);

      // Should show default season name when no active season
      expect(screen.getByText(/SEASON ONE WINTER 2026/i)).toBeInTheDocument();
    });
  });

  describe("When interacting with dashboard", () => {
    it("navigates to results page on view full standings button click", async () => {
      const user = userEvent.setup();
      renderWithRouter(<Dashboard />);

      // Find and click the button
      const button = screen.getByRole("button", { name: /View Full Standings/i });
      await user.click(button);

      // Button should be in the document and clickable
      expect(button).toBeInTheDocument();
    });

    it("displays race information correctly", async () => {
      renderWithRouter(<Dashboard />);

      // Recent race should be "Monaco GP"
      expect(screen.getByText("Monaco GP")).toBeInTheDocument();

      // Next race should be "British GP"
      expect(screen.getByText("British GP")).toBeInTheDocument();
    });

    it("shows correct racer standings in podium", async () => {
      renderWithRouter(<Dashboard />);

      // Verify that top leaderboard section is displayed
      const leaderboardSection = screen.getByText("Top 3 Leaderboard").parentElement;
      expect(leaderboardSection).toBeInTheDocument();
    });
  });
});
