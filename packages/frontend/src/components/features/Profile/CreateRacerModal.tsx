import { useState } from "react";
import { FormGroup, Modal, Button, Toast } from "../../common";
import { createRacer } from "../../../services/api/racer";
import styles from "./CreateRacerModal.module.css";

export interface CreateRacerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the new racer id after a successful create. */
  onCreated: () => void;
}

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

export function CreateRacerModal({ isOpen, onClose, onCreated }: CreateRacerModalProps) {
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [teamColor, setTeamColor] = useState(TEAM_COLORS[0].value);
  const [nationality, setNationality] = useState("");
  const [age, setAge] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  const reset = () => {
    setName("");
    setTeam("");
    setTeamColor(TEAM_COLORS[0].value);
    setNationality("");
    setAge("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !team.trim() || !nationality.trim() || !age) {
      setError({ title: "Error", message: "All fields are required." });
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      setError({ title: "Error", message: "Please enter a valid age." });
      return;
    }

    setIsSubmitting(true);
    try {
      await createRacer({
        name: name.trim(),
        team: team.trim(),
        teamColor,
        nationality: nationality.trim(),
        age: parsedAge,
        active: true,
      });
      reset();
      onCreated();
    } catch (err: any) {
      const message = err?.data?.message ?? err?.message ?? "Failed to create racer.";
      // 409 means the user already has a linked racer
      if (err?.status === 409 || message.toLowerCase().includes("already")) {
        setError({ title: "Error", message: "You already have a racer linked to your account." });
      } else {
        setError({ title: "Error", message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Your Racer">
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && (
          <Toast
            type="error"
            title={error.title}
            message={error.message}
            onClose={() => setError(null)}
          />
        )}
        <FormGroup
          element="input"
          label="Racer Name"
          id="racerName"
          type="text"
          placeholder="e.g. Lewis Hamilton"
          value={name}
          onChange={(e) => setName((e.target as HTMLInputElement).value)}
        />
        <FormGroup
          element="input"
          label="Team"
          id="racerTeam"
          type="text"
          placeholder="e.g. Mercedes AMG"
          value={team}
          onChange={(e) => setTeam((e.target as HTMLInputElement).value)}
        />
        <FormGroup element="default" label="Team Colour" id="racerTeamColor">
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
          id="racerNationality"
          type="text"
          placeholder="e.g. British"
          value={nationality}
          onChange={(e) => setNationality((e.target as HTMLInputElement).value)}
        />
        <FormGroup
          element="input"
          label="Age"
          id="racerAge"
          type="number"
          placeholder="e.g. 30"
          value={age}
          onChange={(e) => setAge((e.target as HTMLInputElement).value)}
        />
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Racer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
