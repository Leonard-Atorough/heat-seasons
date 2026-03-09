import { describe, it, expect, vi, beforeEach, afterEach, ReactNode } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSeasons, useActiveSeason } from "src/hooks/data/useSeason";
import { DataContext, DataContextType } from "src/contexts";
import { createSeason } from "tests/utils/fixtures";

const mockSeasons = [
  createSeason({ id: "s1", name: "Winter 2026", status: "active" as const }),
  createSeason({ id: "s2", name: "Summer 2025", status: "completed" as const }),
];

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useSeasons hook", () => {
  describe("When calling useSeasons", () => {
    it("returns seasons data from context", () => {
      const mockContextValue: DataContextType = {
        seasons: mockSeasons,
        racers: [],
        isLoading: false,
        error: null,
        refreshSeasons: vi.fn(),
        refreshRacers: vi.fn(),
        refreshAll: vi.fn(),
      };

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useSeasons(), { wrapper });

      expect(result.current.data).toEqual(mockSeasons);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("returns loading state when fetching", () => {
      const mockContextValue: DataContextType = {
        seasons: [],
        racers: [],
        isLoading: true,
        error: null,
        refreshSeasons: vi.fn(),
        refreshRacers: vi.fn(),
        refreshAll: vi.fn(),
      };

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useSeasons(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toEqual([]);
    });

    it("returns error state when fetch fails", () => {
      const testError = new Error("Failed to fetch seasons");
      const mockContextValue: DataContextType = {
        seasons: [],
        racers: [],
        isLoading: false,
        error: testError,
        refreshSeasons: vi.fn(),
        refreshRacers: vi.fn(),
        refreshAll: vi.fn(),
      };

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useSeasons(), { wrapper });

      expect(result.current.error).toEqual(testError);
      expect(result.current.data).toEqual([]);
    });
  });

  describe("When refreshing seasons", () => {
    it("calls refresh function", () => {
      const mockRefresh = vi.fn();
      const mockContextValue: DataContextType = {
        seasons: mockSeasons,
        racers: [],
        isLoading: false,
        error: null,
        refreshSeasons: mockRefresh,
        refreshRacers: vi.fn(),
        refreshAll: vi.fn(),
      };

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useSeasons(), { wrapper });

      result.current.refresh();

      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});

describe("useActiveSeason hook", () => {
  describe("When calling useActiveSeason", () => {
    it("returns the active season from list", () => {
      const mockContextValue: DataContextType = {
        seasons: mockSeasons,
        racers: [],
        isLoading: false,
        error: null,
        refreshSeasons: vi.fn(),
        refreshRacers: vi.fn(),
        refreshAll: vi.fn(),
      };

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useActiveSeason(), { wrapper });

      expect(result.current.data).toEqual(mockSeasons[0]);
      expect(result.current.data?.name).toBe("Winter 2026");
      expect(result.current.data?.status).toBe("active");
    });

    it("returns null when no active season exists", () => {
      const mockContextValue: DataContextType = {
        seasons: [mockSeasons[1]], // Only completed season
        racers: [],
        isLoading: false,
        error: null,
        refreshSeasons: vi.fn(),
        refreshRacers: vi.fn(),
        refreshAll: vi.fn(),
      };

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useActiveSeason(), { wrapper });

      expect(result.current.data).toBeUndefined();
    });
  });
});
