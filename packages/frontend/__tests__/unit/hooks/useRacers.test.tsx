import { describe, it, expect, vi, beforeEach, afterEach, ReactNode } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRacers } from "src/hooks/data/useRacer";
import { DataContext, DataContextType } from "src/contexts";
import { mockRacers } from "tests/utils/fixtures";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useRacers hook", () => {
  describe("When calling useRacers", () => {
    it("returns racers data from context", () => {
      const mockContextValue: DataContextType = {
        seasons: [],
        racers: mockRacers,
        isLoading: false,
        error: null,
        refreshSeasons: vi.fn(),
        refreshRacers: vi.fn(),
        refreshAll: vi.fn(),
      };

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useRacers(), { wrapper });

      expect(result.current.data).toEqual(mockRacers);
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

      const { result } = renderHook(() => useRacers(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toEqual([]);
    });

    it("returns error state when fetch fails", () => {
      const testError = new Error("Failed to fetch racers");
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

      const { result } = renderHook(() => useRacers(), { wrapper });

      expect(result.current.error).toEqual(testError);
      expect(result.current.data).toEqual([]);
    });
  });

  describe("When refreshing racers", () => {
    it("calls refresh function", () => {
      const mockRefresh = vi.fn();
      const mockContextValue: DataContextType = {
        seasons: [],
        racers: mockRacers,
        isLoading: false,
        error: null,
        refreshSeasons: vi.fn(),
        refreshRacers: mockRefresh,
        refreshAll: vi.fn(),
      };

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useRacers(), { wrapper });

      result.current.refresh();

      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
