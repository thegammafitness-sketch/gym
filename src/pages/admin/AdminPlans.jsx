// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";

// export default function AdminPlans() {
//   const [plans, setPlans] = useState([]);
//   const [name, setName] = useState("");
//   const [duration, setDuration] = useState("");
//   const [price, setPrice] = useState("");
//   const [maxMembers, setMaxMembers] = useState(1);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchPlans();
//   }, []);

//   async function fetchPlans() {
//     const { data } = await supabase
//       .from("plans")
//       .select("*")
//       .order("created_at", { ascending: false });

//     setPlans(data || []);
//   }

//   async function addPlan(e) {
//     e.preventDefault();
//     setLoading(true);

//     await supabase.from("plans").insert({
//       name,
//       duration_days: Number(duration),
//       price: Number(price),
//       max_members: Number(maxMembers),
//     });

//     setName("");
//     setDuration("");
//     setPrice("");
//     setMaxMembers(1);
//     setLoading(false);
//     fetchPlans();
//   }

//   async function deletePlan(id) {
//     if (!confirm("Delete this plan?")) return;
//     await supabase.from("plans").delete().eq("id", id);
//     fetchPlans();
//   }

//   return (
//     <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
//       <h1 className="text-3xl font-bold mb-6">Plans & Packs</h1>

//       {/* ADD PLAN */}
//       <form
//         onSubmit={addPlan}
//         className="bg-white/70 backdrop-blur border rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
//       >
//         <input
//           placeholder="Plan Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="px-4 py-3 rounded-xl border"
//           required
//         />

//         <input
//           type="number"
//           placeholder="Duration (days)"
//           value={duration}
//           onChange={(e) => setDuration(e.target.value)}
//           className="px-4 py-3 rounded-xl border"
//           required
//         />

//         <input
//           type="number"
//           placeholder="Price (₹)"
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//           className="px-4 py-3 rounded-xl border"
//           required
//         />

//         <select
//           value={maxMembers}
//           onChange={(e) => setMaxMembers(e.target.value)}
//           className="px-4 py-3 rounded-xl border"
//         >
//           <option value={1}>Single</option>
//           <option value={2}>Couple</option>
//           <option value={3}>Buddy (3)</option>
//           <option value={4}>Buddy (4)</option>
//         </select>

//         <button
//           disabled={loading}
//           className="md:col-span-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold"
//         >
//           {loading ? "Saving..." : "Add Plan"}
//         </button>
//       </form>

//       {/* PLANS TABLE */}
//       <div className="bg-white/70 backdrop-blur border rounded-2xl shadow overflow-x-auto">
//         <table className="w-full text-left">
//           <thead className="bg-slate-100">
//             <tr>
//               <th className="p-4">Name</th>
//               <th className="p-4">Duration</th>
//               <th className="p-4">Price</th>
//               <th className="p-4">Type</th>
//               <th className="p-4">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {plans.map((p) => (
//               <tr key={p.id} className="border-t">
//                 <td className="p-4 font-medium">{p.name}</td>
//                 <td className="p-4">{p.duration_days} days</td>
//                 <td className="p-4">₹ {p.price}</td>
//                 <td className="p-4">
//                   {p.max_members === 1
//                     ? "Single"
//                     : p.max_members === 2
//                     ? "Couple"
//                     : `Buddy (${p.max_members})`}
//                 </td>
//                 <td className="p-4">
//                   <button
//                     onClick={() => deletePlan(p.id)}
//                     className="px-3 py-1 rounded-lg bg-rose-600 text-white text-sm"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {plans.length === 0 && (
//           <p className="p-6 text-center text-gray-500">
//             No plans added yet
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);

  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [maxMembers, setMaxMembers] = useState(1);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    const { data } = await supabase
      .from("plans")
      .select("*")
      .order("created_at", { ascending: false });

    setPlans(data || []);
  }

  function resetForm() {
    setName("");
    setDuration("");
    setPrice("");
    setMaxMembers(1);
    setEditingId(null);
  }

  async function savePlan(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      duration_days: Number(duration),
      price: Number(price),
      max_members: Number(maxMembers),
    };

    if (editingId) {
      // EDIT PLAN
      await supabase.from("plans").update(payload).eq("id", editingId);
    } else {
      // ADD PLAN
      await supabase.from("plans").insert(payload);
    }

    resetForm();
    setLoading(false);
    fetchPlans();
  }

  async function deletePlan(id) {
    if (!confirm("Delete this plan?")) return;
    await supabase.from("plans").delete().eq("id", id);
    fetchPlans();
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <h1 className="text-3xl font-bold mb-6">Plans & Packs</h1>

      {/* ADD / EDIT PLAN */}
      <form
        onSubmit={savePlan}
        className="bg-white/70 backdrop-blur border rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <input
          placeholder="Plan Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-3 rounded-xl border"
          required
        />

        <input
          type="number"
          placeholder="Duration (days)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="px-4 py-3 rounded-xl border"
          required
        />

        <input
          type="number"
          placeholder="Price (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="px-4 py-3 rounded-xl border"
          required
        />

        <input
          type="number"
          min={1}
          placeholder="No. of Members"
          value={maxMembers}
          onChange={(e) => setMaxMembers(e.target.value)}
          className="px-4 py-3 rounded-xl border"
          required
        />

        <button
          disabled={loading}
          className="md:col-span-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold"
        >
          {loading ? "Saving..." : editingId ? "Update Plan" : "Add Plan"}
        </button>
      </form>

      {/* PLANS TABLE */}
      <div className="bg-white/70 backdrop-blur border rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Price</th>
              <th className="p-4">Type</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">{p.duration_days} days</td>
                <td className="p-4">₹ {p.price}</td>
                <td className="p-4">
                  {p.max_members === 1
                    ? "Single"
                    : p.max_members === 2
                      ? "Couple"
                      : `Buddy (${p.max_members})`}
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(p.id);
                      setName(p.name);
                      setDuration(p.duration_days);
                      setPrice(p.price);
                      setMaxMembers(p.max_members);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-500 text-white text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deletePlan(p.id)}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {plans.length === 0 && (
          <p className="p-6 text-center text-gray-500">No plans added yet</p>
        )}
      </div>
    </div>
  );
}
