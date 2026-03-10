import { useState, useEffect, useCallback } from "react";
import { Racer } from "shared";
import { AdminUser, AdminCreateRacerInput } from "../../../models";
import {
  adminListUsers,
  adminListRacers,
  adminCreateRacer,
  adminUpdateRacer,
  adminDeleteRacer,
} from "../../../services/api/admin";
import { RacerList } from "./RacerManagement/RacerList";
import { CreateRacerForm } from "./RacerManagement/CreateRacerForm";
import { EditRacerModal } from "./RacerManagement/EditRacerModal";
import { DeleteRacerModal } from "./RacerManagement/DeleteRacerModal";
import { EMPTY_FORM, FormErrors } from "./RacerManagement/racerValidation";
import styles from "./RacerManagementTab.module.css";

export default function RacerManagementTab() {
  // ── Shared state ──────────────────────────────────────────────────
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [isLoadingRacers, setIsLoadingRacers] = useState(false);
  const [racerListError, setRacerListError] = useState<string | null>(null);

  // ── Create form state ─────────────────────────────────────────────
  const [form, setForm] = useState<AdminCreateRacerInput>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Edit modal state ──────────────────────────────────────────────
  const [editingRacer, setEditingRacer] = useState<Racer | null>(null);
  const [editForm, setEditForm] = useState<AdminCreateRacerInput>(EMPTY_FORM);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);

  // ── Delete modal state ────────────────────────────────────────────
  const [deletingRacer, setDeletingRacer] = useState<Racer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Data fetching ─────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const data = await adminListUsers();
      setUsers(data);
    } catch {
      // non-critical - user list is optional for unassigned racers
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const fetchRacers = useCallback(async () => {
    setIsLoadingRacers(true);
    setRacerListError(null);
    try {
      const data = await adminListRacers();
      setRacers(data);
    } catch {
      setRacerListError("Failed to load racers.");
    } finally {
      setIsLoadingRacers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRacers();
  }, [fetchUsers, fetchRacers]);

  // ── Create form handlers ──────────────────────────────────────────
  const handleCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
    }));
    if (fieldErrors[name as keyof AdminCreateRacerInput]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof AdminCreateRacerInput];
        return next;
      });
    }
  };

  const handleCreateSubmit = async (payload: AdminCreateRacerInput) => {
    setIsSubmitting(true);
    try {
      const created = await adminCreateRacer(payload);
      setSuccessMsg(`Racer "${created.name}" created successfully.`);
      setForm(EMPTY_FORM);
      setFieldErrors({});
      await fetchRacers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create racer.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit modal handlers ───────────────────────────────────────────
  const handleEditOpen = (racer: Racer) => {
    setEditingRacer(racer);
    setEditForm({
      name: racer.name,
      team: racer.team,
      teamColor: racer.teamColor,
      nationality: racer.nationality,
      age: racer.age,
      active: racer.active,
      badgeUrl: racer.badgeUrl ?? "",
      userId: racer.userId ?? "",
    });
    setEditErrors({});
    setEditSubmitError(null);
  };

  const handleEditClose = () => {
    setEditingRacer(null);
    setEditErrors({});
    setEditSubmitError(null);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
    }));
    if (editErrors[name as keyof AdminCreateRacerInput]) {
      setEditErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof AdminCreateRacerInput];
        return next;
      });
    }
  };

  const handleEditSubmit = async (
    racerId: string,
    payload: AdminCreateRacerInput,
  ) => {
    setIsEditSubmitting(true);
    try {
      await adminUpdateRacer(racerId, payload);
      handleEditClose();
      await fetchRacers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update racer.";
      setEditSubmitError(msg);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // ── Delete modal handlers ─────────────────────────────────────────
  const handleDeleteOpen = (racer: Racer) => {
    setDeletingRacer(racer);
    setDeleteError(null);
  };

  const handleDeleteClose = () => {
    setDeletingRacer(null);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRacer) return;
    try {
      await adminDeleteRacer(deletingRacer.id);
      handleDeleteClose();
      await fetchRacers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete racer.";
      setDeleteError(msg);
    }
  };

  return (
    <div className={styles.container}>
      <RacerList
        racers={racers}
        isLoading={isLoadingRacers}
        error={racerListError}
        onRefresh={fetchRacers}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <CreateRacerForm
        form={form}
        errors={fieldErrors}
        users={users}
        isLoadingUsers={isLoadingUsers}
        isSubmitting={isSubmitting}
        successMsg={successMsg}
        errorMsg={submitError}
        onFormChange={handleCreateChange}
        onValidationErrorsChange={setFieldErrors}
        onFormReset={() => {
          setForm(EMPTY_FORM);
          setFieldErrors({});
        }}
        onSubmit={handleCreateSubmit}
        onSuccessClose={() => setSuccessMsg(null)}
        onErrorClose={() => setSubmitError(null)}
      />

      <EditRacerModal
        editingRacer={editingRacer}
        editForm={editForm}
        errors={editErrors}
        users={users}
        isLoadingUsers={isLoadingUsers}
        isSubmitting={isEditSubmitting}
        errorMsg={editSubmitError}
        onFormChange={handleEditChange}
        onValidationErrorsChange={setEditErrors}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        onErrorClose={() => setEditSubmitError(null)}
      />

      <DeleteRacerModal
        deletingRacer={deletingRacer}
        isDeleting={isDeleting}
        errorMsg={deleteError}
        onClose={handleDeleteClose}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await handleDeleteConfirm();
          } finally {
            setIsDeleting(false);
          }
        }}
        onErrorClose={() => setDeleteError(null)}
      />
    </div>
  );
}
