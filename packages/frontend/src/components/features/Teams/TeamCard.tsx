import { Card } from "../../common/Card";
import styles from "./TeamCard.module.css";

export interface TeamCardProps {
  teamName: string;
  teamColor?: string;
  drivers: string[];
}
export default function TeamCard({ teamName, teamColor, drivers }: TeamCardProps) {
  return (
    <Card
      variant="default"
      className={styles.teamCard}
      style={{
        backgroundImage: `linear-gradient(to right, ${teamColor || "var(--card-white)"} 60%, white 100%)`,
      }}
    >
      <div className={styles.teamCard__info}>
        <h3 className={styles.teamCard__name}>{teamName}</h3>
        <ul className={styles.teamCard__drivers}>
          {drivers.map((driver) => (
            <li key={driver} className={styles.teamCard__driver}>
              {driver}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.teamCard__logo}>
        <img
          src={`https://avatar.iran.liara.run/public/${encodeURIComponent(teamName)}`}
          alt={`${teamName} Logo`}
          style={{ width: "100%", height: "auto", marginTop: "auto" }}
        />
      </div>
    </Card>
  );
}
