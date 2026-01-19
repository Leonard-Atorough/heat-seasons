import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/layout/Header.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import LoginRegister from "./pages/LoginRegister.tsx";
import Drivers from "./pages/Drivers.tsx";
import Footer from "./components/layout/Footer.tsx";
import { useState } from "react";
// import useFetch from "./hooks/useFetch.ts";

function App() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [season, setSeason] = useState(null);

  return (
    <Router>
      <div className="app">
        <Header />

        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login" element={<LoginRegister />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
