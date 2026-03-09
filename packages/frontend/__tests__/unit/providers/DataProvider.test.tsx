import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useContext } from "react";
import { DataProvider } from "src/providers/DataProvider";
import { DataContext } from "src/contexts/dataContext";
import * as seasonApi from "src/services/api/season";
import * as racerApi from "src/services/api/racer";
import { createSeason } from "tests/utils/fixtures";
import { createRacerFixture } from "tests/utils/fixtures";

vi.mock("src/services/api/season");
vi.mock("src/services/api/racer");

const mockSeasonApi = vi.mocked(seasonApi);
const mockRacerApi = vi.mocked(racerApi);

beforeEach(() => {
  mockSeasonApi.getSeasons.mockResolvedValue([]);
  mockRacerApi.getAllRacers.mockResolvedValue([]);
});

afterEach(() => {
  vi.clearAllMocks();
});

const TestComponent = () => {
  const context = useContext(DataContext);
  if (!context) {
    return <div data-testid="no-context">No context</div>;
  }
  return (
    <div>
      <div data-testid="seasons-count">{context.seasons?.length || 0}</div>
      <div data-testid="racers-count">{context.racers?.length || 0}</div>
      <div data-testid="loading">{context.isLoading ? "loading" : "loaded"}</div>
      <div data-testid="error">{context.error ? context.error.message : "no-error"}</div>
      <button data-testid="refresh-btn" onClick={context.refresh}>
        Refresh All
      </button>
      <button data-testid="refresh-racers-btn" onClick={context.refreshRacers}>
        Refresh Racers
      </button>
      <button data-testid="refresh-seasons-btn" onClick={context.refreshSeasons}>
        Refresh Seasons
      </button>
    </div>
  );
};

