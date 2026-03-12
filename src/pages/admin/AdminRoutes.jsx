import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

import AdminLayout from "./AdminLayout";
import AdminLogin from "./AdminLogin";
import AdminPlans from "./AdminPlans";
import AdminMembers from "./AdminMembers";
import AdminAddMember from "./AdminAddMember";
import AdminAttendance from "./AdminAttendance";
import AdminSales from "./AdminSales";
import AdminDuePayments from "./AdminDuePayments";
export default function AdminRoutes() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // ⏳ wait till session loads
  if (session === undefined) {
    return null;
  }

  return (
    <Routes>
      {/* LOGIN PAGE */}
      <Route
        path="/"
        element={session ? <Navigate to="members" /> : <AdminLogin />}
      />

      {/* PROTECTED ADMIN AREA */}
      <Route
        path="/"
        element={session ? <AdminLayout /> : <Navigate to="/admin" />}
      >
        <Route path="plans" element={<AdminPlans />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="add-member" element={<AdminAddMember />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="sales" element={<AdminSales />} />
        <Route path="due-payments" element={<AdminDuePayments />} />
      </Route>
    </Routes>
  );
}
