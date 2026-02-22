import { Card } from "../../../components/common";
import styles from "./PodiumCard.module.css";

export interface PodiumCardProps {
  medal: "gold" | "silver" | "bronze";
  medalImageEmoji: string;
    teamColor: string;
  racerName: string;
  racerTeam: string;
  racerNationality: string;
  points: number;
  imageUrl: string | null;
}

export default function PodiumCard({
  medal,
  medalImageEmoji,
  teamColor,
  racerName,
  racerTeam,
  racerNationality,
  points,
  imageUrl,
}: PodiumCardProps) {
  return (
    <Card className={`${styles.podiumCard} ${styles[`podiumCard--${medal}`]}`} style={{ backgroundColor: teamColor }}>
      <div>
        <div className={styles.podiumCard__medal}>{medalImageEmoji}</div>
        <div className={styles.podiumCard__name}>{racerName}</div>
        <div className={styles.podiumCard__team}>{racerTeam}</div>
        <div className={styles.podiumCard__nationality}>{racerNationality}</div>
      </div>
      <div className={styles.podiumCard__points}>{points} pts</div>
      <div className={styles.podiumCard__image}>
        {imageUrl && <img src={imageUrl} alt={racerName} />}
      </div>
    </Card>
  );
}
