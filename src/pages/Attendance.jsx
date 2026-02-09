// import { useState } from "react";
// import { supabase } from "../supabase";

// export default function Attendance() {
//   const [last5, setLast5] = useState("");
//   const [message, setMessage] = useState("");
//   const [status, setStatus] = useState(null);
//   const [loading, setLoading] = useState(false);

//   function getStatus(expiryDate) {
//     const today = new Date();
//     const exp = new Date(expiryDate);
//     const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

//     if (diff < 0) return "EXPIRED";
//     if (diff <= 2) return "DUE";
//     return "ACTIVE";
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();

//     if (last5.length !== 5) {
//       setStatus("INVALID");
//       setMessage("Enter last 5 digits");
//       return;
//     }

//     setLoading(true);
//     setMessage("");

//     // 🔍 Find member by last 5 digits
//     const { data: members, error } = await supabase.from("members").select("*");
//     // console.log('Members from DB:', members);

//     if (error || !members) {
//       setStatus("INVALID");
//       setMessage("Something went wrong");
//       setLoading(false);
//       return;
//     }

//     const member = members.find((m) => m.phone.slice(-5) === last5);

//     if (!member) {
//       setStatus("INVALID");
//       setMessage("Member not found");
//       setLoading(false);
//       return;
//     }

//     const currentStatus = getStatus(member.expiry_date);
//     setStatus(currentStatus);

//     if (currentStatus === "EXPIRED") {
//       setMessage("Membership expired");
//       setLoading(false);
//       return;
//     }

//     const { error: insertError } = await supabase.from("attendance").insert({
//       member_id: member.id,
//       attendance_date: new Date().toISOString().split("T")[0],
//       attendance_time: new Date().toTimeString().split(" ")[0],
//     });

//     if (insertError) {
//       setStatus("DUE");
//       setMessage("Attendance already marked today");
//       setLoading(false);
//       return;
//     }

//     setMessage("Attendance marked successfully");
//     setLoading(false);
//     setLast5("");
//   }

//   return (
//     <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center px-4">
//       <div
//         className="w-full max-w-md md:max-w-lg lg:max-w-xlbg-[#121826] rounded-3xl p-10 md:p-14shadow-2xl text-center"
//       >
//         <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-10">
//           Gym Attendance
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <input
//             type="password"
//             inputMode="numeric"
//             maxLength={5}
//             placeholder="Last 5 Digits"
//             value={last5}
//             onChange={(e) => setLast5(e.target.value)}
//             className="w-full text-center text-3xl md:text-4xltracking-widest px-6 py-6 rounded-2xl bg-[#0B0F14] text-white outline-none focus:ring-4 focus:ring-red-600"
//           />

//           <button
//             disabled={loading}
//             className="w-full py-6 mt-4bg-red-600 hover:bg-red-700 rounded-2xl text-white font-extrabold text-2xl md:text-3xlactive:scale-95 transition"
//           >
//             {loading ? "Checking..." : "Mark Attendance"}
//           </button>
//         </form>

//         {message && (
//           <div
//             className={`mt-6 font-semibold
//             ${status === "ACTIVE" && "text-green-400"}
//             ${status === "DUE" && "text-yellow-400"}
//             ${status === "EXPIRED" && "text-red-400"}
//             ${status === "INVALID" && "text-red-400"}
//           `}
//           >
//             {message}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// import { useState } from "react";
// import { supabase } from "../supabase";
// import { useNavigate } from "react-router-dom";

// export default function Attendance() {
//   const [last5, setLast5] = useState("");
//   const [message, setMessage] = useState("");
//   const [status, setStatus] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   function getStatus(expiryDate) {
//     const today = new Date();
//     const exp = new Date(expiryDate);
//     const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

//     if (diff < 0) return "EXPIRED";
//     if (diff <= 2) return "DUE";
//     return "ACTIVE";
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();

//     if (last5.length !== 5) {
//       setStatus("INVALID");
//       setMessage("Enter last 5 digits");
//       return;
//     }

//     setLoading(true);
//     setMessage("");

//     const { data: members } = await supabase.from("members").select("*");

//     const member = members?.find((m) => m.phone.slice(-5) === last5);

//     if (!member) {
//       setStatus("INVALID");
//       setMessage("Member not found");
//       setLoading(false);
//       return;
//     }

//     const currentStatus = getStatus(member.expiry_date);
//     setStatus(currentStatus);

//     if (currentStatus === "EXPIRED") {
//       setMessage("Membership expired");
//       setLoading(false);
//       return;
//     }

//     const { error } = await supabase.from("attendance").insert({
//       member_id: member.id,
//       attendance_date: new Date().toISOString().split("T")[0],
//       attendance_time: new Date().toTimeString().split(" ")[0],
//     });

//     if (error) {
//       setStatus("DUE");
//       setMessage("Attendance already marked today");
//       setLoading(false);
//       return;
//     }

//     setMessage("Attendance marked successfully");
//     setLast5("");
//     setLoading(false);
//   }

