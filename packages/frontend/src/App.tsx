import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/layout/Header.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import LoginRegister from "./pages/LoginRegister.tsx";
import Drivers from "./pages/Drivers.tsx";
import Footer from "./components/layout/Footer.tsx";
// import { useState } from "react";
// import useFetch from "./hooks/useFetch.ts";

function App() {
  // const [drivers, setDrivers] = useState<FetchDriversResponse[]>([]);

  // const { data, error, loading } = useFetch<FetchDriversResponse[]>("/api/drivers");

  // if (loading) {
  //   return <div>Loading...</div>;
  // }
  // if (error) {
  //   return <div>Error: {error.message}</div>;
  // }

  // setDrivers((data as FetchDriversResponse[]) || []);

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

interface FetchDriversResponse {
  id: number;
  name: string;
  team: string;
  points: number;
  profileUrl: string;
}

export default App;
