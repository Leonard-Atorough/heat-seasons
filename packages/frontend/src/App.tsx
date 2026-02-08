import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/layout/Header.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import LoginRegister from "./pages/LoginRegister.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import Drivers from "./pages/Drivers.tsx";
import Footer from "./components/layout/Footer.tsx";
import { config } from "./config.ts";
import { ApiResponse, Leaderboard as Standings, Racer } from "@shared/index";
import useFetch from "./hooks/useFetch.ts";
import Seasons from "./pages/Seasons.tsx";
import { Teams } from "./pages/Teams.tsx";

function App() {
  const { data: leaderboardData } = useFetch<ApiResponse<Standings>>(
    `${config.leaderboardRoute}`,
    "/current",
  );

  const { data: driversData } = useFetch<ApiResponse<Racer[]>>(config.racerRoute);

  return (
    <Router>
      <div className="app">
        <Header />

        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard leaderboard={leaderboardData?.data} />} />
            <Route
              path="/leaderboard"
              element={<Leaderboard leaderboard={leaderboardData?.data} />}
            />
            <Route path="/login" element={<LoginRegister />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/teams" element={<Teams drivers={driversData?.data} />} />
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
