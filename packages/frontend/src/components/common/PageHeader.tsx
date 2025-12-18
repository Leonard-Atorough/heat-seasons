import styles from "./PageHeader.module.css";

export type PageHeaderVariant = "hero" | "default" | "minimal";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  variant?: PageHeaderVariant;
  backgroundImage?: string;
  action?: React.ReactNode;
  height?: string;
}

export function PageHeader({
  title,
  subtitle,
  variant = "default",
  backgroundImage,
  action,
  height,
}: PageHeaderProps) {
  const baseClass = styles.pageHeader;
  const variantClass = styles[`pageHeader--${variant}`];

  if (variant === "hero") {
    return (
      <section
        className={`${baseClass} ${variantClass}`}
        style={{
          backgroundImage: backgroundImage
            ? `linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`
            : undefined,
          height: height || "80vh",
        }}
      >
        <h2 className={styles.pageHeader__title}>{title}</h2>
        {subtitle && <p className={styles.pageHeader__subtitle}>{subtitle}</p>}
        {action && <div className={styles.pageHeader__action}>{action}</div>}
      </section>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={`${baseClass} ${variantClass}`}>
        <h1 className={styles.pageHeader__title}>{title}</h1>
      </div>
    );
  }

  // default variant
  return (
    <div className={`${baseClass} ${variantClass}`}>
      <h1 className={styles.pageHeader__title}>{title}</h1>
      {subtitle && <p className={styles.pageHeader__subtitle}>{subtitle}</p>}
    </div>
  );
}
