import { Button } from "./Button";
import styles from "./Tabs.module.css";

export interface Tab {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Page sections">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          type="button"
          variant="none"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          id={`tab-${tab.id}`}
          className={`${styles.tab} ${activeTab === tab.id ? styles["tab--active"] : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
