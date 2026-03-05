import { useState } from "react";
import { RacerWithStats } from "shared";
import { FormGroup, Modal, Button } from "../../common";
import { updateRacer } from "../../../services/api/racer";
import styles from "./CreateRacerModal.module.css"; // same shape — reuse styles

const TEAM_COLORS = [
  { label: "Red", value: "#e8002d" },
  { label: "Blue", value: "#0600ef" },
  { label: "Orange", value: "#ff8000" },
  { label: "Green", value: "#00d2be" },
  { label: "Yellow", value: "#ffd700" },
  { label: "Purple", value: "#960000" },
  { label: "Silver", value: "#c0c0c0" },
  { label: "Black", value: "#1e1e1e" },
];

export interface EditRacerModalProps {
  racer: RacerWithStats;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditRacerModal({ racer, isOpen, onClose, onUpdated }: EditRacerModalProps) {
  const [name, setName] = useState(racer.name);
  const [team, setTeam] = useState(racer.team);
  const [teamColor, setTeamColor] = useState(
    TEAM_COLORS.some((c) => c.value === racer.teamColor) ? racer.teamColor : TEAM_COLORS[0].value,
  );
  const [nationality, setNationality] = useState(racer.nationality);
  const [age, setAge] = useState(String(racer.age));
  const [active, setActive] = useState(racer.active);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !team.trim() || !nationality.trim() || !age) {
      setError("All fields are required.");
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      setError("Please enter a valid age.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateRacer(racer.id, {
        name: name.trim(),
        team: team.trim(),
        teamColor,
        nationality: nationality.trim(),
        age: parsedAge,
        active,
      });
      onUpdated();
    } catch (err: any) {
      setError(err?.data?.message ?? err?.message ?? "Failed to update racer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Racer Profile">
      <form className={styles.form} onSubmit={handleSubmit}>
        <FormGroup
          element="input"
          label="Racer Name"
          id="editRacerName"
          type="text"
          value={name}
          onChange={(e) => setName((e.target as HTMLInputElement).value)}
        />
        <FormGroup
          element="input"
          label="Team"
          id="editRacerTeam"
          type="text"
          value={team}
          onChange={(e) => setTeam((e.target as HTMLInputElement).value)}
        />
        <FormGroup element="default" label="Team Colour" id="editRacerTeamColor">
          <div className={styles.colorPicker}>
            {TEAM_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`${styles.colorSwatch} ${teamColor === c.value ? styles["colorSwatch--selected"] : ""}`}
                style={{ backgroundColor: c.value }}
                title={c.label}
                onClick={() => setTeamColor(c.value)}
                aria-label={`${c.label}${teamColor === c.value ? " (selected)" : ""}`}
              />
            ))}
          </div>
        </FormGroup>
        <FormGroup
          element="input"
          label="Nationality"
          id="editRacerNationality"
          type="text"
          value={nationality}
          onChange={(e) => setNationality((e.target as HTMLInputElement).value)}
        />
        <FormGroup
          element="input"
          label="Age"
          id="editRacerAge"
          type="number"
          value={age}
          onChange={(e) => setAge((e.target as HTMLInputElement).value)}
        />
        <FormGroup element="default" label="Status" id="editRacerActive">
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <span>{active ? "Active" : "Inactive"}</span>
          </label>
        </FormGroup>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
