import styles from "./FormGroup.module.css";

type FormGroupProps = {
  element: string;
  type?: string;
  label: string;
  id?: string;
  children?: React.ReactNode;
  className?: string;
  placeholder?: string;
};

export default function FormGroup({
  element,
  type,
  label,
  id,
  children,
  className,
  placeholder,
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
