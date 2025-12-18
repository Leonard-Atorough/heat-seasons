import { Card } from "../../common/Card";
import { Button } from "../../common/Button";
import styles from "./DriverCard.module.css";
import { useNavigate } from "react-router-dom";

export interface TempRacerModel {
  id: string;
  name: string;
  team: string;
  points: number;
  badgeUrl?: string;
  profileUrl?: string;
  teamColor?: string;
}

export interface RacerCardProps {
  racer: TempRacerModel;
}

export default function RacerCard({ racer }: RacerCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      variant="compact"
      className={styles.racerCard}
      onClick={() => navigate(`/racers/${racer.id}`)}
      style={{ backgroundColor: racer.teamColor || "inherit" }}
    >
      {/* F1 style. Info on the left, picture on the right, card clickable. Card colour set to teamColor */}
      <div className={styles.racerCard__info}>
        <h3 className={styles.racerCard__name}>{racer.name}</h3>
        <p className={styles.racerCard__team} style={{ color: racer.teamColor || "inherit" }}>
          {racer.team}
        </p>
        <p className={styles.racerCard__points}>{racer.points} pts</p>
        {racer.badgeUrl && (
          <img
            src={racer.badgeUrl}
            alt={`${racer.name} badge`}
            className={styles.racerCard__badge}
          />
        )}
        {racer.profileUrl && (
          <Button variant="primary" onClick={() => navigate(`/racers/${racer.id}`)} type="button">
            View Profile
          </Button>
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
