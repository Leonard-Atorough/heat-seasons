import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RacerWithStats } from "shared";
import { useAuth } from "../hooks/useAuth";
import { useProtectedPage } from "../hooks/useProtectedPage";
import { LoadingSkeletonCard, Button, Card } from "../components/common";
import { CreateRacerModal, EditRacerModal, LinkedRacerCard } from "../components/features/Profile";
import { getMyRacer } from "../services/api/racer";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const isProtectedPageLoading = useProtectedPage();

  const [imageSrc, setImageSrc] = useState(user?.profilePicture);
  const [linkedRacer, setLinkedRacer] = useState<RacerWithStats | null>(null);
  const [isRacerLoading, setIsRacerLoading] = useState(false);
  const [racerError, setRacerError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Keep imageSrc in sync if the user object changes
  useEffect(() => {
    setImageSrc(user?.profilePicture);
  }, [user?.profilePicture]);

  const fetchLinkedRacer = async () => {
    if (!user) return;
    setIsRacerLoading(true);
    setRacerError(null);
    try {
      const racer = await getMyRacer();
      setLinkedRacer(racer);
    } catch (err: any) {
      if (err?.status === 404) {
        setLinkedRacer(null);
      } else {
        setRacerError("Could not load your racer profile.");
      }
    } finally {
      setIsRacerLoading(false);
    }
  };

  useEffect(() => {
    if (!isProtectedPageLoading && user) {
      fetchLinkedRacer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProtectedPageLoading, user?.id]);

  const handleRacerCreated = async () => {
    setIsCreateModalOpen(false);
    await refreshUser();
    await fetchLinkedRacer();
  };

  const handleImageError = () => {
    setImageSrc("");
  };

  if (isProtectedPageLoading) {
    return (
      <div className={styles.profile}>
        <LoadingSkeletonCard includeTitle maxWidth="600px" testId="profile-page-loading-skeleton" />
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      <h1 className={styles.profile__heading}>Welcome, {user?.name}!</h1>

      {/* ── Account card ──────────────────────────────────────────── */}
      <Card className={styles.profileCard}>
        <div className={styles.profileCard__avatar}>
          {imageSrc ? (
            <img
              className={styles.profilePicture}
              src={imageSrc}
              alt={`${user?.name}'s profile`}
              onError={handleImageError}
            />
          ) : (
            <div className={styles.profileAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          )}
        </div>

        <div className={styles.profileForm}>
          <div className={styles.profileFormGroup}>
            <p className={styles.profileFormGroup__label}>Name</p>
            <div className={styles.profileFormGroup__value}>{user?.name}</div>
          </div>
          <div className={styles.profileFormGroup}>
            <p className={styles.profileFormGroup__label}>Email</p>
            <div className={styles.profileFormGroup__value}>{user?.email}</div>
          </div>
          <div className={styles.profileFormGroup}>
            <p className={styles.profileFormGroup__label}>Role</p>
            <div className={styles.profileFormGroup__value}>
              <span className={`${styles.roleBadge} ${styles[`roleBadge--${user?.role}`]}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Racer section ─────────────────────────────────────────── */}
      <section className={styles.racerSection}>
        <div className={styles.racerSection__header}>
          <h2 className={styles.racerSection__title}>Racer Profile</h2>
          {!linkedRacer && !isRacerLoading && (
            <Button type="button" onClick={() => setIsCreateModalOpen(true)}>
              Create Racer
            </Button>
          )}
        </div>

        {isRacerLoading && <LoadingSkeletonCard includeTitle={false} maxWidth="600px" testId="profile-page-racer-loading-skeleton" />}

        {!isRacerLoading && racerError && (
          <p className={styles.racerSection__error}>{racerError}</p>
        )}

        {!isRacerLoading && !racerError && linkedRacer && (
          <LinkedRacerCard racer={linkedRacer} onEdit={() => setIsEditModalOpen(true)} />
        )}

        {!isRacerLoading && !racerError && !linkedRacer && (
          <Card className={styles.racerSection__empty}>
            <p>You don't have a racer profile yet.</p>
            <p className={styles.racerSection__emptyHint}>
              Create one to join seasons and track your results.
            </p>
          </Card>
        )}
      </section>

      {/* ── Account actions ───────────────────────────────────────── */}
      <div className={styles.profileActions}>
        {user?.role === "admin" && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin")}
          >
            Admin Panel
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>

      {isCreateModalOpen && (
        <CreateRacerModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleRacerCreated}
        />
      )}

      {isEditModalOpen && linkedRacer && (
        <EditRacerModal
          isOpen={isEditModalOpen}
          racer={linkedRacer}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={async () => {
            setIsEditModalOpen(false);
            await fetchLinkedRacer();
          }}
        />
      )}
    </div>
  );
}
