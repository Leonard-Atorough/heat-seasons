import { useNavigate } from "react-router-dom";
import { Button } from "../common/Button";
import styles from "./Header.module.css";

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>🏁 Heat Seasons | Leaderboard Tracker</h1>
      <nav className={styles.nav}>
        <a className={styles["nav__link"]} href="/">
          Dashboard
        </a>
        <a className={styles["nav__link"]} href="/drivers">
          Drivers
        </a>
        <a className={styles["nav__link"]} href="/leaderboard">
          Leaderboard
        </a>
        <a className={styles["nav__link"]} href="/races">
          Races
        </a>
        <a className={styles["nav__link"]} href="/seasons">
          Seasons
        </a>
        <Button
          type="button"
          className={styles["nav__link-button"]}
          variant="primary"
          onClick={() => navigate("/login")}
        >
          Login/Register
        </Button>
      </nav>
    </header>
  );
}
