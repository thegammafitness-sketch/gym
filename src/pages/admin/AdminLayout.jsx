// import { Outlet, NavLink, useNavigate } from "react-router-dom";
// import { supabase } from "../../supabase";

// export default function AdminLayout() {
//   const navigate = useNavigate();

//   async function logout() {
//     await supabase.auth.signOut();
//     navigate("/admin");
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* SIDEBAR */}
//       <aside className="w-64 bg-white shadow-lg p-6 hidden md:block">
//         <h2 className="text-2xl font-bold mb-10">🏋️ Gym Admin</h2>

//         <nav className="space-y-4 text-gray-700 font-medium">
//           <NavLink to="/admin/members">Members</NavLink>
//           <NavLink to="/admin/add-member">Add Member</NavLink>
//           <NavLink to="/admin/plans">Plans / Packs</NavLink>
//           <NavLink to="/admin/attendance">Attendance</NavLink>
//           <NavLink to="/admin/sales">Sales</NavLink>

//           <button
//             onClick={logout}
//             className="mt-10 text-red-600 font-semibold"
//           >
//             Logout
//           </button>
//         </nav>
//       </aside>

//       {/* MAIN CONTENT */}
//       <main className="flex-1 p-8">
//         <Outlet />
//       </main>
//     </div>
//   );
// }

// import { Outlet, NavLink, useNavigate } from "react-router-dom";
// import { supabase } from "../../supabase";
// import { useState } from "react";

// export default function AdminLayout() {
//   const navigate = useNavigate();
//   const [collapsed, setCollapsed] = useState(false);

//   async function logout() {
//     await supabase.auth.signOut();
//     navigate("/admin");
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6">
//       <div className="flex rounded-3xl overflow-hidden shadow-2xl bg-white">
//         {/* SIDEBAR */}
//         <aside
//           className={`${
//             collapsed ? "w-20" : "w-64"
//           } transition-all duration-300 bg-white/80 backdrop-blur-xl border-r p-6 hidden md:flex flex-col`}
//         >
//           <div className="flex items-center justify-between mb-10">
//             {!collapsed && (
//               <h2 className="text-2xl font-bold text-slate-800">
//                 🏋️ Gamma Admin
//               </h2>
//             )}
//             <button
//               onClick={() => setCollapsed(!collapsed)}
//               className="text-slate-500 hover:text-black"
//             >
//               ☰
//             </button>
//           </div>

//           <nav className="flex flex-col gap-4 text-slate-600 font-medium">
//             <SidebarLink to="/admin/members" collapsed={collapsed}>
//               👥 Members
//             </SidebarLink>

//             <SidebarLink to="/admin/add-member" collapsed={collapsed}>
//               ➕ Add Member
//             </SidebarLink>

//             <SidebarLink to="/admin/plans" collapsed={collapsed}>
//               📦 Plans
//             </SidebarLink>

//             <SidebarLink to="/admin/attendance" collapsed={collapsed}>
//               📅 Attendance
//             </SidebarLink>

//             <SidebarLink to="/admin/sales" collapsed={collapsed}>
//               💰 Sales
//             </SidebarLink>
//             <SidebarLink to="/admin/due-payments" collapsed={collapsed}>
//               ⚠️ Due Payments
//             </SidebarLink>
//             <button
//               onClick={logout}
//               className="mt-10 text-red-500 font-semibold hover:text-red-700 transition"
//             >
//               {!collapsed && "Logout"}
//               {collapsed && "🚪"}
//             </button>
//           </nav>
//         </aside>

//         {/* MAIN CONTENT */}
//         <div className="flex-1 bg-slate-50">
//           {/* TOP BAR */}
//           <div className="flex justify-between items-center px-8 py-6 border-b bg-white/70 backdrop-blur">
//             <h1 className="text-xl font-semibold text-slate-700">Dashboard</h1>

//             <div className="flex items-center gap-4">
//               <div className="bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center">
//                 👤
//               </div>
//             </div>
//           </div>

//           {/* PAGE CONTENT */}
//           <div className="p-8">
//             <Outlet />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ================= SIDEBAR LINK ================= */
// function SidebarLink({ to, children, collapsed }) {
//   const icon = children.split(" ")[0];
//   const label = children.substring(2);

//   return (
//     <NavLink
//       to={to}
//       className={({ isActive }) =>
//         `
//         flex items-center 
//         ${collapsed ? "justify-center" : "gap-3"}
//         py-3
//         ${collapsed ? "px-0" : "px-4"}
//         rounded-2xl 
//         transition-all duration-200
//         ${
//           isActive
//             ? collapsed
//               ? "bg-indigo-600 text-white w-12 h-12 mx-auto flex items-center justify-center shadow-lg"
//               : "bg-indigo-600 text-white shadow-lg"
//             : collapsed
//               ? "w-12 h-12 mx-auto flex items-center justify-center hover:bg-slate-200"
//               : "text-slate-600 hover:bg-slate-100"
//         }
//         `
//       }
//     >
//       <span className="text-lg">{icon}</span>

