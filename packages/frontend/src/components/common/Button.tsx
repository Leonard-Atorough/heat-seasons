import styles from "./Button.module.css";

export function Button({
  type = "button",
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
  children,
}: ButtonProps) {
  return (
    <button
      type={type}
      role="button"
      className={`${styles[`btn__${variant}`]} ${className}`}
      onClick={onClick}
      disabled={disabled}
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
    </button>
  );
}

export interface ButtonProps {
  type: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "tertiary" | "danger" | "link" | "ghost";
  className?: string;
  onClick?: (event: React.FormEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}
