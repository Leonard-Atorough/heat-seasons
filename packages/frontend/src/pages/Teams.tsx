import { Racer } from "@shared/index";
import { useEffect, useMemo } from "react";
import { TeamCard } from "../components/features";
import styles from "./Teams.module.css";
import { useRacers } from "../hooks/data/useRacer";

interface Team {
  name: string;
  color?: string;
  racers: Racer[];
}

export function Teams() {
  const { data: racers, refresh } = useRacers();

  const handleRefresh = async () => {
    await refresh();
  };

  // we could periodically refresh the racers data every 10 minutes to ensure it's up to date
  useEffect(() => {
    handleRefresh();
    const intervalId = setInterval(handleRefresh, 10 * 60 * 1000); // refresh every 10 minutes
    return () => clearInterval(intervalId); // cleanup on unmount
  }, []);

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
      <h1>Heat Teams: Winter 2026</h1>
      <p>Explore the teams competing in the current winter season.</p>
      <div className={styles.teamsGrid}>
        {teams.map((team: Team) => (
          <TeamCard
            key={team.name}
            teamName={team.name}
            teamColor={team.color}
            racers={team.racers.map((racer: Racer) => racer.name)}
          />
        ))}
      </div>
    </div>
  );
}
