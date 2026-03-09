import { useState, useEffect, useCallback } from "react";
import { USER_ROLES } from "shared";
import { Button, Card, LoadingSkeletonCard } from "../../common";
import { AdminUser, adminListUsers, adminPromoteUser, adminDemoteUser } from "../../../services/api/admin";
import styles from "./UserManagementTab.module.css";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  contributor: "Contributor",
  user: "User",
};

export default function UserManagementTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminListUsers();
      setUsers(data);
    } catch {
      setError("Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePromote = async (userId: string) => {
    setUpdatingUserId(userId);
    try {
      const updated = await adminPromoteUser(userId);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
    } catch {
      setError("Failed to promote user.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDemote = async (userId: string) => {
    setUpdatingUserId(userId);
    try {
      const updated = await adminDemoteUser(userId);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
    } catch {
      setError("Failed to demote user.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (isLoading) {
    return <LoadingSkeletonCard includeTitle maxWidth="100%" testId="user-mgmt-loading" />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>User Management</h2>
        <Button type="button" variant="secondary" onClick={fetchUsers}>
          Refresh
        </Button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last Login</th>
              <th>Logins</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userNameCell}>
                    {user.profilePicture ? (
                      <img
                        className={styles.avatar}
                        src={user.profilePicture}
                        alt={user.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.avatarInitials}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`${styles.badge} ${styles[`badge--${user.role}`]}`}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </td>
                <td>
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
                <td>{user.loginCount ?? 0}</td>
                <td>
                  <div className={styles.actions}>
                    {user.role === USER_ROLES.USER && (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={updatingUserId === user.id}
                        onClick={() => handlePromote(user.id)}
                      >
                        Promote
                      </Button>
                    )}
                    {user.role === USER_ROLES.CONTRIBUTOR && (
                      <>
                        <Button
                          type="button"
                          variant="danger"
                          disabled={updatingUserId === user.id}
                          onClick={() => handleDemote(user.id)}
                        >
                          Demote
                        </Button>
                      </>
                    )}
                    {user.role === USER_ROLES.ADMIN && (
                      <span className={styles.adminNote}>Admin</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Card className={styles.legend}>
        <p className={styles.legend__title}>Role descriptions</p>
        <ul className={styles.legend__list}>
          <li><strong>User</strong> — standard account, can create their own racer.</li>
          <li><strong>Contributor</strong> — can manage race data and seasons.</li>
          <li><strong>Admin</strong> — full access including user management.</li>
        </ul>
      </Card>
    </div>
  );
}