//   return (
//     <div className="relative min-h-screen bg-gray-100 flex items-center justify-center px-4">
//       <div className="absolute top-6 right-6">
//         <button
//           onClick={() => navigate("/admin")}
//           className="px-5 py-2 rounded-xl bg-gray-900 text-white font-semibold"
//         >
//           Admin
//         </button>
//       </div>

//       <div
//         className="
//         w-full
//         max-w-md
//         md:max-w-lg
//         bg-white
//         rounded-3xl
//         p-10
//         md:p-14
//         shadow-2xl
//         text-center
//       "
//       >
//         <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-10">
//           Gym Attendance
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-8">
//           <input
//             type="password"
//             inputMode="numeric"
//             maxLength={5}
//             placeholder="Last 5 Digits"
//             value={last5}
//             onChange={(e) => setLast5(e.target.value)}
//             className="
//               w-full
//               text-center
//               text-3xl
//               md:text-4xl
//               tracking-widest
//               px-6
//               py-6
//               rounded-2xl
//               border-2
//               border-gray-300
//               focus:border-red-500
//               focus:ring-4
//               focus:ring-red-200
//               outline-none
//               text-gray-900
//             "
//           />

//           <button
//             disabled={loading}
//             className="
//               w-full
//               py-6
//               bg-red-600
//               hover:bg-red-700
//               rounded-2xl
//               text-white
//               font-extrabold
//               text-2xl
//               md:text-3xl
//               active:scale-95
//               transition
//             "
//           >
//             {loading ? "Checking..." : "Mark Attendance"}
//           </button>
//         </form>

//         {message && (
//           <div
//             className={`
//             mt-8
//             text-xl
//             md:text-2xl
//             font-bold
//             ${status === "ACTIVE" && "text-green-600"}
//             ${status === "DUE" && "text-orange-500"}
//             ${status === "EXPIRED" && "text-red-600"}
//             ${status === "INVALID" && "text-red-600"}
//           `}
//           >
//             {message}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// import { useState } from "react";
// import { supabase } from "../supabase";
// import { useNavigate } from "react-router-dom";

// export default function Attendance() {
//   const [last5, setLast5] = useState("");
//   const [message, setMessage] = useState("");
//   const [status, setStatus] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   function getStatus(expiryDate) {
//     const today = new Date();
//     const exp = new Date(expiryDate);
//     const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

//     if (diff < 0) return "EXPIRED";
//     if (diff <= 2) return "DUE";
//     return "ACTIVE";
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();

//     if (last5.length !== 5) {
//       setStatus("INVALID");
//       setMessage("Enter last 5 digits");
//       return;
//     }

//     setLoading(true);
//     setMessage("");
//     setStatus(null);

//     /* ================= SINGLE MEMBERS ================= */
//     const { data: singles } = await supabase
//       .from("members")
//       .select("id, full_name, phone, expiry_date, plan_name");

//     let person = singles?.find(
//       (m) => m.phone?.slice(-5) === last5
//     );

//     let expiryDate = null;
//     let planName = null;

//     /* ================= GROUP PRIMARY MEMBERS ================= */
//     if (!person) {
//       const { data: groupPrimary } = await supabase
//         .from("group_members")
//         .select(`
//           id,
//           full_name,
//           phone,
//           is_primary,
//           membership_groups (
//             expiry_date,
//             plan_name
//           )
//         `)
//         .eq("is_primary", true);

//       const gp = groupPrimary?.find(
//         (g) => g.phone?.slice(-5) === last5
//       );

//       if (gp) {
//         person = gp;
//         expiryDate = gp.membership_groups.expiry_date;
//         planName = gp.membership_groups.plan_name;
//       }
//     }

//     /* ================= VALIDATION ================= */
//     if (!person) {
//       setStatus("INVALID");
//       setMessage("Member not found");
//       setLoading(false);
//       return;
//     }

//     // single member
//     if (!expiryDate) {
//       expiryDate = person.expiry_date;
//       planName = person.plan_name;
//     }

//     const currentStatus = getStatus(expiryDate);
//     setStatus(currentStatus);

//     if (currentStatus === "EXPIRED") {
//       setMessage("Membership expired");
//       setLoading(false);
//       return;
//     }

//     /* ================= ATTENDANCE INSERT ================= */
//     const todayDate = new Date().toISOString().split("T")[0];

//     const { error } = await supabase.from("attendance").insert({
//       member_id: person.id, // works for both single & group primary
//       attendance_date: todayDate,
//       attendance_time: new Date().toTimeString().split(" ")[0],
//       plan_name: planName,
//     });

//     if (error) {
//       setStatus("DUE");
//       setMessage("Attendance already marked today");
//       setLoading(false);
//       return;
//     }

//     setMessage(
//       `Attendance marked successfully for ${person.full_name}`
//     );
//     setLast5("");
//     setLoading(false);
//   }

//   return (
//     <div className="relative min-h-screen bg-gray-100 flex items-center justify-center px-4">
//       <div className="absolute top-6 right-6">
//         <button
//           onClick={() => navigate("/admin")}
//           className="px-5 py-2 rounded-xl bg-gray-900 text-white font-semibold"
//         >
//           Admin
//         </button>
//       </div>

