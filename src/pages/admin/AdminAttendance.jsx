import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export default function AdminAttendance() {
  const [singles, setSingles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    // singles
    const { data: members } = await supabase
      .from("members")
      .select("id, full_name, phone, plan_name, expiry_date");

    // group primary members
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

    // attendance (current month)
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
    if (status === "active") return "bg-green-600";
    if (status === "due") return "bg-yellow-500";
    return "bg-red-600";
  }

  const totalDays = new Date().getDate();


  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Attendance Dashboard</h1>

      {/* SINGLE MEMBERS */}
      <h2 className="font-semibold mb-3">Single Members</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {singles.map((m) => {
          const status = getStatus(m.expiry_date);
          const attended = attendanceMap[m.id] || 0;

          return (
            <div key={m.id} className="border p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <b>{m.full_name}</b>
                <span
                  className={`text-white text-xs px-2 py-1 rounded ${statusColor(
                    status
                  )}`}
                >
                  {status.toUpperCase()}
                </span>
              </div>

              <div className="text-sm mt-1">{m.phone}</div>
              <div className="text-sm mt-1">{m.plan_name}</div>

              {/* <div className="mt-3 text-sm">
                <b>This Month</b>
                <div>Attended: {attended}</div>
                <div>Missed: {totalDays - attended}</div>
              </div> */}

              <button
                onClick={() => setSelectedPerson(m)}
                className="mt-3 px-3 py-1 bg-indigo-600 text-white rounded"
              >
                View Full History
              </button>
            </div>
          );
        })}
      </div>

      {/* GROUP MEMBERS */}
      <h2 className="font-semibold mt-8 mb-3">Group Members (Primary)</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {groups.map((m) => {
          const status = getStatus(m.membership_groups.expiry_date);
          const attended = attendanceMap[m.id] || 0;

          return (
            <div key={m.id} className="border p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <b>👑 {m.full_name}</b>
                <span
                  className={`text-white text-xs px-2 py-1 rounded ${statusColor(
                    status
                  )}`}
                >
                  {status.toUpperCase()}
                </span>
              </div>

              <div className="text-sm mt-1">{m.phone}</div>
              <div className="text-sm mt-1">
                {m.membership_groups.plan_name}
              </div>

              {/* <div className="mt-3 text-sm">
                <b>This Month</b>
                <div>Attended: {attended}</div>
                <div>Missed: {totalDays - attended}</div>
              </div> */}

              <button
                onClick={() => setSelectedPerson(m)}
                className="mt-3 px-3 py-1 bg-indigo-600 text-white rounded"
              >
                View Full History
              </button>
            </div>
          );
        })}
      </div>

      {/* FULL HISTORY MODAL */}
      {selectedPerson && (
        <AttendanceHistoryModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
}

/* ================= HISTORY MODAL ================= */

function AttendanceHistoryModal({ person, onClose }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    supabase
      .from("attendance")
      .select("*")
      .eq("member_id", person.id)
      .order("attendance_date", { ascending: false })
      .then(({ data }) => setRecords(data || []));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-full max-w-lg">
        <h3 className="font-semibold mb-4">
          Attendance History – {person.full_name}
        </h3>

        <div className="max-h-96 overflow-y-auto">
          {records.map((r) => (
            <div key={r.id} className="border-b py-2 text-sm">
              {r.attendance_date} – {r.attendance_time}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";
// // import AttendanceCalendar from "../../components/AttendanceCalendar";
// import AttendanceCalendar from "../AttendanceCalendar";

// export default function AdminAttendance() {
//   const [members, setMembers] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [attendanceDates, setAttendanceDates] = useState([]);

//   useEffect(() => {
//     fetchMembers();
//   }, []);

//   async function fetchMembers() {
//     const { data: singles } = await supabase
//       .from("members")
//       .select("id, full_name, phone");

//     const { data: groups } = await supabase
//       .from("group_members")
//       .select("id, full_name, phone")
//       .eq("is_primary", true);

//     setMembers([...(singles || []), ...(groups || [])]);
//   }

//   async function loadAttendance(member) {
//     setSelected(member);

//     const start = new Date();
//     start.setMonth(start.getMonth() - 1);

//     const { data } = await supabase
//       .from("attendance")
//       .select("attendance_date")
//       .eq("member_id", member.id)
//       .gte("attendance_date", start.toISOString());

//     setAttendanceDates(
//       (data || []).map((d) => d.attendance_date)
//     );
//   }

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-6">Attendance</h1>

//       <div className="grid md:grid-cols-3 gap-4">
//         {members.map((m) => (
//           <div
//             key={m.id}
//             className="border p-4 rounded cursor-pointer hover:bg-gray-50"
//             onClick={() => loadAttendance(m)}
//           >
//             <b>{m.full_name}</b>
//             <div className="text-sm">{m.phone}</div>
//           </div>
//         ))}
//       </div>

//       {selected && (
//         <div className="mt-8">
//           <h2 className="font-semibold mb-2">
//             Attendance – {selected.full_name}
//           </h2>
//           <AttendanceCalendar attendanceDates={attendanceDates} />
//         </div>
//       )}
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";

// function formatLocalDate(date) {
//   const y = date.getFullYear();
//   const m = String(date.getMonth() + 1).padStart(2, "0");
//   const d = String(date.getDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// }

// export default function AdminAttendance() {
//   const [people, setPeople] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [dates, setDates] = useState([]);

//   useEffect(() => {
//     loadPeople();
//   }, []);

//   async function loadPeople() {
//     const { data: singles } = await supabase
//       .from("members")
//       .select("id, full_name, phone");

//     const { data: groups } = await supabase
//       .from("group_members")
//       .select("id, full_name, phone")
//       .eq("is_primary", true);

//     setPeople([...(singles || []), ...(groups || [])]);
//   }

//   async function loadAttendance(p) {
//     setSelected(p);

//     const start = new Date();
//     start.setMonth(start.getMonth() - 1);

//     const { data } = await supabase
//       .from("attendance")
//       .select("attendance_date")
//       .eq("member_id", p.id)
//       .gte("attendance_date", start.toISOString());

//     setDates(data.map((d) => d.attendance_date));
//   }

//   function tileClassName({ date, view }) {
//     if (view !== "month") return null;

//     const today = new Date();
//     const d = formatLocalDate(date);

//     if (date > today) return "bg-gray-300";
//     if (dates.includes(d)) return "bg-green-500 text-white rounded-full";
//     return "bg-red-500 text-white rounded-full";
//   }

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-6">Attendance Dashboard</h1>

//       <div className="grid md:grid-cols-3 gap-4">
//         {people.map((p) => (
//           <div
//             key={p.id}
//             onClick={() => loadAttendance(p)}
//             className="border p-4 rounded cursor-pointer hover:bg-gray-100"
//           >
//             <b>{p.full_name}</b>
//             <div className="text-sm">{p.phone}</div>
//           </div>
//         ))}
//       </div>

//       {selected && (
//         <div className="mt-8 max-w-md">
//           <h2 className="font-semibold mb-2">
//             Attendance – {selected.full_name}
//           </h2>
//           <Calendar tileClassName={tileClassName} />
//         </div>
//       )}
//     </div>
//   );
// }
