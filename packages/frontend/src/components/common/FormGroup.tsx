import styles from "./FormGroup.module.css";

export interface FormGroupProps {
  element: string;
  type?: string;
  label: string;
  id?: string;
  /** Separate `name` attribute for the input. Defaults to `id` when omitted. */
  name?: string;
  children?: React.ReactNode;
  className?: string;
  placeholder?: string;
  value?: string | number;
  disabled?: boolean;
  /** Marks the field as required: passes the `required` attribute to the input
   *  and renders a visible asterisk next to the label (hidden from screen readers
   *  since the `required` attribute conveys the same semantic). */
  required?: boolean;
  /** Per-field validation error. Renders an error message below the input and
   *  wires up `aria-invalid` + `aria-describedby` so assistive technology can
   *  announce the error without requiring focus to move. */
  error?: string;
  /** Optional hint / helper text rendered below the label. Linked to the input
   *  via `aria-describedby`. */
  hint?: string;
  /** Forwarded to the underlying `<input>` — useful for `type="number"` fields. */
  min?: number | string;
  /** Forwarded to the underlying `<input>` — useful for `type="number"` fields. */
  max?: number | string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function FormGroup({
  element,
  type,
  label,
  id,
  name,
  children,
  className,
  placeholder,
  value,
  disabled,
  required,
  error,
  hint,
  min,
  max,
  onChange,
}: FormGroupProps) {
  const errorId = error && id ? `${id}-error` : undefined;
  const hintId = hint && id ? `${id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const labelNode = (
    <label className={styles.formGroup__label} htmlFor={id}>
      {label}
      {required && (
        <span className={styles.formGroup__required} aria-hidden="true">
          {" "}*
        </span>
      )}
    </label>
  );

  const hintNode = hint && (
    <span id={hintId} className={styles.formGroup__hint}>
      {hint}
    </span>
  );

  const errorNode = error && (
    <span
      id={errorId}
      className={styles.formGroup__error}
      role="alert"
      aria-live="polite"
    >
      {error}
    </span>
  );

  switch (element) {
    case "input":
      return (
        <div className={`${styles.formGroup} ${className || ""}`}>
          {labelNode}
          {hintNode}
          <input
            type={type}
            id={id}
            name={name ?? id}
            className={`${styles.formGroup__input}${error ? ` ${styles["formGroup__input--error"]}` : ""}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            aria-required={required ? "true" : undefined}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={describedBy}
            min={min}
            max={max}
          />
          {errorNode}
        </div>
      );
    case "textarea":
      return (
        <div className={`${styles.formGroup} ${className || ""}`}>
          {labelNode}
          {hintNode}
          <textarea
            id={id}
            name={name ?? id}
            className={`${styles.formGroup__textarea}${error ? ` ${styles["formGroup__textarea--error"]}` : ""}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            aria-required={required ? "true" : undefined}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={describedBy}
          />
          {errorNode}
        </div>
      );
    default:
      return (
        <div className={`${styles.formGroup} ${className || ""}`}>
          {labelNode}
          {hintNode}
          {children}
          {errorNode}
        </div>
      );
  }
}
