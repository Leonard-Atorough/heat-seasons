import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/layout/Header.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import LoginRegister from "./pages/LoginRegister.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import Racers from "./pages/Racers.tsx";
import Footer from "./components/layout/Footer.tsx";
import Seasons from "./pages/Seasons.tsx";
import { Teams } from "./pages/Teams.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />

        <main className="main">
          <Routes>
            // TODO: Add auth callback route and page
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login" element={<LoginRegister />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/racers" element={<Racers />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/seasons" element={<Seasons />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
