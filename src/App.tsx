import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import DietRecord from "@/pages/DietRecord";
import Exercise from "@/pages/Exercise";
import BodyStats from "@/pages/BodyStats";
import NutritionistNotes from "@/pages/NutritionistNotes";
import Leaderboard from "@/pages/Leaderboard";
import Reports from "@/pages/Reports";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/diet" element={<DietRecord />} />
          <Route path="/exercise" element={<Exercise />} />
          <Route path="/body" element={<BodyStats />} />
          <Route path="/nutritionist" element={<NutritionistNotes />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}
