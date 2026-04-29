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

// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";

// export default function AdminAttendance() {
//   const [singles, setSingles] = useState([]);
//   const [groups, setGroups] = useState([]);
//   const [attendanceMap, setAttendanceMap] = useState({});
//   const [selectedPerson, setSelectedPerson] = useState(null);
//   const [search, setSearch] = useState(""); // ← added

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

//   // ← added: filter both lists by name or phone
//   const q = search.toLowerCase();
//   const filteredSingles = singles.filter(
//     (m) =>
//       m.full_name.toLowerCase().includes(q) ||
//       m.phone.includes(q)
//   );
//   const filteredGroups = groups.filter(
//     (m) =>
//       m.full_name.toLowerCase().includes(q) ||
//       m.phone.includes(q)
//   );

//   const totalDays = new Date().getDate();

//   return (
//     <div className="p-10 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 animate-fadeIn">

//       <h1 className="text-4xl font-bold mb-6">Attendance Dashboard</h1>

//       {/* SEARCH BAR ← added */}
//       <div className="mb-10">
//         <input
//           type="text"
//           placeholder="Search by name or phone..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full border px-4 py-3 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//         />
//       </div>

//       {/* SINGLE MEMBERS */}
//       <h2 className="text-xl font-semibold mb-4">Single Members</h2>
//       <div className="grid md:grid-cols-3 gap-6">
//         {filteredSingles.map((m) => {
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

//         {filteredSingles.length === 0 && (
//           <p className="text-slate-400 col-span-3">No single members found.</p>
//         )}
//       </div>

//       {/* GROUP MEMBERS */}
//       <h2 className="text-xl font-semibold mt-12 mb-4">
//         Group Members (Primary)
//       </h2>

//       <div className="grid md:grid-cols-3 gap-6">
//         {filteredGroups.map((m) => {
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

//         {filteredGroups.length === 0 && (
//           <p className="text-slate-400 col-span-3">No group members found.</p>
//         )}
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
import { createPortal } from "react-dom";
import { supabase } from "../../supabase";

function Modal({ children }) {
  return createPortal(children, document.body);
}

function getStatus(expiry) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp   = new Date(expiry); exp.setHours(0, 0, 0, 0);
  const diff  = Math.ceil((exp - today) / 86400000);
  if (diff <= 0) return "expired";
  if (diff <= 2) return "due";
  return "active";
}

const STATUS_STYLES = {
  active:  { badge: "bg-emerald-600", bar: "from-emerald-500 to-green-600" },
  due:     { badge: "bg-amber-500",   bar: "from-amber-500 to-orange-600" },
  expired: { badge: "bg-rose-600",    bar: "from-rose-500 to-red-600" },
};

