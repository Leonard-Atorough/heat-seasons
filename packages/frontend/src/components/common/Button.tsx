import styles from "./Button.module.css";

// Allow callers to pass through any native HTML button attribute (aria-*,
// data-*, id, role, etc.) without having to enumerate them explicitly here.
type NativeButtonExtras = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "type" | "onClick" | "className" | "disabled" | "children"
>;

export interface ButtonProps extends NativeButtonExtras {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "tertiary" | "danger" | "link" | "ghost" | "none";
  className?: string;
  onClick?: (event: React.FormEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function Button({
  type = "button",
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
  children,
  ...rest
}: ButtonProps) {
  // `styles[`btn__${variant}`]` is undefined for the "none" variant (no built-in
  // styling), so coerce to empty string to avoid rendering the literal "undefined"
  // as a class name.
  const variantClass = styles[`btn__${variant}`] ?? "";

  return (
    <button
      {...rest}
      type={type}
      className={`${variantClass} ${className}`.trim()}
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
