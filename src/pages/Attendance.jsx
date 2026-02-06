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
    const exp = new Date(expiryDate);
    const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

    if (diff < 0) return "EXPIRED";
    if (diff <= 2) return "DUE";
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

    const { data: members } = await supabase.from("members").select("*");

    const member = members?.find((m) => m.phone.slice(-5) === last5);

    if (!member) {
      setStatus("INVALID");
      setMessage("Member not found");
      setLoading(false);
      return;
    }

    const currentStatus = getStatus(member.expiry_date);
    setStatus(currentStatus);

    if (currentStatus === "EXPIRED") {
      setMessage("Membership expired");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("attendance").insert({
      member_id: member.id,
      attendance_date: new Date().toISOString().split("T")[0],
      attendance_time: new Date().toTimeString().split(" ")[0],
    });

    if (error) {
      setStatus("DUE");
      setMessage("Attendance already marked today");
      setLoading(false);
      return;
    }

    setMessage("Attendance marked successfully");
    setLast5("");
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="absolute top-6 right-6">
        <button
          onClick={() => navigate("/admin")}
          className="px-5 py-2 rounded-xl bg-gray-900 text-white font-semibold"
        >
          Admin
        </button>
      </div>

      <div
        className="
        w-full 
        max-w-md 
        md:max-w-lg 
        bg-white 
        rounded-3xl 
        p-10 
        md:p-14
        shadow-2xl 
        text-center
      "
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-10">
          Gym Attendance
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <input
            type="password"
            inputMode="numeric"
            maxLength={5}
            placeholder="Last 5 Digits"
            value={last5}
            onChange={(e) => setLast5(e.target.value)}
            className="
              w-full 
              text-center 
              text-3xl 
              md:text-4xl
              tracking-widest 
              px-6 
              py-6 
              rounded-2xl 
              border-2 
              border-gray-300
              focus:border-red-500
              focus:ring-4 
              focus:ring-red-200
              outline-none
              text-gray-900
            "
          />

          <button
            disabled={loading}
            className="
              w-full 
              py-6 
              bg-red-600 
              hover:bg-red-700 
              rounded-2xl 
              text-white 
              font-extrabold 
              text-2xl 
              md:text-3xl
              active:scale-95 
              transition
            "
          >
            {loading ? "Checking..." : "Mark Attendance"}
          </button>
        </form>

        {message && (
          <div
            className={`
            mt-8 
            text-xl 
            md:text-2xl 
            font-bold
            ${status === "ACTIVE" && "text-green-600"}
            ${status === "DUE" && "text-orange-500"}
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
