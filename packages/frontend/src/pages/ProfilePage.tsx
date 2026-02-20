import { useAuth } from "../hooks/useAuth";
import { FormGroup, LoadingSkeletonCard, Card, Button } from "../components/common";
import { useState } from "react";
import { useProtectedPage } from "../../src/hooks/useProtectedPage";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const isProtectedPageLoading = useProtectedPage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(user?.profilePicture);

  const handleImageError = () => {
    // Fallback to initials if image fails to load
    setImageSrc("");
  };

  return (
    <div className={styles.profile}>
      {isProtectedPageLoading ? <h1></h1> : <h1>Welcome, {user?.name}!</h1>}
      {isProtectedPageLoading ? (
        <LoadingSkeletonCard includeTitle={false} maxWidth="600px" />
      ) : (
        <Card className={styles.profileCard}>
          {imageSrc ? (
            <img
              className={styles.profilePicture}
              src={imageSrc}
              alt={`${user?.name}'s profile`}
              onError={handleImageError}
            />
          ) : (
            <div className={styles.profileAvatar}>{user?.name.charAt(0).toUpperCase()}</div>
          )}
          <div className={styles.profileForm}>
            <div className={styles.profileFormGroup}>
              <p className={styles.profileFormGroup__label}>Name</p>
              <div className={styles.profileFormGroup__input}>{user?.name}</div>
            </div>
            <div className={styles.profileFormGroup}>
              <p className={styles.profileFormGroup__label}>Email</p>
              <div className={styles.profileFormGroup__input}>{user?.email}</div>
            </div>
            <div className={styles.profileFormGroup}>
              <p className={styles.profileFormGroup__label}>Role</p>
              <div className={styles.profileFormGroup__input}>{user?.role}</div>
            </div>
          </div>
          <div className={styles.profileActions}>
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              Create Racer
            </Button>
          </div>
        </Card>
      )}
      <Button type="button" onClick={logout}>
        Logout
      </Button>
      {isModalOpen && (
        <div className={styles.backdrop} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Create Racer</h2>
            <form className={styles.racerForm}>
              <FormGroup element="input" label="Racer Name" type="text" id="racerName" />
              <FormGroup element="input" label="Team" type="text" id="team" />
              <FormGroup element="input" label="Nationality" type="text" id="nationality" />
              <FormGroup element="input" label="Date of Birth" type="date" id="dob" />
              <Button type="submit">Create</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
