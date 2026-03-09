import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { useSeasons, useActiveSeason } from "src/hooks/data/useSeason";
import { DataContext, DataContextType } from "src/contexts";
import { createSeason } from "tests/utils/fixtures";
import { createMockDataContext } from "tests/utils/mocks/dataContextMock";

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
      const mockContextValue: DataContextType = createMockDataContext({
        seasons: mockSeasons,
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useSeasons(), { wrapper });

      expect(result.current.data).toEqual(mockSeasons);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("returns loading state when fetching", () => {
      const mockContextValue: DataContextType = createMockDataContext({
        isLoading: true,
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useSeasons(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toEqual([]);
    });

    it("returns error state when fetch fails", () => {
      const testError = new Error("Failed to fetch seasons");
      const mockContextValue: DataContextType = createMockDataContext({
        error: testError,
      });

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
      const mockContextValue: DataContextType = createMockDataContext({
        seasons: mockSeasons,
        refreshSeasons: mockRefresh,
      });

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
      const mockContextValue: DataContextType = createMockDataContext({
        seasons: mockSeasons,
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useActiveSeason(), { wrapper });

      expect(result.current.data).toEqual(mockSeasons[0]);
      expect(result.current.data?.name).toBe("Winter 2026");
      expect(result.current.data?.status).toBe("active");
    });

    it("returns null when no active season exists", () => {
      const mockContextValue: DataContextType = createMockDataContext({
        seasons: [mockSeasons[1]], // Only completed season
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useActiveSeason(), { wrapper });

      expect(result.current.data).toBeUndefined();
    });
  });
});
