import { Racer } from "@shared/index";
import { useMemo } from "react";
import { TeamCard } from "../components/features";
import styles from "./Teams.module.css";

interface TeamsProps {
  drivers?: Racer[];
}

interface Team {
  name: string;
  color?: string;
  drivers: Racer[];
}

export function Teams({ drivers }: TeamsProps) {
  const teams = useMemo<Team[]>(() => {
    if (!drivers) return [];
    const teamMap: { [key: string]: Team } = {};
    drivers.forEach((driver) => {
      if (!teamMap[driver.team]) {
        teamMap[driver.team] = { name: driver.team, color: driver.teamColor, drivers: [] };
      }
      teamMap[driver.team].drivers.push(driver);
    });
    return Object.values(teamMap);
  }, [drivers]);

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
            drivers={team.drivers.map((driver: Racer) => driver.name)}
          />
        ))}
      </div>
    </div>
  );
}
