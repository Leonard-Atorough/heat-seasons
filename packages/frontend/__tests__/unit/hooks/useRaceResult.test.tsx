import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { useRaceResult } from "src/hooks/data/useRaceResult";
import { createMockRace, mockRacers } from "tests/utils/fixtures";

vi.mock("src/hooks/data/useRacer", () => ({
  useRacers: vi.fn(),
}));

vi.mock("src/services/api/races", () => ({
  GetRacesBySeason: vi.fn(),
}));

import { useRacers } from "src/hooks/data/useRacer";
import { GetRacesBySeason } from "src/services/api/races";
import { RacerWithStats } from "shared";

const mockedUseRacers = vi.mocked(useRacers);
const mockedGetRacesBySeason = vi.mocked(GetRacesBySeason);

const race1 = createMockRace({
  id: "race-1",
  results: [
    { racerId: "racer-1", position: 2, points: 18, constructorPoints: 18 },
    { racerId: "racer-2", position: 1, points: 25, constructorPoints: 25 },
  ],
});

const race2 = createMockRace({
  id: "race-2",
  results: [
    { racerId: "racer-1", position: 1, points: 25, constructorPoints: 25 },
    { racerId: "racer-2", position: 2, points: 18, constructorPoints: 18 },
  ],
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("useRaceResult hook", () => {
  // 1. Does not fetch races when season id is empty
  // 2. Fetches races and aggregates results when race id is empty
  // 3. Returns race-specific results sorted by position when race id is selected
  // 4. Sets race-not-found error when selected race does not exist
  // 5. Skips results computation while racers are loading

  it("does not fetch races when season id is empty", () => {
    mockedUseRacers.mockReturnValue({
      data: mockRacers as RacerWithStats[],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    const { result } = renderHook(() => useRaceResult("", ""));

    expect(mockedGetRacesBySeason).not.toHaveBeenCalled();
    expect(result.current.races).toEqual([]);
    expect(result.current.results).toEqual([]);
  });

  it("fetches races and aggregates standings when race id is empty", async () => {
    mockedUseRacers.mockReturnValue({
      data: mockRacers as RacerWithStats[],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });
    mockedGetRacesBySeason.mockResolvedValue([race1, race2]);

    const { result } = renderHook(() => useRaceResult("season-1", ""));

    await waitFor(() => {
      expect(mockedGetRacesBySeason).toHaveBeenCalledWith("season-1");
      expect(result.current.races).toHaveLength(2);
      expect(result.current.results).toEqual([
        { racerId: "racer-1", position: 1, points: 43, constructorPoints: 43 },
        { racerId: "racer-2", position: 2, points: 43, constructorPoints: 43 },
      ]);
    });
  });

  it("returns selected race results sorted by position", async () => {
    mockedUseRacers.mockReturnValue({
      data: mockRacers as RacerWithStats[],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });
    mockedGetRacesBySeason.mockResolvedValue([race1]);

    const { result } = renderHook(() => useRaceResult("season-1", "race-1"));

    await waitFor(() => {
      expect(result.current.results).toEqual([
        { racerId: "racer-2", position: 1, points: 25, constructorPoints: 25 },
        { racerId: "racer-1", position: 2, points: 18, constructorPoints: 18 },
      ]);
    });
  });

  it("sets error when selected race is not found", async () => {
    mockedUseRacers.mockReturnValue({
      data: mockRacers as RacerWithStats[],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });
    mockedGetRacesBySeason.mockResolvedValue([race1]);

    const { result } = renderHook(() => useRaceResult("season-1", "race-missing"));

    await waitFor(() => {
      expect(result.current.error).toBe("Race not found");
    });
  });

  it("does not compute results while racers are loading", async () => {
    mockedUseRacers.mockReturnValue({
      data: mockRacers as RacerWithStats[],
      isLoading: true,
      error: null,
      refresh: vi.fn(),
    });
    mockedGetRacesBySeason.mockResolvedValue([race1]);

    const { result } = renderHook(() => useRaceResult("season-1", ""));

    await waitFor(() => {
      expect(result.current.races).toHaveLength(1);
    });

    expect(result.current.results).toEqual([]);
  });
});
