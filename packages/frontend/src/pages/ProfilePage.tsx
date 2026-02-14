import { useAuth } from "../hooks/useAuth";
import { Card } from "../../src/components/common/Card";
import { Button } from "../../src/components/common/Button";

import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className={styles.profile}>
      <h1>Welcome, {user?.name}!</h1>
      <Card className={styles.profileCard}>
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
      </Card>
      <Button type="button" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}
