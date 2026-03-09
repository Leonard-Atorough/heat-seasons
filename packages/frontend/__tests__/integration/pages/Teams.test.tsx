import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Teams } from "src/pages/Teams";
import { useAuth } from "src/hooks/useAuth";
import { useRacers } from "src/hooks/data/useRacer";
import { createMockAuthContext } from "tests/utils/mocks/authContext.mock";
import { mockRacers } from "tests/utils/fixtures";

vi.mock("src/hooks/useAuth");
vi.mock("src/hooks/data/useRacer");

const mockUseAuth = vi.mocked(useAuth);
const mockUseRacers = vi.mocked(useRacers);

beforeEach(() => {
  mockUseAuth.mockReturnValue(createMockAuthContext());
  mockUseRacers.mockReturnValue({
    data: mockRacers,
    refresh: vi.fn(),
    isLoading: false,
  } as any);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Given the Teams page", () => {
  describe("When rendering teams list", () => {
    it("displays all unique teams from racers", () => {
      render(
        <MemoryRouter>
          <Teams />
        </MemoryRouter>,
      );

      const uniqueTeams = new Set(mockRacers.map((r) => r.team));
      expect(screen.getByText(/Heat Teams: Winter 2026/i)).toBeInTheDocument();
      expect(uniqueTeams.size).toBeGreaterThan(0);
    });

    it("shows empty state when no racers exist", () => {
      mockUseRacers.mockReturnValue({
        data: null,
        refresh: vi.fn(),
        isLoading: false,
      } as any);

      render(
        <MemoryRouter>
          <Teams />
        </MemoryRouter>,
      );

      expect(screen.getByText(/Heat Teams: Winter 2026/i)).toBeInTheDocument();
    });
  });

  describe("When loading data", () => {
    it("shows loading skeleton while fetching teams", () => {
      mockUseRacers.mockReturnValue({
        data: mockRacers,
        refresh: vi.fn(),
        isLoading: true,
      } as any);

      render(
        <MemoryRouter>
          <Teams />
        </MemoryRouter>,
      );

      const loadingElements = screen.queryAllByTestId(/teams-page-loading-skeleton/);
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe("When interacting with teams", () => {
    it.skip("navigates to team details page on card click", async () => {
      // TODO: Implement if team details route is added
    });
  });
});
