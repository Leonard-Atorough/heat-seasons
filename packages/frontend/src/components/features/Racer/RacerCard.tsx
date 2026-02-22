import { Card } from "../../common/Card";
import styles from "./RacerCard.module.css";
import { useNavigate } from "react-router-dom";
import { RacerWithStats } from "shared";

export interface RacerCardProps {
  racer: RacerWithStats;
}

export default function RacerCard({ racer }: RacerCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      variant="compact"
      className={styles.racerCard}
      onClick={() => navigate(`/racers/${racer.id}`, { state: { racer } })}
      style={{
        backgroundImage: `linear-gradient(150deg, ${racer.teamColor || "var(--card-white)"} 50%, white 100%)`,
      }}
    >
      <div className={styles.racerCard__info}>
        <div className={styles.racerCard__details}>
          <h3 className={styles.racerCard__name}>{racer.name}</h3>
          <p className={styles.racerCard__team}>{racer.team}</p>
          <p className={styles.racerCard__points}>{racer.stats?.totalPoints ?? 0} pts</p>
        </div>
        <div className={styles.racerCard__nationality}>{racer.nationality}</div>
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
