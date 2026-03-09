import { useState, useEffect, useCallback } from "react";
import { Card, LoadingSkeletonCard } from "../../common";
import { AdminUser, adminListUsers } from "../../../services/api/admin";
import styles from "./AnalyticsTab.module.css";

function formatDate(value: string | Date | undefined): string {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysAgo(value: string | Date | undefined): number | null {
  if (!value) return null;
  const diff = Date.now() - new Date(value).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function AnalyticsTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setUsers(await adminListUsers());
    } catch {
      setError("Failed to load analytics data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (isLoading) {
    return <LoadingSkeletonCard includeTitle maxWidth="100%" testId="analytics-loading" />;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  // ── Computed stats ────────────────────────────────────────────────
  const totalUsers = users.length;
  const totalLogins = users.reduce((sum, u) => sum + (u.loginCount ?? 0), 0);
  const activeToday = users.filter((u) => daysAgo(u.lastLoginAt) === 0).length;
  const activeLast7 = users.filter((u) => {
    const d = daysAgo(u.lastLoginAt);
    return d !== null && d <= 7;
  }).length;
  const neverLoggedIn = users.filter((u) => !u.lastLoginAt).length;

  const byRole = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  const topUsers = [...users]
    .filter((u) => (u.loginCount ?? 0) > 0)
    .sort((a, b) => (b.loginCount ?? 0) - (a.loginCount ?? 0))
    .slice(0, 5);

  const recentUsers = [...users]
    .filter((u) => u.lastLoginAt)
    .sort((a, b) => new Date(b.lastLoginAt!).getTime() - new Date(a.lastLoginAt!).getTime())
    .slice(0, 5);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Login Analytics</h2>

      {/* ── Summary stats ──────────────────────────────────────────── */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{totalUsers}</span>
          <span className={styles.statLabel}>Total Players</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{totalLogins}</span>
          <span className={styles.statLabel}>Total Logins</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{activeToday}</span>
          <span className={styles.statLabel}>Active Today</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{activeLast7}</span>
          <span className={styles.statLabel}>Active (7 days)</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{neverLoggedIn}</span>
          <span className={styles.statLabel}>Never Logged In</span>
        </Card>
      </div>

      {/* ── Role breakdown ─────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Players by Role</h3>
        <div className={styles.roleGrid}>
          {Object.entries(byRole).map(([role, count]) => (
            <Card key={role} className={styles.roleCard}>
              <span className={`${styles.roleBadge} ${styles[`roleBadge--${role}`]}`}>
                {role}
              </span>
              <span className={styles.roleCount}>{count}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Top users by login count ───────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Most Active Players</h3>
        {topUsers.length === 0 ? (
          <p className={styles.emptyHint}>No login data recorded yet.</p>
        ) : (
          <div className={styles.userList}>
            {topUsers.map((u, i) => (
              <Card key={u.id} className={styles.userRow} variant="compact">
                <span className={styles.rank}>#{i + 1}</span>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{u.name}</span>
                  <span className={styles.userEmail}>{u.email}</span>
                </div>
                <span className={styles.loginCount}>{u.loginCount} logins</span>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ── Recent logins ──────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Recent Logins</h3>
        {recentUsers.length === 0 ? (
          <p className={styles.emptyHint}>No login data recorded yet.</p>
        ) : (
          <div className={styles.userList}>
            {recentUsers.map((u) => (
              <Card key={u.id} className={styles.userRow} variant="compact">
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{u.name}</span>
                  <span className={styles.userEmail}>{u.email}</span>
                </div>
                <span className={styles.loginTime}>{formatDate(u.lastLoginAt)}</span>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
