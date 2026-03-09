import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { useRacers } from "src/hooks/data/useRacer";
import { DataContext, DataContextType } from "src/contexts";
import { mockRacers } from "tests/utils/fixtures";
import { RacerWithStats } from "shared";
import { createMockDataContext } from "tests/utils/mocks/dataContextMock";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useRacers hook", () => {
  describe("When calling useRacers", () => {
    it("returns racers data from context", () => {
      const mockContextValue: DataContextType = createMockDataContext({
        racers: mockRacers as RacerWithStats[],
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useRacers(), { wrapper });

      expect(result.current.data).toEqual(mockRacers);
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

      const { result } = renderHook(() => useRacers(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toEqual([]);
    });

    it("returns error state when fetch fails", () => {
      const testError = new Error("Failed to fetch racers");
      const mockContextValue: DataContextType = createMockDataContext({
        error: testError,
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useRacers(), { wrapper });

      expect(result.current.error).toEqual(testError);
      expect(result.current.data).toEqual([]);
    });

    it("returns error state when fetch fails", () => {
      const testError = new Error("Failed to fetch racers");
      const mockContextValue: DataContextType = createMockDataContext({
        error: testError,
      });

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
      const mockContextValue: DataContextType = createMockDataContext({
        racers: mockRacers as RacerWithStats[],
        refreshRacers: mockRefresh,
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <DataContext.Provider value={mockContextValue}>{children}</DataContext.Provider>
      );

      const { result } = renderHook(() => useRacers(), { wrapper });

      result.current.refresh();

      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