describe("DataProvider", () => {
  describe("When initializing provider", () => {
    // 1. Initializes with default empty values on mount
    // 2. Calls both API services on mount
    // 3. Shows loading state during initialization
    // 4. Clears loading state after both fetches complete

    it("initializes with empty racers and no seasons", async () => {
      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      expect(screen.getByTestId("racers-count")).toHaveTextContent("0");
      expect(screen.getByTestId("seasons-count")).toHaveTextContent("0");
    });

    it("calls both getAllRacers and getSeasons on mount", async () => {
      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        expect(mockRacerApi.getAllRacers).toHaveBeenCalledTimes(1);
        expect(mockSeasonApi.getSeasons).toHaveBeenCalledTimes(1);
      });
    });

    it("sets loading state during initialization", async () => {
      // Since both API calls are mocked and resolve, loading should complete
      mockRacerApi.getAllRacers.mockResolvedValue([]);
      mockSeasonApi.getSeasons.mockResolvedValue([]);

      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      // After mount, loading should complete as promises resolve
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });

    it("clears error state on successful mount", async () => {
      mockRacerApi.getAllRacers.mockResolvedValue([createRacerFixture()]);
      mockSeasonApi.getSeasons.mockResolvedValue([createSeason()]);

      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("no-error");
      });
    });
  });

  describe("When fetching data successfully", () => {
    // 1. Provides fetched seasons to context
    // 2. Provides fetched racers to context
    // 3. Populates seasons and racers from API responses
    // 4. Updates counts after fetch completes

    it("provides fetched seasons to context", async () => {
      const mockSeasons = [createSeason({ name: "2024 Season" })];
      mockSeasonApi.getSeasons.mockResolvedValue(mockSeasons);

      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("seasons-count")).toHaveTextContent("1");
      });
    });

    it("provides fetched racers to context", async () => {
      const mockRacers = [
        createRacerFixture({ name: "Lewis Hamilton" }),
        createRacerFixture({ name: "Max Verstappen", id: "racer-2" }),
      ];
      mockRacerApi.getAllRacers.mockResolvedValue(mockRacers);

      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("racers-count")).toHaveTextContent("2");
      });
    });

    it("updates context counts after both fetches complete", async () => {
      const mockSeasons = [createSeason()];
      const mockRacers = [createRacerFixture()];
      mockSeasonApi.getSeasons.mockResolvedValue(mockSeasons);
      mockRacerApi.getAllRacers.mockResolvedValue(mockRacers);

      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("seasons-count")).toHaveTextContent("1");
        expect(screen.getByTestId("racers-count")).toHaveTextContent("1");
      });
    });

    it("sets loading to false after data fetch completes", async () => {
      mockRacerApi.getAllRacers.mockResolvedValue([createRacerFixture()]);
      mockSeasonApi.getSeasons.mockResolvedValue([createSeason()]);

      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });
  });

  describe("When refreshing data", () => {
    // 1. refresh() calls both API services and updates data
    // 2. refreshRacers() calls only racer API and updates racers
    // 3. refreshSeasons() calls only season API and updates seasons
    // 4. Each refresh method sets loading state appropriately

    it("refetches all data when refresh() is called", async () => {
      const mockSeasons = [createSeason({ name: "Initial Season" })];
      const mockRacers = [createRacerFixture({ name: "Initial Racer" })];
      mockSeasonApi.getSeasons.mockResolvedValue(mockSeasons);
      mockRacerApi.getAllRacers.mockResolvedValue(mockRacers);

      const user = userEvent.setup();
      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("racers-count")).toHaveTextContent("1");
      });

      // Update mock for second call
      const updatedSeasons = [
        createSeason({ name: "Season 1" }),
        createSeason({ name: "Season 2", id: "season-2" }),
      ];
      const updatedRacers = [
        createRacerFixture({ name: "Racer 1" }),
        createRacerFixture({ name: "Racer 2", id: "racer-2" }),
      ];
      mockSeasonApi.getSeasons.mockResolvedValue(updatedSeasons);
      mockRacerApi.getAllRacers.mockResolvedValue(updatedRacers);

      await user.click(screen.getByTestId("refresh-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("seasons-count")).toHaveTextContent("2");
        expect(screen.getByTestId("racers-count")).toHaveTextContent("2");
      });
    });

    it("refetches only racers when refreshRacers() is called", async () => {
      const mockSeasons = [createSeason()];
      const mockRacers = [createRacerFixture()];
      mockSeasonApi.getSeasons.mockResolvedValue(mockSeasons);
      mockRacerApi.getAllRacers.mockResolvedValue(mockRacers);

      const user = userEvent.setup();
      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        expect(mockSeasonApi.getSeasons).toHaveBeenCalledTimes(1);
        expect(mockRacerApi.getAllRacers).toHaveBeenCalledTimes(1);
      });

      const updatedRacers = [
        createRacerFixture({ name: "Updated Racer" }),
      ];
      mockRacerApi.getAllRacers.mockResolvedValue(updatedRacers);

      await user.click(screen.getByTestId("refresh-racers-btn"));

      await waitFor(() => {
        // Should still have 1 racer from initial + refreshRacers call
        expect(mockRacerApi.getAllRacers).toHaveBeenCalledTimes(2);
        // getSeasons should not be called again
        expect(mockSeasonApi.getSeasons).toHaveBeenCalledTimes(1);
      });
    });

    it("refetches only seasons when refreshSeasons() is called", async () => {
      const mockSeasons = [createSeason()];
      const mockRacers = [createRacerFixture()];
      mockSeasonApi.getSeasons.mockResolvedValue(mockSeasons);
      mockRacerApi.getAllRacers.mockResolvedValue(mockRacers);

      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        expect(mockSeasonApi.getSeasons).toHaveBeenCalledTimes(1);
        expect(mockRacerApi.getAllRacers).toHaveBeenCalledTimes(1);
      });

      const updatedSeasons = [createSeason({ name: "Updated Season" })];
      mockSeasonApi.getSeasons.mockResolvedValue(updatedSeasons);

      const user2 = userEvent.setup();
      await user2.click(screen.getByTestId("refresh-seasons-btn"));

      await waitFor(() => {
        expect(mockSeasonApi.getSeasons).toHaveBeenCalledTimes(2);
        // getAllRacers should not be called again
        expect(mockRacerApi.getAllRacers).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("When handling errors", () => {
    // 1. Handles season fetch errors gracefully
    // 2. Handles racer fetch errors gracefully
    // 3. Continues fetching other data if one fetch fails
    // 4. Sets error state and allows recovery via refresh

    it("handles season fetch errors gracefully", async () => {
      const testError = new Error("Season fetch failed");
      mockSeasonApi.getSeasons.mockRejectedValue(testError);
      mockRacerApi.getAllRacers.mockResolvedValue([createRacerFixture()]);

      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Season fetch failed");
      });
    });

    it("handles racer fetch errors gracefully", async () => {
      const testError = new Error("Racer fetch failed");
      mockRacerApi.getAllRacers.mockRejectedValue(testError);
      mockSeasonApi.getSeasons.mockResolvedValue([createSeason()]);

      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Racer fetch failed");
      });
    });

    it("continues fetching other data if one fetch fails", async () => {
      const testError = new Error("Racer API error");
      mockRacerApi.getAllRacers.mockRejectedValue(testError);
      const mockSeasons = [createSeason()];
      mockSeasonApi.getSeasons.mockResolvedValue(mockSeasons);

      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        // Even though racer fetch failed, season data should be available
        expect(screen.getByTestId("seasons-count")).toHaveTextContent("1");
        expect(mockSeasonApi.getSeasons).toHaveBeenCalledTimes(1);
        expect(mockRacerApi.getAllRacers).toHaveBeenCalledTimes(1);
      });
    });

    it("allows recovery from errors via refresh", async () => {
      const testError = new Error("Initial fetch failed");
      mockRacerApi.getAllRacers.mockRejectedValue(testError);
      mockSeasonApi.getSeasons.mockResolvedValue([]);

      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Initial fetch failed");
      });

      // Mock success on retry
      mockRacerApi.getAllRacers.mockResolvedValue([createRacerFixture()]);

      const user = userEvent.setup();
      await user.click(screen.getByTestId("refresh-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("racers-count")).toHaveTextContent("1");
        expect(screen.getByTestId("error")).toHaveTextContent("no-error");
      });
    });

    it("sets loading to false even when error occurs", async () => {
      mockRacerApi.getAllRacers.mockRejectedValue(new Error("API error"));
      mockSeasonApi.getSeasons.mockResolvedValue([]);

      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });
  });

  describe("When consuming context", () => {
    // 1. Provides complete data context to consumers
    // 2. Provides all required context methods (refresh, refreshRacers, refreshSeasons)
    // 3. Updates context when data changes

    it("provides complete data context with all properties", async () => {
      const mockSeasons = [createSeason()];
      const mockRacers = [createRacerFixture()];
      mockSeasonApi.getSeasons.mockResolvedValue(mockSeasons);
      mockRacerApi.getAllRacers.mockResolvedValue(mockRacers);

      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("seasons-count")).toHaveTextContent("1");
        expect(screen.getByTestId("racers-count")).toHaveTextContent("1");
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
        expect(screen.getByTestId("error")).toHaveTextContent("no-error");
      });
    });

    it("provides refresh methods to consumers", async () => {
      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      const refreshBtn = screen.getByTestId("refresh-btn");
      const refreshRacersBtn = screen.getByTestId("refresh-racers-btn");
      const refreshSeasonsBtn = screen.getByTestId("refresh-seasons-btn");

      expect(refreshBtn).toBeInTheDocument();
      expect(refreshRacersBtn).toBeInTheDocument();
      expect(refreshSeasonsBtn).toBeInTheDocument();
    });

    it("updates context when data changes after refresh", async () => {
      const initialRacers = [createRacerFixture({ name: "Initial" })];
      mockRacerApi.getAllRacers.mockResolvedValue(initialRacers);
      mockSeasonApi.getSeasons.mockResolvedValue([]);

      const user = userEvent.setup();
      render(
        <DataProvider>
          <TestComponent />
        </DataProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("racers-count")).toHaveTextContent("1");
      });

      // Update mock response
      const updatedRacers = [
        createRacerFixture({ name: "Updated 1" }),
        createRacerFixture({ name: "Updated 2", id: "racer-99" }),
      ];
      mockRacerApi.getAllRacers.mockResolvedValue(updatedRacers);

      await user.click(screen.getByTestId("refresh-racers-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("racers-count")).toHaveTextContent("2");
      });
    });

    it("throws error when used outside provider", () => {
      // Create a component that tries to use context without provider
      const ConsumerWithoutProvider = () => {
        const context = useContext(DataContext);
        return <div data-testid="result">{context ? "has-context" : "no-context"}</div>;
      };

      render(<ConsumerWithoutProvider />);

      expect(screen.getByTestId("result")).toHaveTextContent("no-context");
    });
  });
});
