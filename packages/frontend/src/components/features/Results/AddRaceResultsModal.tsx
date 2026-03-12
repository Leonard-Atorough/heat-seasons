import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";
import { Button, FormGroup, Modal, Toast } from "../../common";
import styles from "./AddRaceResultsModal.module.css";
import { Racer, RaceResult } from "shared";
import { CreateRace, UpdateRace, GetRaceById } from "../../../services/api/races";

const raceResultsSchema = z.object({
  raceName: z.string().trim().min(1, "Race name is required"),
  raceDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
  rows: z.array(
    z.object({
      points: z.number().min(0, "Points must be 0 or more"),
      isGhost: z.boolean(),
    }),
  ),
});

type RaceResultsFormValues = z.infer<typeof raceResultsSchema>;

interface RaceResultFormGroupProps {
  racers: Racer[];
  selectedRacerIds: string[];
  selectedRacerId: string;
  onRacerSelect: (racerId: string, prevRacerId?: string) => void;
  index: number;
  register: UseFormRegister<RaceResultsFormValues>;
  setValue: UseFormSetValue<RaceResultsFormValues>;
  errors?: FieldErrors<RaceResultsFormValues["rows"][number]>;
  isLoading: boolean;
}

function RaceResultFormGroup({
  racers,
  selectedRacerIds,
  selectedRacerId,
  onRacerSelect,
  index,
  register,
  setValue,
  errors,
  isLoading,
}: RaceResultFormGroupProps) {
  const [currentValue, setCurrentValue] = useState(selectedRacerId || "");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    onRacerSelect(next, currentValue || undefined);
    setCurrentValue(next);
    setValue(`rows.${index}.points`, 0);
  };

  return (
    <div className={styles.raceResultForm__group}>
      <FormGroup element="select" label="Racer" id={`racerSelect-${index}`}>
        <select
          id={`racerSelect-${index}`}
          name={`racerSelect-${index}`}
          className={`${styles.raceResultForm__select} ${styles.raceResultForm__racerSelect}`}
          value={currentValue}
          onChange={handleChange}
          disabled={isLoading}
        >
          <option value="">Select a racer</option>
          {racers.map((racer) => (
            <option
              key={racer.id}
              value={racer.id}
              disabled={selectedRacerIds.includes(racer.id) && racer.id !== currentValue}
            >
              {racer.name} ({racer.team})
            </option>
          ))}
        </select>
      </FormGroup>
      <FormGroup
        element="input"
        type="number"
        label="Points"
        id={`pointsInput-${index}`}
        disabled={isLoading || !currentValue}
        className={styles.raceResultForm__input}
        error={errors?.points?.message}
        {...register(`rows.${index}.points`, { valueAsNumber: true })}
      />
      <FormGroup
        element="default"
        label="isGhost"
        id={`ghostCheckbox-${index}`}
        className={styles.raceResultForm__checkbox}
      >
        <input
          id={`ghostCheckbox-${index}`}
          type="checkbox"
          disabled={isLoading}
          {...register(`rows.${index}.isGhost`)}
        />
      </FormGroup>
    </div>
  );
}

export interface AddRaceResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seasonId: string;
  racers: Racer[];
  selectedRacerIds: string[];
  selectedRaceId?: string;
  onRacerSelect: (racerId: string, prevRacerId?: string) => void;
  onSubmit: () => void;
}