export default function AdminAttendance() {
  const [singles, setSingles]             = useState([]);
  const [groups, setGroups]               = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [search, setSearch]               = useState("");
  const [loading, setLoading]             = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);

    const { data: members } = await supabase
      .from("members")
      .select("id, full_name, phone, plan_name, expiry_date");

    const { data: groupMembers } = await supabase
      .from("group_members")
      .select(`id, full_name, phone, is_primary,
        membership_groups (plan_name, expiry_date)`)
      .eq("is_primary", true);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: attendance } = await supabase
      .from("attendance")
      .select("member_id")
      .gte("attendance_date", startOfMonth);

    const map = {};
    (attendance || []).forEach((a) => {
      map[a.member_id] = (map[a.member_id] || 0) + 1;
    });

    setAttendanceMap(map);
    setSingles(members || []);
    setGroups(groupMembers || []);
    setLoading(false);
  }

  const q = search.toLowerCase();
  const filteredSingles = (singles || []).filter(
    (m) => m.full_name?.toLowerCase().includes(q) || m.phone?.includes(q)
  );
  const filteredGroups = (groups || []).filter(
    (m) => m.full_name?.toLowerCase().includes(q) || m.phone?.includes(q)
  );

  const now = new Date();
  const daysElapsedThisMonth = now.getDate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400 text-lg animate-pulse">Loading attendance data…</div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-800">Attendance Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track attendance for {singles.length + groups.length} members
          </p>
        </div>
        <button onClick={fetchAll}
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:scale-105 transition shadow">
          ↻ Refresh
        </button>
      </div>

      <div className="mb-10 relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
        <input type="text" placeholder="Search by name or phone…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border pl-10 pr-4 py-3 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-bold text-slate-700">Single Members</h2>
        <span className="text-xs bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full font-semibold">
          {filteredSingles.length}
        </span>
      </div>

      {filteredSingles.length === 0 ? (
        <div className="text-center py-16 text-slate-400 mb-12">
          <div className="text-5xl mb-3">👤</div>
          <div className="text-sm">No single members found</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {filteredSingles.map((m) => {
            const status   = getStatus(m.expiry_date);
            const style    = STATUS_STYLES[status];
            const attended = attendanceMap[m.id] || 0;
            const percent  = Math.round((attended / daysElapsedThisMonth) * 100);

            return (
              <div key={m.id}
                className="relative bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${style.bar}`} />
                <div className="pl-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">{m.full_name}</h3>
                      <p className="text-xs text-slate-400">{m.phone}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs rounded-full font-bold text-white shrink-0 ml-2 ${style.badge}`}>
                      {status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 mb-4 truncate">{m.plan_name}</div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-500 font-medium">This Month</span>
                      <span className="text-xs font-bold text-indigo-600">{attended} / {daysElapsedThisMonth} days</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all"
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    <div className="text-center text-xs font-bold text-slate-600 mt-1">{percent}%</div>
                  </div>
                  <button onClick={() => setSelectedPerson(m)}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
                    📅 View Full History
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-bold text-slate-700">Group Members (Primary)</h2>
        <span className="text-xs bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full font-semibold">
          {filteredGroups.length}
        </span>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">👥</div>
          <div className="text-sm">No group members found</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGroups.map((m) => {
            const status   = getStatus(m.membership_groups.expiry_date);
            const style    = STATUS_STYLES[status];
            const attended = attendanceMap[m.id] || 0;
            const percent  = Math.round((attended / daysElapsedThisMonth) * 100);

            return (
              <div key={m.id}
                className="relative bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${style.bar}`} />
                <div className="pl-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">
                        <span className="mr-1">👑</span>{m.full_name}
                      </h3>
                      <p className="text-xs text-slate-400">{m.phone}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs rounded-full font-bold text-white shrink-0 ml-2 ${style.badge}`}>
                      {status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 mb-4 truncate">
                    {m.membership_groups.plan_name}
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-500 font-medium">This Month</span>
                      <span className="text-xs font-bold text-indigo-600">{attended} / {daysElapsedThisMonth} days</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all"
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    <div className="text-center text-xs font-bold text-slate-600 mt-1">{percent}%</div>
                  </div>
                  <button onClick={() => setSelectedPerson(m)}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
                    📅 View Full History
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedPerson && (
        <Modal>
          <AttendanceHistoryModal person={selectedPerson} onClose={() => setSelectedPerson(null)} />
        </Modal>
      )}
    </div>
  );
}

function AttendanceHistoryModal({ person, onClose }) {
  const [records, setRecords]             = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("current");
  const [loading, setLoading]             = useState(true);

  useEffect(() => { fetchMonth(); }, [selectedMonth]);

  async function fetchMonth() {
    setLoading(true);
    const today = new Date();
    let year  = today.getFullYear();
    let month = today.getMonth();

    if (selectedMonth === "last") {
      month = month - 1;
      if (month < 0) { month = 11; year = year - 1; }
    }

    const start = new Date(year, month, 1);
    const end   = new Date(year, month + 1, 0);

    const { data } = await supabase.from("attendance").select("*")
      .eq("member_id", person.id)
      .gte("attendance_date", start.toISOString())
      .lte("attendance_date", end.toISOString());

    setRecords(data || []);
    setLoading(false);
  }

  const attendedDates = records.map((r) => new Date(r.attendance_date).getDate());
  const today         = new Date();
  const displayMonth  = selectedMonth === "current" ? today.getMonth() : today.getMonth() - 1;
  const displayYear   = today.getFullYear();
  const daysInMonth   = new Date(displayYear, displayMonth + 1, 0).getDate();
  const percent       = Math.round((attendedDates.length / daysInMonth) * 100);
  const monthNames    = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{person.full_name}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{person.phone}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">✕</button>
        </div>

        <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl">
          <button onClick={() => setSelectedMonth("current")}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              selectedMonth === "current" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-800"
            }`}>
            Current Month
          </button>
          <button onClick={() => setSelectedMonth("last")}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              selectedMonth === "last" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-800"
            }`}>
            Last Month
          </button>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-slate-600">
              {monthNames[displayMonth]} {displayYear}
            </span>
            <span className="text-xl font-extrabold text-indigo-600">
              {attendedDates.length} / {daysInMonth} days
            </span>
          </div>
          <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <div className="text-center text-sm font-bold text-slate-700">{percent}% Attendance</div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 animate-pulse">Loading calendar…</div>
        ) : (
          <div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-center text-xs font-bold text-slate-400">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day      = i + 1;
                const attended = attendedDates.includes(day);
                return (
                  <div key={day}
                    className={`h-11 flex items-center justify-center rounded-xl text-sm font-semibold transition ${
                      attended
                        ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}>
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button onClick={onClose}
          className="mt-8 w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition">
          Close
        </button>
      </div>
    </div>
  );
}