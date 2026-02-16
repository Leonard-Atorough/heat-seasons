import { ISeasonRepository } from "../season/season.repository.interface.js";
import { IRaceRepository } from "../race/race.repository.interface.js";
import { ILeaderboardService } from "./leaderboard.service.interface.js";
import { IRacerRepository } from "../racer/racer.repository.interface.js";
import { Leaderboard, LeaderboardEntry } from "shared";
import { NotFoundError } from "src/errors/appError.js";

export class LeaderboardService implements ILeaderboardService {
  constructor(
    private seasonRepository: ISeasonRepository,
    private raceRepository: IRaceRepository,
    private racerRepository: IRacerRepository,
  ) {}

  async getCurrentSeasonLeaderboard(): Promise<Leaderboard> {
    const leaderboardEntries: LeaderboardEntry[] = [];

    const season = await this.seasonRepository.findActive();
    if (!season) {
      throw new NotFoundError("No active season found");
    }
    const seasonId = season.id;

    const races = await this.raceRepository.findBySeasonId(seasonId);
    if (!races || races.length === 0) {
      throw new NotFoundError("No races found for current season");
    }

    const resultsMap: Map<string, LeaderboardEntry> = new Map();

    for (const race of races) {
      for (const result of race.results) {
        const { racerId, position, points } = result;
        if (!resultsMap.has(racerId)) {
          this.createLeaderboardEntry(resultsMap, racerId, points, position);
        } else {
          this.updateLeaderboardEntry(resultsMap, racerId, position, points);
        }
      }
    }

    const racers = await this.racerRepository.findByIds(Array.from(resultsMap.keys()));
    if (!racers || racers.length === 0) {
      throw new NotFoundError("No racers found for leaderboard");
    }

    for (const racer of racers) {
      const entry = resultsMap.get(racer.id!);
      if (entry) {
        entry.racerName = racer.name;
        entry.team = racer.team;
      }
    }

    leaderboardEntries.push(...resultsMap.values());

    leaderboardEntries.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (a.avgPosition !== b.avgPosition) {
        return a.avgPosition - b.avgPosition;
      }
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      if (b.podiums !== a.podiums) {
        return b.podiums - a.podiums;
      }
      return a.racerName.localeCompare(b.racerName);
    });

    const leaderboard: Leaderboard = {
      seasonId: season.id,
      seasonName: season.name,
      asOfDate: new Date(),
      standings: leaderboardEntries,
    };

    return leaderboard;
  }

  async getSeasonLeaderboard(seasonId: string): Promise<Leaderboard> {
    throw new Error("Not implemented");
  }

  async getAllTimeStats(): Promise<any[]> {
    throw new Error("Not implemented");
  }

  private createLeaderboardEntry(
    resultsMap: Map<string, LeaderboardEntry>,
    racerId: string,
    points: number,
    position: number,
    team: string = "",
  ) {
    resultsMap.set(racerId, {
      racerId,
      racerName: "",
      totalPoints: points,
      racesParticipated: 1,
      wins: position === 1 ? 1 : 0,
      podiums: position <= 3 ? 1 : 0,
      positions: [position],
      avgPosition: position,
      team,
    });
  }

  private updateLeaderboardEntry(
    resultsMap: Map<string, LeaderboardEntry>,
    racerId: string,
    position: number,
    points: number,
  ) {
    const resultEntry = resultsMap.get(racerId) as LeaderboardEntry;
    resultEntry.positions.push(position);
    resultEntry.racesParticipated += 1;
    resultEntry.totalPoints += points;
    resultEntry.wins += position === 1 ? 1 : 0;
    resultEntry.podiums += position <= 3 ? 1 : 0;
    resultEntry.avgPosition =
      resultEntry.positions.reduce((a, b) => a + b, 0) / resultEntry.racesParticipated;
  }
}
