import { LeaderboardEntry, Race, RaceResult, ValidationResult } from "./models";

/**
 * Validate race results
 */
export function validateRaceResults(results: RaceResult[]): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(results)) {
    return { valid: false, errors: ["Results must be an array"] };
  }

  // Check racer count
  if (results.length < 2 || results.length > 9) {
    errors.push("Race must have between 2 and 9 racers");
  }

  // Check for duplicate racers
  const racerIds = results.map((r) => r.racerId);
  const uniqueRacers = new Set(racerIds);
  if (racerIds.length !== uniqueRacers.size) {
    errors.push("Duplicate racers are not allowed");
  }

  // Check for duplicate positions
  const positions = results.map((r) => r.position);
  const uniquePositions = new Set(positions);
  if (positions.length !== uniquePositions.size) {
    errors.push("Duplicate positions are not allowed");
  }

  // Check positions are sequential starting from 1
  const sortedPositions = [...positions].sort((a, b) => a - b);
  for (let i = 0; i < sortedPositions.length; i++) {
    if (sortedPositions[i] !== i + 1) {
      errors.push("Positions must be sequential starting from 1");
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate points for a position based on points system
 */
export function calculatePoints(position: number, pointsSystem: Record<number, number>): number {
  return pointsSystem[position] || 0;
}

/**
 * Calculate leaderboard from race results
 */
export function calculateLeaderboard(
  races: Race[],
  pointsSystem: Record<number, number>,
): LeaderboardEntry[] {
  const standings: Record<string, Omit<LeaderboardEntry, "avgPosition">> = {};

  races.forEach((race) => {
    race.results.forEach((result) => {
      const racerId = result.racerId;

      if (!standings[racerId]) {
        standings[racerId] = {
          racerId,
          racerName: result.racerName,
          totalPoints: 0,
          racesParticipated: 0,
          wins: 0,
          podiums: 0,
          positions: [],
        };
      }

      const points = calculatePoints(result.position, pointsSystem);
      standings[racerId].totalPoints += points;
      standings[racerId].racesParticipated++;
      standings[racerId].positions.push(result.position);

      if (result.position === 1) standings[racerId].wins++;
      if (result.position <= 3) standings[racerId].podiums++;
    });
  });

  // Calculate average position and sort
  const leaderboard: LeaderboardEntry[] = Object.values(standings).map((entry) => {
    const avgPosition = entry.positions.reduce((a, b) => a + b, 0) / entry.positions.length;
    return {
      ...entry,
      avgPosition: parseFloat(avgPosition.toFixed(2)),
    };
  });

  // Sort by total points (descending), then by races participated (ascending)
  leaderboard.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return a.racesParticipated - b.racesParticipated;
  });

  return leaderboard;
}
