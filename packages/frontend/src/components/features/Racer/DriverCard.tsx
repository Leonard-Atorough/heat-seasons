import { Card } from "../../common/Card";
import styles from "./DriverCard.module.css";
import { useNavigate } from "react-router-dom";
import { RacerWithStats } from "@shared/index";

export interface DriverCardProps {
  racer: RacerWithStats;
}

export default function DriverCard({ racer }: DriverCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      variant="compact"
      className={styles.racerCard}
      onClick={() => navigate(`/racers/${racer.id}`, { state: { racer } })}
      style={{ backgroundColor: racer.teamColor || "inherit" }}
    >
      <div className={styles.racerCard__info}>
        <h3 className={styles.racerCard__name}>{racer.name}</h3>
        <p className={styles.racerCard__team} style={{ color: racer.teamColor || "inherit" }}>
          {racer.team}
        </p>
        <p className={styles.racerCard__points}>{racer.stats?.totalPoints ?? 0} pts</p>
        {racer.badgeUrl && (
          <img
            src={racer.badgeUrl}
            alt={`${racer.name} badge`}
            className={styles.racerCard__badge}
          />
        )}  
      </div>
      <div className={styles.racerCard__picture}>
        <img
          src={racer.profileUrl || "/default-profile.png"}
          alt={racer.name}
          className={styles.racerCard__image}
        />
      </div>
    </Card>
  );
}
