import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useProtectedPage } from "../hooks/useProtectedPage";
import { Tabs, Button, LoadingSkeletonCard } from "../components/common";
import {
  UserManagementTab,
  RacerManagementTab,
  AnalyticsTab,
} from "../components/features/Admin";
import styles from "./AdminPage.module.css";

const TABS = [
  { id: "users", label: "User Management" },
  { id: "racers", label: "Racer Management" },
  { id: "analytics", label: "Analytics" },
];

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isProtectedPageLoading = useProtectedPage();

  const [activeTab, setActiveTab] = useState("users");

  if (isProtectedPageLoading) {
    return (
      <div className={styles.admin}>
        <LoadingSkeletonCard includeTitle maxWidth="900px" testId="admin-page-loading" />
      </div>
    );
  }

  // Non-admin users are redirected away
  if (user && user.role !== "admin") {
    navigate("/");
    return null;
  }

  return (
    <div className={styles.admin}>
      <div className={styles.admin__headerRow}>
        <div>
          <h1 className={styles.admin__heading}>Admin Panel</h1>
          <p className={styles.admin__subheading}>
            Manage players, racers, and view platform analytics.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={() => navigate("/profile")}>
          ← Back to Profile
        </Button>
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div
        className={styles.admin__panel}
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "users" && <UserManagementTab />}
        {activeTab === "racers" && <RacerManagementTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
}
