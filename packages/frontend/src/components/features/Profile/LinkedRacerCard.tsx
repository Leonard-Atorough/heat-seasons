import { RacerWithStats } from "shared";
import { Card } from "../../common/Card";
import { Button } from "../../common/Button";
import styles from "./LinkedRacerCard.module.css";

export interface LinkedRacerCardProps {
  racer: RacerWithStats;
  onEdit?: () => void;
}

export function LinkedRacerCard({ racer, onEdit }: LinkedRacerCardProps) {
  const stats = racer.stats;

  return (
    <Card
      className={styles.racerCard}
      style={{
        backgroundImage: `linear-gradient(135deg, ${racer.teamColor || "var(--card-white)"} 0%, var(--card-white, white) 60%)`,
      }}
    >
      <div className={styles.racerCard__header}>
        <div>
          <h3 className={styles.racerCard__name}>{racer.name}</h3>
          <p className={styles.racerCard__team}>{racer.team}</p>
          <span className={styles.racerCard__nationality}>{racer.nationality}</span>
        </div>
        <div className={styles.racerCard__headerRight}>
          {onEdit && (
            <Button type="button" variant="ghost" onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className={styles.racerCard__meta}>
        <span className={styles.racerCard__metaItem}>
          Age <strong>{racer.age}</strong>
        </span>
        <span className={styles.racerCard__metaItem}>
          Status{" "}
          <strong
            className={
              racer.active
                ? styles["racerCard__status--active"]
                : styles["racerCard__status--inactive"]
            }
          >
            {racer.active ? "Active" : "Inactive"}
          </strong>
        </span>
      </div>

      {
        <div className={styles.racerCard__stats}>
          <div className={styles.stat}>
            <span className={styles.stat__value}>{stats?.totalPoints}</span>
            <span className={styles.stat__label}>Points</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.stat__value}>{stats?.totalRaces}</span>
            <span className={styles.stat__label}>Races</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.stat__value}>{stats?.wins}</span>
            <span className={styles.stat__label}>Wins</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.stat__value}>{stats?.podiums}</span>
            <span className={styles.stat__label}>Podiums</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.stat__value}>
              {stats?.avgPosition != null && stats.avgPosition > 0
                ? stats.avgPosition.toFixed(1)
                : "—"}
            </span>
            <span className={styles.stat__label}>Avg Pos</span>
          </div>
        </div>
      }

      {/*TODO: Implement details in here <Button onClick={() => navigate(`/racers/${racer.id}`, { state: { racer } })} variant="primary" type="button" className={styles.racerCard__viewButton}>
        View Details
      </Button> */}
    </Card>
  );
}
