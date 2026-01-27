import { useNavigate } from "react-router-dom";
import { Button } from "../common/Button";
import styles from "./Header.module.css";
import { useEffect, useState } from "react";

export default function Header() {
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHeaderScrolled(true);
        setHamburgerOpen(false);
      } else {
        setHeaderScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>🏁 HEAT</h1>
      <Button
        type="button"
        className={styles.hamburger}
        variant="ghost"
        onClick={() => setHamburgerOpen(!hamburgerOpen)}
      >
        <span className={styles.hamburger__line}></span>
        <span className={styles.hamburger__line}></span>
        <span className={styles.hamburger__line}></span>
      </Button>
      <nav className={styles.nav + (hamburgerOpen ? ` ${styles["nav--open"]}` : "")}>
        <a className={styles["nav__link"]} href="/">
          Dashboard
        </a>
        <a className={styles["nav__link"]} href="/drivers">
          Drivers
        </a>
        <a className={styles["nav__link"]} href="/teams">
          Teams
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
