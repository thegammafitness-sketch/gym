import { Routes, Route } from "react-router-dom";
import Attendance from "./pages/Attendance";
import AdminRoutes from "./pages/admin/AdminRoutes";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Attendance />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
}
