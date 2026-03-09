import { DataContextType } from "src/contexts";

export const createMockDataContext = (overrides?: Partial<DataContextType>): DataContextType => ({
  seasons: [],
  racers: [],
  isLoading: false,
  error: null,
  refreshSeasons: vi.fn(),
  refreshRacers: vi.fn(),
  refresh: vi.fn(),
  ...overrides,
});
