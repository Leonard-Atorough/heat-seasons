import styles from "./Card.module.css";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "compact";
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
  role?: string;
}

export function Card({
  children,
  className = "",
  variant = "default",
  style,
  onClick,
  role,
}: CardProps) {
  const cardClasses = `${styles.card} ${styles[`card__${variant}`]} ${className}`;

  return (
    <div
      className={cardClasses}
      style={style}
      onClick={onClick}
      role={role ?? (onClick ? "button" : undefined)}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              e.preventDefault();
              if (e.key === "Enter" || e.key === " ") onClick(e as any);
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
