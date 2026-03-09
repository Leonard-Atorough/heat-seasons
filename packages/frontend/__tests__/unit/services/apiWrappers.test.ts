import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("src/services/apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from "src/services/apiClient";
import * as seasonApi from "src/services/api/season";
import * as racesApi from "src/services/api/races";
import * as racerApi from "src/services/api/racer";

const mockedClient = vi.mocked(apiClient);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("API wrapper functions", () => {
  describe("season API", () => {
    it("getSeasons calls apiClient.get", async () => {
      mockedClient.get.mockResolvedValueOnce([]);
      await seasonApi.getSeasons();
      expect(mockedClient.get).toHaveBeenCalledWith("/seasons");
    });

    it("getSeasonById calls apiClient.get with id", async () => {
      mockedClient.get.mockResolvedValueOnce({ id: "s1" });
      await seasonApi.getSeasonById("s1");
      expect(mockedClient.get).toHaveBeenCalledWith("/seasons/s1");
    });

    it("createSeason posts correct body", async () => {
      const ret = { id: "new" };
      mockedClient.post.mockResolvedValueOnce(ret);
      await seasonApi.createSeason("Name", "2024-01-01", "2024-02-01");
      expect(mockedClient.post).toHaveBeenCalledWith("/seasons", {
        name: "Name",
        startDate: "2024-01-01",
        endDate: "2024-02-01",
      });
    });

    it("updateSeason excludes undefined fields", async () => {
      mockedClient.put.mockResolvedValueOnce({ id: "s1" });
      await seasonApi.updateSeason("s1", { name: "New", status: undefined });
      expect(mockedClient.put).toHaveBeenCalledWith("/seasons/s1", { name: "New" });
    });

    it("deleteSeason calls delete", async () => {
      mockedClient.delete.mockResolvedValueOnce({});
      await seasonApi.deleteSeason("s1");
      expect(mockedClient.delete).toHaveBeenCalledWith("/seasons/s1");
    });

    it("getSeasonParticipants calls correct endpoint", async () => {
      mockedClient.get.mockResolvedValueOnce([]);
      await seasonApi.getSeasonParticipants("s1");
      expect(mockedClient.get).toHaveBeenCalledWith("/seasons/s1/participants");
    });

    it("joinSeason posts to join endpoint", async () => {
      mockedClient.post.mockResolvedValueOnce({});
      await seasonApi.joinSeason("s1", "r1");
      expect(mockedClient.post).toHaveBeenCalledWith("/seasons/s1/join/r1", {});
    });
  });

  describe("races API", () => {
    it("GetRacesBySeason builds query", async () => {
      mockedClient.get.mockResolvedValueOnce([]);
      await racesApi.GetRacesBySeason("season-1");
      expect(mockedClient.get).toHaveBeenCalledWith("/races?seasonId=season-1");
    });

    it("GetRaceById calls correct path", async () => {
      mockedClient.get.mockResolvedValueOnce({ id: "race-1" });
      await racesApi.GetRaceById("race-1");
      expect(mockedClient.get).toHaveBeenCalledWith("/races/race-1");
    });

    it("CreateRace posts with seasonId query and body", async () => {
      mockedClient.post.mockResolvedValueOnce({ id: "race-new" });
      const results = [{ racerId: "r1", points: 10, constructorPoints: 10 }];
      await racesApi.CreateRace("season-1", "Name", "2025-01-01", results as any);
      expect(mockedClient.post).toHaveBeenCalledWith("/races?seasonId=season-1", {
        name: "Name",
        date: "2025-01-01",
        results,
      });
    });

    it("UpdateRace puts to correct path", async () => {
      mockedClient.put.mockResolvedValueOnce({ id: "race-1" });
      const results = [{ racerId: "r1", points: 10, constructorPoints: 10 }];
      await racesApi.UpdateRace("race-1", "Name", "2025-01-01", results as any);
      expect(mockedClient.put).toHaveBeenCalledWith("/races/race-1", {
        name: "Name",
        date: "2025-01-01",
        results,
      });
    });
  });

  describe("racer API", () => {
    it("getAllRacers calls get /racers", async () => {
      mockedClient.get.mockResolvedValueOnce([]);
      await racerApi.getAllRacers();
      expect(mockedClient.get).toHaveBeenCalledWith("/racers");
    });

    it("getRacerById calls path", async () => {
      mockedClient.get.mockResolvedValueOnce({ id: "r1" });
      await racerApi.getRacerById("r1");
      expect(mockedClient.get).toHaveBeenCalledWith("/racers/r1");
    });

    it("getMyRacer calls /racers/me", async () => {
      mockedClient.get.mockResolvedValueOnce({ id: "me" });
      await racerApi.getMyRacer();
      expect(mockedClient.get).toHaveBeenCalledWith("/racers/me");
    });

    it("createRacer posts data", async () => {
      mockedClient.post.mockResolvedValueOnce({ id: "r-new" });
      const payload = { name: "x", team: "t", teamColor: "#000", nationality: "n", age: 30 };
      await racerApi.createRacer(payload as any);
      expect(mockedClient.post).toHaveBeenCalledWith("/racers", payload);
    });

    it("updateRacer puts data", async () => {
      mockedClient.put.mockResolvedValueOnce({ id: "r1" });
      const payload = { name: "New" };
      await racerApi.updateRacer("r1", payload as any);
      expect(mockedClient.put).toHaveBeenCalledWith("/racers/r1", payload);
    });
  });
});
