import { useAuth } from "../hooks/useAuth";
import { Card } from "../../src/components/common/Card";
import { Button } from "../../src/components/common/Button";
import { LoadingSkeletonCard } from "../components/common";
import { useState } from "react";
import { useProtectedPage } from "../../src/hooks/useProtectedPage";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const isProtectedPageLoading = useProtectedPage();
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
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            Create Racer
          </Button>
        </Card>
      )}
      <Button type="button" onClick={logout}>
        Logout
      </Button>
      {isModalOpen && (
        <div className={styles.backdrop} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Create Racer</h2>
            <form>
              <div>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