//       {!collapsed && <span className="font-medium">{label}</span>}
//     </NavLink>
//   );
// }

import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { useState } from "react";

export default function AdminLayout({ role }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const isOwner = role?.role === "owner";

  async function logout() {
    await supabase.auth.signOut();
    navigate("/admin");
  }

  function handleSalesClick(e) {
    e.preventDefault();
    setPinInput("");
    setPinError("");
    setShowPinModal(true);
  }

  function confirmPin() {
    if (pinInput === String(role?.sales_pin)) {
      setShowPinModal(false);
      navigate("/admin/sales");
    } else {
      setPinError("Incorrect PIN. Try again.");
      setPinInput("");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6">
      <div className="flex rounded-3xl overflow-hidden shadow-2xl bg-white">

        {/* SIDEBAR */}
        <aside
          className={`${
            collapsed ? "w-20" : "w-64"
          } transition-all duration-300 bg-white/80 backdrop-blur-xl border-r p-6 hidden md:flex flex-col`}
        >
          <div className="flex items-center justify-between mb-10">
            {!collapsed && (
              <h2 className="text-2xl font-bold text-slate-800">
                🏋️ Gamma Admin
              </h2>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-500 hover:text-black"
            >
              ☰
            </button>
          </div>

          <nav className="flex flex-col gap-4 text-slate-600 font-medium">
            <SidebarLink to="/admin/members" collapsed={collapsed}>
              👥 Members
            </SidebarLink>

            <SidebarLink to="/admin/add-member" collapsed={collapsed}>
              ➕ Add Member
            </SidebarLink>

            <SidebarLink to="/admin/plans" collapsed={collapsed}>
              📦 Plans
            </SidebarLink>

            <SidebarLink to="/admin/attendance" collapsed={collapsed}>
              📅 Attendance
            </SidebarLink>

            {/* Sales — only visible to owner */}
            {isOwner && (
              <button
                onClick={handleSalesClick}
                className={`flex items-center ${
                  collapsed ? "justify-center w-12 h-12 mx-auto" : "gap-3 px-4"
                } py-3 rounded-2xl text-slate-600 hover:bg-slate-100 transition-all duration-200`}
              >
                <span className="text-lg">💰</span>
                {!collapsed && <span className="font-medium">Sales</span>}
              </button>
            )}

            {/* <SidebarLink to="/admin/due-payments" collapsed={collapsed}>
              ⚠️ Due Payments
            </SidebarLink> */}

            <button
              onClick={logout}
              className="mt-10 text-red-500 font-semibold hover:text-red-700 transition"
            >
              {!collapsed ? "Logout" : "🚪"}
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-slate-50">
          {/* TOP BAR */}
          <div className="flex justify-between items-center px-8 py-6 border-b bg-white/70 backdrop-blur">
            <h1 className="text-xl font-semibold text-slate-700">Dashboard</h1>
            <div className="flex items-center gap-4">
              {/* Show owner badge */}
              {isOwner && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-semibold">
                  Owner
                </span>
              )}
              <div className="bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center">
                👤
              </div>
            </div>
          </div>

          {/* PAGE CONTENT */}
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>

      {/* PIN MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">

            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔐</div>
              <h2 className="text-2xl font-bold text-slate-800">
                Owner PIN Required
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Enter your PIN to access Sales
              </p>
            </div>

            <input
              type="password"
              placeholder="Enter PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmPin()}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-center text-2xl tracking-widest mb-3"
              autoFocus
            />

            {pinError && (
              <p className="text-red-500 text-sm text-center mb-3 animate-pulse">
                {pinError}
              </p>
            )}

            <button
              onClick={confirmPin}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:scale-105 transition mb-3"
            >
              Confirm
            </button>

            <button
              onClick={() => setShowPinModal(false)}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SIDEBAR LINK ================= */
function SidebarLink({ to, children, collapsed }) {
  const icon = children.split(" ")[0];
  const label = children.substring(2);

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center 
        ${collapsed ? "justify-center" : "gap-3"}
        py-3
        ${collapsed ? "px-0" : "px-4"}
        rounded-2xl 
        transition-all duration-200
        ${
          isActive
            ? collapsed
              ? "bg-indigo-600 text-white w-12 h-12 mx-auto flex items-center justify-center shadow-lg"
              : "bg-indigo-600 text-white shadow-lg"
            : collapsed
              ? "w-12 h-12 mx-auto flex items-center justify-center hover:bg-slate-200"
              : "text-slate-600 hover:bg-slate-100"
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && <span className="font-medium">{label}</span>}
    </NavLink>
  );
}