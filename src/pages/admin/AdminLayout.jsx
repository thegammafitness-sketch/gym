import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";

export default function AdminLayout() {
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    navigate("/admin");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-10">🏋️ Gym Admin</h2>

        <nav className="space-y-4 text-gray-700 font-medium">
          <NavLink to="/admin/members">Members</NavLink>
          <NavLink to="/admin/add-member">Add Member</NavLink>
          <NavLink to="/admin/plans">Plans / Packs</NavLink>
          <NavLink to="/admin/attendance">Attendance</NavLink>
          <NavLink to="/admin/sales">Sales</NavLink>

          <button
            onClick={logout}
            className="mt-10 text-red-600 font-semibold"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