//       <div className="w-full max-w-md md:max-w-lg bg-white rounded-3xl p-10 md:p-14 shadow-2xl text-center">
//         <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-10">
//           Gym Attendance
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-8">
//           <input
//             type="password"
//             inputMode="numeric"
//             maxLength={5}
//             placeholder="Last 5 Digits"
//             value={last5}
//             onChange={(e) => setLast5(e.target.value)}
//             className="w-full text-center text-3xl md:text-4xl tracking-widest px-6 py-6 rounded-2xl border-2 border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-200 outline-none text-gray-900"
//           />

//           <button
//             disabled={loading}
//             className="w-full py-6 bg-red-600 hover:bg-red-700 rounded-2xl text-white font-extrabold text-2xl md:text-3xl active:scale-95 transition"
//           >
//             {loading ? "Checking..." : "Mark Attendance"}
//           </button>
//         </form>

//         {message && (
//           <div
//             className={`mt-8 text-xl md:text-2xl font-bold
//               ${status === "ACTIVE" && "text-green-600"}
//               ${status === "DUE" && "text-orange-500"}
//               ${status === "EXPIRED" && "text-red-600"}
//               ${status === "INVALID" && "text-red-600"}
//             `}
//           >
//             {message}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function Attendance() {
  const [last5, setLast5] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function getStatus(expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 🔒 reset time

    const exp = new Date(expiryDate);
    exp.setHours(23, 59, 59, 999); // 🔒 expiry valid full day

    if (exp < today) return "EXPIRED";

    const diffDays = Math.ceil((exp - today) / 86400000);

    if (diffDays <= 2) return "DUE";
    return "ACTIVE";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (last5.length !== 5) {
      setStatus("INVALID");
      setMessage("Enter last 5 digits");
      return;
    }

    setLoading(true);
    setMessage("");
    setStatus(null);

    let person = null;
    let expiryDate = null;
    let planName = null;

    /* ================= SINGLE MEMBERS ================= */
    const { data: singles } = await supabase
      .from("members")
      .select("id, full_name, phone, expiry_date, plan_name");

    person = singles?.find((m) => m.phone?.slice(-5) === last5);

    if (person) {
      expiryDate = person.expiry_date;
      planName = person.plan_name;
    }

    /* ================= GROUP PRIMARY ================= */
    if (!person) {
      const { data: primaries } = await supabase
        .from("group_members")
        .select("id, full_name, phone, group_id")
        .eq("is_primary", true);

      const gp = primaries?.find((g) => g.phone?.slice(-5) === last5);

      if (gp) {
        person = gp;

        const { data: group, error } = await supabase
          .from("membership_groups")
          .select("expiry_date, plan_name")
          .eq("id", gp.group_id)
          .single();

        if (!group || error) {
          setStatus("EXPIRED");
          setMessage("Group membership not found");
          setLoading(false);
          return;
        }

        expiryDate = group.expiry_date;
        planName = group.plan_name;
      }
    }

    if (!person) {
      setStatus("INVALID");
      setMessage("Member not found");
      setLoading(false);
      return;
    }

    const currentStatus = getStatus(expiryDate);
    setStatus(currentStatus);

    if (currentStatus === "EXPIRED") {
      setMessage("Membership expired");
      setLoading(false);
      return;
    }

    const todayLocal = new Date();
    const todayDate = `${todayLocal.getFullYear()}-${String(
      todayLocal.getMonth() + 1,
    ).padStart(2, "0")}-${String(todayLocal.getDate()).padStart(2, "0")}`;

    const { error } = await supabase.from("attendance").insert({
      member_id: person.id,
       source_type: person.group_id ? "group" : "single",
      attendance_date: todayDate,
      attendance_time: todayLocal.toTimeString().split(" ")[0],
      plan_name: planName,
    });

    if (error) {
      setStatus("DUE");
      setMessage("Attendance already marked today");
      setLoading(false);
      return;
    }

    setMessage(`Attendance marked for ${person.full_name}`);
    setLast5("");
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen bg-gray-100 flex items-center justify-center">
      <button
        onClick={() => navigate("/admin")}
        className="absolute top-6 right-6 bg-black text-white px-4 py-2 rounded"
      >
        Admin
      </button>

      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-8">Gym Attendance</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="password"
            maxLength={5}
            value={last5}
            onChange={(e) => setLast5(e.target.value)}
            placeholder="Last 5 digits"
            className="w-full text-center text-3xl p-4 border rounded-xl"
          />

          <button
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded-xl text-2xl font-bold"
          >
            {loading ? "Checking..." : "Mark Attendance"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 font-bold text-xl
              ${status === "ACTIVE" && "text-green-600"}
              ${status === "DUE" && "text-yellow-500"}
              ${status === "EXPIRED" && "text-red-600"}
              ${status === "INVALID" && "text-red-600"}
            `}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
