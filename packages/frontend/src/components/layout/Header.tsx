import { Link, useNavigate } from "react-router-dom";
import { Button } from "../common/Button";
import styles from "./Header.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const auth = useAuth();

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
    <header className={styles.header + (headerScrolled ? ` ${styles["header--scrolled"]}` : "")}>
      <h1 className={styles.title}>
        <Link to="/" onClick={() => setHamburgerOpen(false)}>
          🏁 HEAT
        </Link>
      </h1>
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
        <Link className={styles["nav__link"]} to="/" onClick={() => setHamburgerOpen(false)}>
          Dashboard
        </Link>
        <Link className={styles["nav__link"]} to="/racers" onClick={() => setHamburgerOpen(false)}>
          Racers
        </Link>
        <Link className={styles["nav__link"]} to="/teams" onClick={() => setHamburgerOpen(false)}>
          Teams
        </Link>
        <Link className={styles["nav__link"]} to="/results" onClick={() => setHamburgerOpen(false)}>
          Results
        </Link>
        <Link className={styles["nav__link"]} to="/seasons" onClick={() => setHamburgerOpen(false)}>
          Seasons
        </Link>
        {!auth.user ? (
          <Button
            type="button"
            className={styles["nav__link-button"]}
            variant="primary"
            onClick={() => {
              setHamburgerOpen(false);
              navigate("/login");
            }}
          >
            Login/Register
          </Button>
        ) : (
          <UserProfileBadge name={auth.user.name} profilePicture={auth.user.profilePicture || ""} />
        )}
      </nav>
    </header>
  );
}

function UserProfileBadge({ name, profilePicture }: { name: string; profilePicture: string }) {
  const [imageSrc, setImageSrc] = useState(profilePicture);

  const navigate = useNavigate();

  const handleImageError = () => {
    // Fallback to initials if image fails to load
    setImageSrc("");
  };

  return (
    <Button
      className={styles["user-profile"]}
      variant="ghost"
      type="button"
      onClick={() => navigate(`/profile`)}
    >
      {imageSrc ? (
        <img
          className={styles["user-profile__picture"]}
          src={imageSrc}
          alt={name}
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <div className={styles["user-profile__initials"]}>
          {name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </div>
      )}
      <span className={styles["user-profile__name"]}>{name}</span>
    </Button>
  );
}
