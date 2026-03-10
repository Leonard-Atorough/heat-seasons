import { AdminCreateRacerInput } from "../../../../services/api/admin";

export const EMPTY_FORM: AdminCreateRacerInput = {
  name: "",
  team: "",
  teamColor: "#e63946",
  nationality: "",
  age: 25,
  active: true,
  badgeUrl: "",
  userId: "",
};

export type FormErrors = Partial<Record<keyof AdminCreateRacerInput, string>>;

export function validate(form: AdminCreateRacerInput): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Racer name is required.";
  } else if (form.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!form.nationality.trim()) {
    errors.nationality = "Nationality is required.";
  } else if (form.nationality.trim().length < 2) {
    errors.nationality = "Nationality must be at least 2 characters.";
  }

  if (!form.team.trim()) {
    errors.team = "Team name is required.";
  } else if (form.team.trim().length < 2) {
    errors.team = "Team must be at least 2 characters.";
  }

  const age = Number(form.age);
  if (!age || age < 16 || age > 80) {
    errors.age = "Age must be between 16 and 80.";
  }

  const badge = form.badgeUrl?.trim();
  if (badge) {
    try {
      new URL(badge);
    } catch {
      errors.badgeUrl = "Badge URL must be a valid URL (e.g. https://...).";
    }
  }

  return errors;
}
