// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";

// export default function AdminAttendance() {
//   const [singles, setSingles] = useState([]);
//   const [groups, setGroups] = useState([]);
//   const [attendanceMap, setAttendanceMap] = useState({});
//   const [selectedPerson, setSelectedPerson] = useState(null);

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   async function fetchAll() {
//     // singles
//     const { data: members } = await supabase
//       .from("members")
//       .select("id, full_name, phone, plan_name, expiry_date");

//     // group primary members
//     const { data: groupMembers } = await supabase
//       .from("group_members")
//       .select(`
//         id,
//         full_name,
//         phone,
//         is_primary,
//         membership_groups (
//           plan_name,
//           expiry_date
//         )
//       `)
//       .eq("is_primary", true);

//     // attendance (current month)
//     const startOfMonth = new Date(
//       new Date().getFullYear(),
//       new Date().getMonth(),
//       1
//     ).toISOString();

//     const { data: attendance } = await supabase
//       .from("attendance")
//       .select("member_id")
//       .gte("attendance_date", startOfMonth);

//     const map = {};
//     attendance?.forEach((a) => {
//       map[a.member_id] = (map[a.member_id] || 0) + 1;
//     });

//     setAttendanceMap(map);
//     setSingles(members || []);
//     setGroups(groupMembers || []);
//   }

//   function getStatus(expiry) {
//     const today = new Date();
//     const exp = new Date(expiry);
//     const diff = Math.ceil((exp - today) / 86400000);
//     if (diff < 0) return "expired";
//     if (diff <= 2) return "due";
//     return "active";
//   }

//   function statusColor(status) {
//     if (status === "active") return "bg-green-600";
//     if (status === "due") return "bg-yellow-500";
//     return "bg-red-600";
//   }

//   const totalDays = new Date().getDate();

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-6">Attendance Dashboard</h1>

//       {/* SINGLE MEMBERS */}
//       <h2 className="font-semibold mb-3">Single Members</h2>
//       <div className="grid md:grid-cols-2 gap-4">
//         {singles.map((m) => {
//           const status = getStatus(m.expiry_date);
//           const attended = attendanceMap[m.id] || 0;

//           return (
//             <div key={m.id} className="border p-4 rounded-xl">
//               <div className="flex justify-between items-center">
//                 <b>{m.full_name}</b>
//                 <span
//                   className={`text-white text-xs px-2 py-1 rounded ${statusColor(
//                     status
//                   )}`}
//                 >
//                   {status.toUpperCase()}
//                 </span>
//               </div>

//               <div className="text-sm mt-1">{m.phone}</div>
//               <div className="text-sm mt-1">{m.plan_name}</div>

//               {/* <div className="mt-3 text-sm">
//                 <b>This Month</b>
//                 <div>Attended: {attended}</div>
//                 <div>Missed: {totalDays - attended}</div>
//               </div> */}

//               <button
//                 onClick={() => setSelectedPerson(m)}
//                 className="mt-3 px-3 py-1 bg-indigo-600 text-white rounded"
//               >
//                 View Full History
//               </button>
//             </div>
//           );
//         })}
//       </div>

//       {/* GROUP MEMBERS */}
//       <h2 className="font-semibold mt-8 mb-3">Group Members (Primary)</h2>
//       <div className="grid md:grid-cols-2 gap-4">
//         {groups.map((m) => {
//           const status = getStatus(m.membership_groups.expiry_date);
//           const attended = attendanceMap[m.id] || 0;

//           return (
//             <div key={m.id} className="border p-4 rounded-xl">
//               <div className="flex justify-between items-center">
//                 <b>👑 {m.full_name}</b>
//                 <span
//                   className={`text-white text-xs px-2 py-1 rounded ${statusColor(
//                     status
//                   )}`}
//                 >
//                   {status.toUpperCase()}
//                 </span>
//               </div>

//               <div className="text-sm mt-1">{m.phone}</div>
//               <div className="text-sm mt-1">
//                 {m.membership_groups.plan_name}
//               </div>

//               {/* <div className="mt-3 text-sm">
//                 <b>This Month</b>
//                 <div>Attended: {attended}</div>
//                 <div>Missed: {totalDays - attended}</div>
//               </div> */}

//               <button
//                 onClick={() => setSelectedPerson(m)}
//                 className="mt-3 px-3 py-1 bg-indigo-600 text-white rounded"
//               >
//                 View Full History
//               </button>
//             </div>
//           );
//         })}
//       </div>

//       {/* FULL HISTORY MODAL */}
//       {selectedPerson && (
//         <AttendanceHistoryModal
//           person={selectedPerson}
//           onClose={() => setSelectedPerson(null)}
//         />
//       )}
//     </div>
//   );
// }

// /* ================= HISTORY MODAL ================= */

// function AttendanceHistoryModal({ person, onClose }) {
//   const [records, setRecords] = useState([]);

//   useEffect(() => {
//     supabase
//       .from("attendance")
//       .select("*")
//       .eq("member_id", person.id)
//       .order("attendance_date", { ascending: false })
//       .then(({ data }) => setRecords(data || []));
//   }, []);

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
//       <div className="bg-white p-6 rounded w-full max-w-lg">
//         <h3 className="font-semibold mb-4">
//           Attendance History – {person.full_name}
//         </h3>

//         <div className="max-h-96 overflow-y-auto">
//           {records.map((r) => (
//             <div key={r.id} className="border-b py-2 text-sm">
//               {r.attendance_date} – {r.attendance_time}
//             </div>
//           ))}
//         </div>

//         <button
//           onClick={onClose}
//           className="mt-4 w-full bg-gray-300 py-2 rounded"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   );
// }
// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";

// export default function AdminAttendance() {
//   const [singles, setSingles] = useState([]);
//   const [groups, setGroups] = useState([]);
//   const [attendanceMap, setAttendanceMap] = useState({});
//   const [selectedPerson, setSelectedPerson] = useState(null);

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   async function fetchAll() {
//     const { data: members } = await supabase
//       .from("members")
//       .select("id, full_name, phone, plan_name, expiry_date");

//     const { data: groupMembers } = await supabase
//       .from("group_members")
//       .select(`
//         id,
//         full_name,
//         phone,
//         is_primary,
//         membership_groups (
//           plan_name,
//           expiry_date
//         )
//       `)
//       .eq("is_primary", true);

//     // CURRENT MONTH COUNT (for dashboard cards)
//     const startOfMonth = new Date(
//       new Date().getFullYear(),
//       new Date().getMonth(),
//       1
//     ).toISOString();

//     const { data: attendance } = await supabase
//       .from("attendance")
//       .select("member_id")
//       .gte("attendance_date", startOfMonth);

//     const map = {};
//     attendance?.forEach((a) => {
//       map[a.member_id] = (map[a.member_id] || 0) + 1;
//     });

//     setAttendanceMap(map);
//     setSingles(members || []);
//     setGroups(groupMembers || []);
//   }

//   function getStatus(expiry) {
//     const today = new Date();
//     const exp = new Date(expiry);
//     const diff = Math.ceil((exp - today) / 86400000);
//     if (diff < 0) return "expired";
//     if (diff <= 2) return "due";
//     return "active";
//   }

//   function statusColor(status) {
//     if (status === "active") return "bg-emerald-600";
//     if (status === "due") return "bg-amber-500";
//     return "bg-rose-600";
//   }

//   const totalDays = new Date().getDate();

//   return (
//     <div className="p-10 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 animate-fadeIn">
//       <h1 className="text-4xl font-bold mb-10">Attendance Dashboard</h1>

//       {/* SINGLE MEMBERS */}
//       <h2 className="text-xl font-semibold mb-4">Single Members</h2>
//       <div className="grid md:grid-cols-3 gap-6">
//         {singles.map((m) => {
//           const status = getStatus(m.expiry_date);
//           const attended = attendanceMap[m.id] || 0;
//           const percent = Math.round((attended / totalDays) * 100);

//           return (
//             <div
//               key={m.id}
//               className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition relative"
//             >
//               <div className={`absolute top-0 left-0 w-full h-2 ${statusColor(status)} rounded-t-3xl`} />

//               <div className="flex justify-between items-center mb-2">
//                 <h3 className="font-semibold text-lg">{m.full_name}</h3>
//                 <span className={`text-white text-xs px-3 py-1 rounded-full ${statusColor(status)}`}>
//                   {status.toUpperCase()}
//                 </span>
//               </div>

//               <div className="text-sm text-gray-500">{m.phone}</div>
//               <div className="text-sm mb-4">{m.plan_name}</div>

//               <div className="mb-3">
//                 <div className="text-xs text-gray-500 mb-1">
//                   This Month: {attended} days ({percent}%)
//                 </div>
//                 <div className="w-full h-2 bg-gray-200 rounded-full">
//                   <div
//                     className="h-2 bg-indigo-600 rounded-full"
//                     style={{ width: `${percent}%` }}
//                   />
//                 </div>
//               </div>

//               <button
//                 onClick={() => setSelectedPerson(m)}
//                 className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-xl hover:scale-105 transition"
//               >
//                 View Full History
//               </button>
//             </div>
//           );
//         })}
//       </div>

//       {/* GROUP MEMBERS */}
//       <h2 className="text-xl font-semibold mt-12 mb-4">
//         Group Members (Primary)
//       </h2>

//       <div className="grid md:grid-cols-3 gap-6">
//         {groups.map((m) => {
//           const status = getStatus(m.membership_groups.expiry_date);
//           const attended = attendanceMap[m.id] || 0;
//           const percent = Math.round((attended / totalDays) * 100);

//           return (
//             <div
//               key={m.id}
//               className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition relative"
//             >
//               <div className={`absolute top-0 left-0 w-full h-2 ${statusColor(status)} rounded-t-3xl`} />

//               <div className="flex justify-between items-center mb-2">
//                 <h3 className="font-semibold text-lg">👑 {m.full_name}</h3>
//                 <span className={`text-white text-xs px-3 py-1 rounded-full ${statusColor(status)}`}>
//                   {status.toUpperCase()}
//                 </span>
//               </div>

//               <div className="text-sm text-gray-500">{m.phone}</div>
//               <div className="text-sm mb-4">
//                 {m.membership_groups.plan_name}
//               </div>

//               <div className="mb-3">
//                 <div className="text-xs text-gray-500 mb-1">
//                   This Month: {attended} days ({percent}%)
//                 </div>
//                 <div className="w-full h-2 bg-gray-200 rounded-full">
//                   <div
//                     className="h-2 bg-indigo-600 rounded-full"
//                     style={{ width: `${percent}%` }}
//                   />
//                 </div>
//               </div>

//               <button
//                 onClick={() => setSelectedPerson(m)}
//                 className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-xl"
//               >
//                 View Full History
//               </button>
//             </div>
//           );
//         })}
//       </div>

//       {selectedPerson && (
//         <AttendanceHistoryModal
//           person={selectedPerson}
//           onClose={() => setSelectedPerson(null)}
//         />
//       )}
//     </div>
//   );
// }

// /* ================= ENHANCED HISTORY MODAL ================= */

// function AttendanceHistoryModal({ person, onClose }) {
//   const [records, setRecords] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState("current");

//   useEffect(() => {
//     fetchMonth();
//   }, [selectedMonth]);

//   async function fetchMonth() {
//     const today = new Date();

//     let year = today.getFullYear();
//     let month = today.getMonth();

//     if (selectedMonth === "last") {
//       month = month - 1;
//     }

//     const start = new Date(year, month, 1);
//     const end = new Date(year, month + 1, 0);

//     const { data } = await supabase
//       .from("attendance")
//       .select("*")
//       .eq("member_id", person.id)
//       .gte("attendance_date", start.toISOString())
//       .lte("attendance_date", end.toISOString());

//     setRecords(data || []);
//   }

//   const attendedDates = records.map((r) =>
//     new Date(r.attendance_date).getDate()
//   );

//   const today = new Date();
//   const displayMonth =
//     selectedMonth === "current"
//       ? today.getMonth()
//       : today.getMonth() - 1;

//   const displayYear = today.getFullYear();

//   const daysInMonth = new Date(
//     displayYear,
//     displayMonth + 1,
//     0
//   ).getDate();

//   const percent = Math.round(
//     (attendedDates.length / daysInMonth) * 100
//   );

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
//       <div className="bg-white rounded-3xl p-8 w-[650px] shadow-2xl animate-scaleIn">

//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold">
//             {person.full_name}
//           </h2>
//           <button onClick={onClose}>✕</button>
//         </div>

//         {/* Month Switch */}
//         <div className="flex gap-3 mb-6">
//           <button
//             onClick={() => setSelectedMonth("current")}
//             className={`px-4 py-2 rounded-xl ${
//               selectedMonth === "current"
//                 ? "bg-indigo-600 text-white"
//                 : "bg-gray-200"
//             }`}
//           >
//             Current Month
//           </button>

//           <button
//             onClick={() => setSelectedMonth("last")}
//             className={`px-4 py-2 rounded-xl ${
//               selectedMonth === "last"
//                 ? "bg-indigo-600 text-white"
//                 : "bg-gray-200"
//             }`}
//           >
//             Last Month
//           </button>
//         </div>

//         {/* Summary */}
//         <div className="mb-6">
//           <div className="text-sm text-gray-500">
//             Attendance: {attendedDates.length} days ({percent}%)
//           </div>

//           <div className="w-full h-3 bg-gray-200 rounded-full mt-2">
//             <div
//               className="h-3 bg-emerald-600 rounded-full"
//               style={{ width: `${percent}%` }}
//             />
//           </div>
//         </div>

//         {/* Calendar */}
//         <div className="grid grid-cols-7 gap-3 text-center">
//           {Array.from({ length: daysInMonth }).map((_, i) => {
//             const day = i + 1;
//             const attended = attendedDates.includes(day);

//             return (
//               <div
//                 key={day}
//                 className={`h-10 flex items-center justify-center rounded-xl text-sm font-medium
//                   ${
//                     attended
//                       ? "bg-emerald-500 text-white"
//                       : "bg-gray-100 text-gray-500"
//                   }
//                 `}
//               >
//                 {day}
//               </div>
//             );
//           })}
//         </div>

//         <button
//           onClick={onClose}
//           className="mt-8 w-full bg-gray-300 py-2 rounded-xl"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export default function AdminAttendance() {
  const [singles, setSingles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [search, setSearch] = useState(""); // ← added

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const { data: members } = await supabase
      .from("members")
      .select("id, full_name, phone, plan_name, expiry_date");

    const { data: groupMembers } = await supabase
      .from("group_members")
      .select(`
        id,
        full_name,
        phone,
        is_primary,
        membership_groups (
          plan_name,
          expiry_date
        )
      `)
      .eq("is_primary", true);

    // CURRENT MONTH COUNT (for dashboard cards)
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();

    const { data: attendance } = await supabase
      .from("attendance")
      .select("member_id")
      .gte("attendance_date", startOfMonth);

    const map = {};
    attendance?.forEach((a) => {
      map[a.member_id] = (map[a.member_id] || 0) + 1;
    });

    setAttendanceMap(map);
    setSingles(members || []);
    setGroups(groupMembers || []);
  }

  function getStatus(expiry) {
    const today = new Date();
    const exp = new Date(expiry);
    const diff = Math.ceil((exp - today) / 86400000);
    if (diff < 0) return "expired";
    if (diff <= 2) return "due";
    return "active";
  }

  function statusColor(status) {
    if (status === "active") return "bg-emerald-600";
    if (status === "due") return "bg-amber-500";
    return "bg-rose-600";
  }

  // ← added: filter both lists by name or phone
  const q = search.toLowerCase();
  const filteredSingles = singles.filter(
    (m) =>
      m.full_name.toLowerCase().includes(q) ||
      m.phone.includes(q)
  );
  const filteredGroups = groups.filter(
    (m) =>
      m.full_name.toLowerCase().includes(q) ||
      m.phone.includes(q)
  );

  const totalDays = new Date().getDate();

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 animate-fadeIn">

      <h1 className="text-4xl font-bold mb-6">Attendance Dashboard</h1>

      {/* SEARCH BAR ← added */}
      <div className="mb-10">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border px-4 py-3 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* SINGLE MEMBERS */}
      <h2 className="text-xl font-semibold mb-4">Single Members</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {filteredSingles.map((m) => {
          const status = getStatus(m.expiry_date);
          const attended = attendanceMap[m.id] || 0;
          const percent = Math.round((attended / totalDays) * 100);

          return (
            <div
              key={m.id}
              className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition relative"
            >
              <div className={`absolute top-0 left-0 w-full h-2 ${statusColor(status)} rounded-t-3xl`} />

              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">{m.full_name}</h3>
                <span className={`text-white text-xs px-3 py-1 rounded-full ${statusColor(status)}`}>
                  {status.toUpperCase()}
                </span>
              </div>

              <div className="text-sm text-gray-500">{m.phone}</div>
              <div className="text-sm mb-4">{m.plan_name}</div>

              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">
                  This Month: {attended} days ({percent}%)
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-indigo-600 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setSelectedPerson(m)}
                className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-xl hover:scale-105 transition"
              >
                View Full History
              </button>
            </div>
          );
        })}

        {filteredSingles.length === 0 && (
          <p className="text-slate-400 col-span-3">No single members found.</p>
        )}
      </div>

      {/* GROUP MEMBERS */}
      <h2 className="text-xl font-semibold mt-12 mb-4">
        Group Members (Primary)
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {filteredGroups.map((m) => {
          const status = getStatus(m.membership_groups.expiry_date);
          const attended = attendanceMap[m.id] || 0;
          const percent = Math.round((attended / totalDays) * 100);

          return (
            <div
              key={m.id}
              className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition relative"
            >
              <div className={`absolute top-0 left-0 w-full h-2 ${statusColor(status)} rounded-t-3xl`} />

              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">👑 {m.full_name}</h3>
                <span className={`text-white text-xs px-3 py-1 rounded-full ${statusColor(status)}`}>
                  {status.toUpperCase()}
                </span>
              </div>

              <div className="text-sm text-gray-500">{m.phone}</div>
              <div className="text-sm mb-4">
                {m.membership_groups.plan_name}
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">
                  This Month: {attended} days ({percent}%)
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-indigo-600 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setSelectedPerson(m)}
                className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-xl"
              >
                View Full History
              </button>
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <p className="text-slate-400 col-span-3">No group members found.</p>
        )}
      </div>

      {selectedPerson && (
        <AttendanceHistoryModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
}

/* ================= ENHANCED HISTORY MODAL ================= */

function AttendanceHistoryModal({ person, onClose }) {
  const [records, setRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("current");

  useEffect(() => {
    fetchMonth();
  }, [selectedMonth]);

  async function fetchMonth() {
    const today = new Date();

    let year = today.getFullYear();
    let month = today.getMonth();

    if (selectedMonth === "last") {
      month = month - 1;
    }

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("member_id", person.id)
      .gte("attendance_date", start.toISOString())
      .lte("attendance_date", end.toISOString());

    setRecords(data || []);
  }

  const attendedDates = records.map((r) =>
    new Date(r.attendance_date).getDate()
  );

  const today = new Date();
  const displayMonth =
    selectedMonth === "current"
      ? today.getMonth()
      : today.getMonth() - 1;

  const displayYear = today.getFullYear();

  const daysInMonth = new Date(
    displayYear,
    displayMonth + 1,
    0
  ).getDate();

  const percent = Math.round(
    (attendedDates.length / daysInMonth) * 100
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-[650px] shadow-2xl animate-scaleIn">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {person.full_name}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Month Switch */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setSelectedMonth("current")}
            className={`px-4 py-2 rounded-xl ${
              selectedMonth === "current"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Current Month
          </button>

          <button
            onClick={() => setSelectedMonth("last")}
            className={`px-4 py-2 rounded-xl ${
              selectedMonth === "last"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Last Month
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <div className="text-sm text-gray-500">
            Attendance: {attendedDates.length} days ({percent}%)
          </div>

          <div className="w-full h-3 bg-gray-200 rounded-full mt-2">
            <div
              className="h-3 bg-emerald-600 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7 gap-3 text-center">
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const attended = attendedDates.includes(day);

            return (
              <div
                key={day}
                className={`h-10 flex items-center justify-center rounded-xl text-sm font-medium
                  ${
                    attended
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-500"
                  }
                `}
              >
                {day}
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full bg-gray-300 py-2 rounded-xl"
        >
          Close
        </button>
      </div>
    </div>
  );
}