import { Racer } from "shared";
import {  useMemo } from "react";
import { Team } from "../models";
import { TeamCard } from "../components/features";
import styles from "./Teams.module.css";
import { useRacers } from "../hooks/data/useRacer";
import { LoadingSkeletonCard } from "../components/common";

export function Teams() {
  const { data: racers, isLoading } = useRacers();
  const teams = useMemo<Team[]>(() => {
    if (!racers) return [];
    const teamMap: { [key: string]: Team } = {};
    racers.forEach((racer) => {
      if (!teamMap[racer.team]) {
        teamMap[racer.team] = { name: racer.team, color: racer.teamColor, racers: [] };
      }
      teamMap[racer.team].racers.push(racer);
    });
    return Object.values(teamMap);
  }, [racers]);

  return (
    <div className="container">
      <h1 className={styles.teamsPage__title}>Heat Teams: Winter 2026</h1>
      <p>Explore the teams competing in the current winter season.</p>
      <div className={styles.teamsGrid}>
        {teams.map((team: Team) =>
          isLoading ? (
            <LoadingSkeletonCard
              key={team.name}
              lines={1}
              height="300px"
              includeTitle={true}
              testId={`teams-page-loading-skeleton-${team.name}`}
            />
          ) : (
            <TeamCard
              key={team.name}
              teamName={team.name}
              teamColor={team.color}
              racers={team.racers.map((racer: Racer) => racer.name)}
            />
          ),
        )}
      </div>
    </div>
  );
}