export default function AddRaceResultsModal({
  isOpen,
  onClose,
  seasonId,
  racers,
  selectedRacerIds,
  selectedRaceId,
  onRacerSelect,
  onSubmit,
}: AddRaceResultsModalProps) {
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [apiError, setApiError] = useState<{ title: string; message: string } | null>(null);

  const isUpdateMode = Boolean(selectedRaceId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RaceResultsFormValues>({
    resolver: zodResolver(raceResultsSchema),
    defaultValues: {
      raceName: "",
      raceDate: new Date().toISOString().split("T")[0],
      rows: racers.map(() => ({ points: 0, isGhost: false })),
    },
  });

  const { fields } = useFieldArray({ control, name: "rows" });

  const isLoading = isDataLoading || isSubmitting;

  useEffect(() => {
    if (isUpdateMode && selectedRaceId && isOpen) {
      loadRaceData(selectedRaceId);
    } else if (!isUpdateMode && isOpen) {
      reset({
        raceName: "",
        raceDate: new Date().toISOString().split("T")[0],
        rows: racers.map(() => ({ points: 0, isGhost: false })),
      });
      setApiError(null);
    }
  }, [isUpdateMode, selectedRaceId, isOpen, racers.length]);

  const loadRaceData = async (raceId: string) => {
    setIsDataLoading(true);
    setApiError(null);
    try {
      const race = await GetRaceById(raceId);
      const newRows = selectedRacerIds.map((racerId) => {
        const result = race.results.find((r) => r.racerId === racerId);
        return {
          points: result?.points ?? 0,
          isGhost: result?.ghostRacer ?? false,
        };
      });
      reset({
        raceName: race.name,
        raceDate: new Date(race.date).toISOString().split("T")[0],
        rows: newRows,
      });
    } catch (err) {
      setApiError({ title: "Error", message: "Failed to load race data. Please try again." });
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleFormSubmit = async (data: RaceResultsFormValues) => {
    setApiError(null);

    if (selectedRacerIds.length === 0) {
      setApiError({ title: "Validation Error", message: "Please select at least one racer." });
      return;
    }

    const allSelected = racers.every((r) => selectedRacerIds.includes(r.id));
    if (!allSelected) {
      setApiError({ title: "Validation Error", message: "Please select all racers." });
      return;
    }

    try {
      const results = selectedRacerIds.map((racerId, idx) => ({
        racerId,
        points: data.rows[idx].isGhost ? 0 : data.rows[idx].points,
        constructorPoints: data.rows[idx].isGhost
          ? Math.max(4, data.rows[idx].points)
          : data.rows[idx].points,
        ghostRacer: data.rows[idx].isGhost,
      }));

      const finalResults = results
        .sort((a, b) => b.points - a.points)
        .map((r, i) => ({ ...r, position: i + 1 })) as RaceResult[];

      if (isUpdateMode && selectedRaceId) {
        await UpdateRace(selectedRaceId, data.raceName, data.raceDate, finalResults);
      } else {
        await CreateRace(seasonId, data.raceName, data.raceDate, finalResults);
      }

      onClose();
      onSubmit();
    } catch (err) {
      setApiError(
        err instanceof Error
          ? { title: "Error", message: err.message }
          : { title: "Error", message: "Failed to save race results." },
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isUpdateMode ? "Update Race Results" : "Add Race Results"}
    >
      <form className={styles.raceResultForm} onSubmit={handleSubmit(handleFormSubmit)}>
        {apiError && <Toast title={apiError.title} message={apiError.message} type="error" />}
        {Object.keys(errors).length > 0 && (
          <Toast
            title="Validation Error"
            message={`Please fix the following errors in the form before submitting:
              ${Object.values(errors)
                .map((err) => (err?.message ? `- ${err.message}` : ""))
                .filter(Boolean)
                .join("\n")}`}
            type="error"
          />
        )}
        <FormGroup
          element="input"
          label="Race Name"
          id="raceNameInput"
          type="text"
          className={styles.raceResultForm__nameInput}
          placeholder="Enter race name"
          error={errors.raceName?.message}
          {...register("raceName")}
        />

        <FormGroup
          element="input"
          label="Race Date"
          id="raceDateInput"
          type="date"
          className={styles.raceResultForm__nameInput}
          error={errors.raceDate?.message}
          {...register("raceDate")}
        />

        {fields.map((field, index) => (
          <RaceResultFormGroup
            key={field.id}
            racers={racers}
            selectedRacerId={selectedRacerIds[index] || ""}
            selectedRacerIds={selectedRacerIds}
            onRacerSelect={onRacerSelect}
            index={index}
            register={register}
            setValue={setValue}
            errors={errors.rows?.[index]}
            isLoading={isLoading}
          />
        ))}

        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Results"}
        </Button>
      </form>
    </Modal>
  );
}
