import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/layout/Header.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import LoginRegister from "./pages/LoginRegister.tsx";
import Drivers from "./pages/Drivers.tsx";
import Footer from "./components/layout/Footer.tsx";
import { useMemo, useState } from "react";
import { config } from "./config.ts";
import { ApiResponse, Leaderboard as standings, LeaderboardEntry } from "@shared/models";
import useFetch from "./hooks/useFetch.ts";
import Seasons from "./pages/Seasons.tsx";
// import useFetch from "./hooks/useFetch.ts";

function App() {
  const [leaderboard, setLeaderboard] = useState<standings>({
    seasonId: "",
    seasonName: "",
    asOfDate: new Date(),
    standings: [],
  });
  const [drivers, setDrivers] = useState([]);
  const [seasonName, setSeasonName] = useState<string | null>(null);

  const { data, error, loading } = useFetch<ApiResponse<standings>>(
    `${config.leaderboardRoute}/current`,
  );

  useMemo(() => {
    if (data && data.data) {
      setLeaderboard(data.data);
      setSeasonName(data.data.seasonName);
    }
  }, [data]);

  return (
    <Router>
      <div className="app">
        <Header />

        <main className="main">
          <Routes>
            <Route
              path="/"
              element={<Dashboard topThreeRacers={leaderboard.standings.slice(0, 3)} />}
            />
            <Route path="/leaderboard" element={<Leaderboard leaderboard={leaderboard} />} />
            <Route path="/login" element={<LoginRegister />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/seasons" element={<Seasons />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
