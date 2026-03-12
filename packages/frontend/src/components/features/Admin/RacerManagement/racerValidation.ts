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
