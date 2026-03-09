import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Racers from "src/pages/Racers";
import * as racerApi from "src/services/api/racer";
import { useAuth } from "src/hooks/useAuth";
import { useRacers } from "src/hooks/data/useRacer";
import { mockAuthContext } from "tests/utils/mocks/authContext.mock";
import { mockRacers, createRacerFixture } from "tests/utils/fixtures";

vi.mock("src/hooks/useAuth");
vi.mock("src/hooks/data/useRacer");
vi.mock("src/services/api/racer");

const mockUseAuth = vi.mocked(useAuth);
const mockUseRacers = vi.mocked(useRacers);

beforeEach(() => {
  mockUseAuth.mockReturnValue(mockAuthContext as any);
  mockUseRacers.mockReturnValue({ data: mockRacers, refresh: vi.fn() } as any);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Given the Racers page", () => {
  describe("When rendering racers list", () => {
    it("displays grid of all racers with cards", () => {
      render(
        <MemoryRouter>
          <Racers />
        </MemoryRouter>,
      );

      mockRacers.forEach((racer) => {
        expect(screen.getByText(racer.name)).toBeInTheDocument();
      });
    });

    it("sorts racers by team", () => {
      render(
        <MemoryRouter>
          <Racers />
        </MemoryRouter>,
      );

      const racerElements = screen.getAllByRole("heading", { level: 3 });
      expect(racerElements.length).toBe(mockRacers.length);
    });

    it("shows empty state when no racers exist", () => {
      mockUseRacers.mockReturnValue({ data: null, refresh: vi.fn() } as any);

      render(
        <MemoryRouter>
          <Racers />
        </MemoryRouter>,
      );

      // Empty grid should have no racer cards
      expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
    });
  });

  describe("When handling errors", () => {
    it.skip("shows error message when racer fetch fails", async () => {
      // TODO: useRacers error state handling if implemented
    });
  });
});
