import styles from "./FormGroup.module.css";

type FormGroupProps = {
  element: string;
  type?: string;
  label: string;
  id?: string;
  children?: React.ReactNode;
  className?: string;
  placeholder?: string;
  value?: string | number;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function FormGroup({
  element,
  type,
  label,
  id,
  children,
  className,
  placeholder,
  value,
  disabled,
  onChange,
}: FormGroupProps) {
  switch (element) {
    case "input":
      return (
        <div className={`${styles.formGroup} ${className || ""}`}>
          <label className={styles.formGroup__label} htmlFor={id}>
            {label}
          </label>
          <input
            type={type}
            id={id}
            name={id}
            className={`${styles.formGroup__input} ${className || ""}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      );
    case "textarea":
      return (
        <div className={`${styles.formGroup} ${className || ""}`}>
          <label className={styles.formGroup__label} htmlFor={id}>
            {label}
          </label>
          <textarea
            id={id}
            name={id}
            className={`${styles.formGroup__textarea} ${className || ""}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      );
    default:
      return (
        <div className={`${styles.formGroup} ${className || ""}`}>
          <label className={styles.formGroup__label} htmlFor={id}>
            {label}
          </label>
          {children}
        </div>
      );
  }
}
