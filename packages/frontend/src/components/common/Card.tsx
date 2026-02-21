import styles from "./Card.module.css";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "compact";
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
}

export function Card({ children, className = "", variant = "default", style, onClick }: CardProps) {
  const cardClasses = `${styles.card} ${styles[`card__${variant}`]} ${className}`;

  return (
    <div className={cardClasses} style={style} onClick={onClick}>
      {children}
    </div>
  );
}
