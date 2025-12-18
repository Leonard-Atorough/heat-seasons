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
      className={`${styles[`btn__${variant}`]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

interface ButtonProps {
  type: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "tertiary" | "danger" | "link";
  className?: string;
  onClick?: (event: React.FormEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}
