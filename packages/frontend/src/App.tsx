import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/layout/Header.tsx";
import Footer from "./components/layout/Footer.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import LoginRegister from "./pages/LoginRegister.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import Racers from "./pages/Racers.tsx";
import Seasons from "./pages/Seasons.tsx";
import { Teams } from "./pages/Teams.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import Results from "./pages/Results.tsx";
import AdminPage from "./pages/AdminPage.tsx";
import RacerDetailsPage from "./pages/RacerDetailsPage.tsx";
import SeasonDetailsPage from "./pages/SeasonDetailsPage.tsx";
import NotFound from "./pages/NotFound.tsx";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />

        <main className="main">
          <Routes>
            <Route path="/dashboard?" element={<Dashboard />} />
            <Route path="/login" element={<LoginRegister />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/racers" element={<Racers />} />
            <Route path="/racers/:name" element={<RacerDetailsPage />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/results" element={<Results />} />
            <Route path="/seasons" element={<Seasons />} />
            <Route path="/seasons/:name" element={<SeasonDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
