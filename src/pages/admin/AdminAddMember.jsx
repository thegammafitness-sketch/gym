// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";
// import { motion } from "framer-motion";

// export default function AdminAddMember() {
//   const [plans, setPlans] = useState([]);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [members, setMembers] = useState([]);
//   const [loading, setLoading] = useState(false);

//   /* ================= FETCH PLANS ================= */

//   useEffect(() => {
//     fetchPlans();
//   }, []);

//   async function fetchPlans() {
//     const { data } = await supabase.from("plans").select("*");
//     setPlans(data || []);
//   }

//   /* ================= HANDLE PLAN CHANGE ================= */

//   function handlePlanChange(planId) {
//     const plan = plans.find((p) => p.id === planId);
//     setSelectedPlan(plan);

//     // create empty member slots
//     const slots = Array.from({ length: plan.max_members }).map((_, i) => ({
//       full_name: "",
//       phone: "",
//       photo: null,
//       is_primary: i === 0,
//     }));

//     setMembers(slots);
//   }

//   /* ================= PHOTO UPLOAD ================= */

//   async function uploadPhoto(file) {
//     const fileExt = file.name.split(".").pop();
//     const fileName = `${crypto.randomUUID()}.${fileExt}`;

//     const { error } = await supabase.storage
//       .from("member-photos")
//       .upload(fileName, file);

//     if (error) throw error;

//     const { data } = supabase.storage
//       .from("member-photos")
//       .getPublicUrl(fileName);

//     return data.publicUrl;
//   }

//   /* ================= SUBMIT ================= */

//   async function handleSubmit() {
//     if (!selectedPlan) {
//       alert("Select a plan");
//       return;
//     }

//     if (members.some((m) => !m.full_name || !m.phone)) {
//       alert("Fill all member details");
//       return;
//     }

//     try {
//       setLoading(true);

//       // 1️⃣ Create membership group
//       const { data: group, error: groupError } = await supabase
//         .from("membership_groups")
//         .insert({ plan_id: selectedPlan.id })
//         .select()
//         .single();

//       if (groupError) throw groupError;

//       // 2️⃣ Dates
//       const startDate = new Date();
//       const expiryDate = new Date();
//       expiryDate.setDate(
//         startDate.getDate() + selectedPlan.duration_days
//       );

//       const startStr = startDate.toISOString().split("T")[0];
//       const expiryStr = expiryDate.toISOString().split("T")[0];

//       // 3️⃣ Upload photos + prepare members
//       const payload = [];

//       for (const m of members) {
//         let photoUrl = null;
//         if (m.photo) {
//           photoUrl = await uploadPhoto(m.photo);
//         }

//         payload.push({
//           full_name: m.full_name,
//           phone: m.phone,
//           photo_url: photoUrl,
//           group_id: group.id,
//           is_primary: m.is_primary,
//           plan_id: selectedPlan.id,
//           plan_name: selectedPlan.name,
//           start_date: startStr,
//           expiry_date: expiryStr,
//         });
//       }

//       // 4️⃣ Insert members
//       const { error: memberError } = await supabase
//         .from("members")
//         .insert(payload);

//       if (memberError) throw memberError;

//       alert("Member(s) added successfully ✅");
//       setSelectedPlan(null);
//       setMembers([]);
//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong. Check console.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   /* ================= UI ================= */

//   return (
//     <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
//       <h1 className="text-3xl font-bold mb-6">Add Member</h1>

//       {/* PLAN SELECT */}
//       <select
//         className="px-4 py-3 rounded-xl border mb-6 w-full max-w-md"
//         onChange={(e) => handlePlanChange(e.target.value)}
//         value={selectedPlan?.id || ""}
//       >
//         <option value="">Select Plan</option>
//         {plans.map((p) => (
//           <option key={p.id} value={p.id}>
//             {p.name} – ₹{p.price} ({p.duration_days} days)
//           </option>
//         ))}
//       </select>

//       {/* MEMBERS FORM */}
//       {members.map((m, index) => (
//         <motion.div
//           key={index}
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white/70 backdrop-blur border rounded-2xl p-6 mb-4"
//         >
//           <h3 className="font-semibold mb-4">
//             {m.is_primary
//               ? "Primary Member"
//               : `Member ${index + 1}`}
//           </h3>

//           <div className="grid md:grid-cols-3 gap-4">
//             <input
//               placeholder="Full Name"
//               value={m.full_name}
//               onChange={(e) => {
//                 const copy = [...members];
//                 copy[index].full_name = e.target.value;
//                 setMembers(copy);
//               }}
//               className="px-4 py-3 rounded-xl border"
//             />

//             <input
//               placeholder="Phone"
//               value={m.phone}
//               onChange={(e) => {
//                 const copy = [...members];
//                 copy[index].phone = e.target.value;
//                 setMembers(copy);
//               }}
//               className="px-4 py-3 rounded-xl border"
//             />

//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => {
//                 const copy = [...members];
//                 copy[index].photo = e.target.files[0];
//                 setMembers(copy);
//               }}
//               className="px-4 py-3 rounded-xl border"
//             />
//           </div>
//         </motion.div>
//       ))}

//       {/* SUBMIT */}
//       {selectedPlan && (
//         <button
//           disabled={loading}
//           onClick={handleSubmit}
//           className="mt-6 px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold"
//         >
//           {loading ? "Saving..." : "Add Member"}
//         </button>
//       )}
//     </div>
//   );
// }
// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";

// export default function AdminAddMember() {
//   const [plans, setPlans] = useState([]);
//   const [plan, setPlan] = useState(null);
//   const [singleMember, setSingleMember] = useState({
//     full_name: "",
//     phone: "",
//     photo: null,
//   });
//   const [groupMembers, setGroupMembers] = useState([]);
//   const [loading, setLoading] = useState(false);

//   /* ================= FETCH PLANS ================= */
//   useEffect(() => {
//     supabase.from("plans").select("*").then(({ data }) => {
//       setPlans(data || []);
//     });
//   }, []);

//   /* ================= PLAN CHANGE ================= */
//   function handlePlanChange(planId) {
//     const p = plans.find((x) => x.id === planId);
//     setPlan(p);

//     if (p.max_members > 1) {
//       setGroupMembers(
//         Array.from({ length: p.max_members }).map((_, i) => ({
//           full_name: "",
//           phone: "",
//           photo: null,
//           is_primary: i === 0,
//         }))
//       );
//     }
//   }

//   /* ================= PHOTO UPLOAD ================= */
//   async function uploadPhoto(file) {
//     const name = `${crypto.randomUUID()}-${file.name}`;
//     await supabase.storage.from("member-photos").upload(name, file);
//     return supabase.storage.from("member-photos").getPublicUrl(name).data.publicUrl;
//   }

//   /* ================= SUBMIT ================= */
//   async function handleSubmit() {
//     if (!plan) return alert("Select plan");

//     const today = new Date();
//     const start = today.toISOString().split("T")[0];
//     const expiry = new Date(today.setDate(today.getDate() + plan.duration_days))
//       .toISOString()
//       .split("T")[0];

//     setLoading(true);

//     try {
//       /* ===== SINGLE MEMBER ===== */
//       if (plan.max_members === 1) {
//         let photoUrl = null;
//         if (singleMember.photo) photoUrl = await uploadPhoto(singleMember.photo);

//         await supabase.from("members").insert({
//           full_name: singleMember.full_name,
//           phone: singleMember.phone,
//           photo_url: photoUrl,
//           plan_id: plan.id,
//           plan_name: plan.name,
//           start_date: start,
//           expiry_date: expiry,
//         });
//       }

//       /* ===== GROUP MEMBER ===== */
//       else {
//         const { data: group } = await supabase
//           .from("membership_groups")
//           .insert({
//             plan_id: plan.id,
//             plan_name: plan.name,
//             start_date: start,
//             expiry_date: expiry,
//           })
//           .select()
//           .single();

//         for (const m of groupMembers) {
//           let photoUrl = null;
//           if (m.photo) photoUrl = await uploadPhoto(m.photo);

//           await supabase.from("group_members").insert({
//             group_id: group.id,
//             full_name: m.full_name,
//             phone: m.phone,
//             photo_url: photoUrl,
//             is_primary: m.is_primary,
//           });
//         }
//       }

//       alert("Member added successfully ✅");
//       window.location.reload();
//     } catch (err) {
//       console.error(err);
//       alert("Error adding member");
//     } finally {
//       setLoading(false);
//     }
//   }

//   /* ================= UI ================= */
//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-4">Add Member</h1>

//       <select
//         className="border px-4 py-2 rounded mb-6"
//         onChange={(e) => handlePlanChange(e.target.value)}
//       >
//         <option value="">Select Plan</option>
//         {plans.map((p) => (
//           <option key={p.id} value={p.id}>
//             {p.name} – ₹{p.price}
//           </option>
//         ))}
//       </select>

//       {/* SINGLE */}
//       {plan?.max_members === 1 && (
//         <div className="space-y-3">
//           <input
//             placeholder="Full name"
//             className="border px-3 py-2 rounded w-full"
//             onChange={(e) =>
//               setSingleMember({ ...singleMember, full_name: e.target.value })
//             }
//           />
//           <input
//             placeholder="Phone"
//             className="border px-3 py-2 rounded w-full"
//             onChange={(e) =>
//               setSingleMember({ ...singleMember, phone: e.target.value })
//             }
//           />
//           <input
//             type="file"
//             onChange={(e) =>
//               setSingleMember({ ...singleMember, photo: e.target.files[0] })
//             }
//           />
//         </div>
//       )}

//       {/* GROUP */}
//       {plan?.max_members > 1 &&
//         groupMembers.map((m, i) => (
//           <div key={i} className="border rounded p-4 mb-3">
//             <b>{m.is_primary ? "Primary" : `Member ${i + 1}`}</b>
//             <input
//               className="border px-3 py-2 rounded w-full mt-2"
//               placeholder="Name"
//               onChange={(e) => {
//                 const c = [...groupMembers];
//                 c[i].full_name = e.target.value;
//                 setGroupMembers(c);
//               }}
//             />
//             <input
//               className="border px-3 py-2 rounded w-full mt-2"
//               placeholder="Phone"
//               onChange={(e) => {
//                 const c = [...groupMembers];
//                 c[i].phone = e.target.value;
//                 setGroupMembers(c);
//               }}
//             />
//             <input
//               type="file"
//               onChange={(e) => {
//                 const c = [...groupMembers];
//                 c[i].photo = e.target.files[0];
//                 setGroupMembers(c);
//               }}
//             />
//           </div>
//         ))}

//       {plan && (
//         <button
//           disabled={loading}
//           onClick={handleSubmit}
//           className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded"
//         >
//           {loading ? "Saving..." : "Add Member"}
//         </button>
//       )}
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export default function AdminAddMember() {
  const [plans, setPlans] = useState([]);
  const [plan, setPlan] = useState(null);
  const [singleMember, setSingleMember] = useState({
    full_name: "",
    phone: "",
    photo: null,
  });
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("plans").select("*").then(({ data }) => {
      setPlans(data || []);
    });
  }, []);

  function handlePlanChange(planId) {
    const p = plans.find((x) => x.id === planId);
    setPlan(p);

    if (p?.max_members > 1) {
      setGroupMembers(
        Array.from({ length: p.max_members }).map((_, i) => ({
          full_name: "",
          phone: "",
          photo: null,
          is_primary: i === 0,
        }))
      );
    }
  }

  async function uploadPhoto(file) {
    const name = `${crypto.randomUUID()}-${file.name}`;
    await supabase.storage.from("member-photos").upload(name, file);
    return supabase.storage.from("member-photos").getPublicUrl(name).data.publicUrl;
  }

  async function handleSubmit() {
    if (!plan) return alert("Select plan");

    const today = new Date();
    const start = today.toISOString().split("T")[0];
    const expiry = new Date(
      today.setDate(today.getDate() + plan.duration_days)
    )
      .toISOString()
      .split("T")[0];

    setLoading(true);

    try {
      /* SINGLE MEMBER */
      if (plan.max_members === 1) {
        let photoUrl = null;
        if (singleMember.photo)
          photoUrl = await uploadPhoto(singleMember.photo);

        const { data: member } = await supabase
          .from("members")
          .insert({
            full_name: singleMember.full_name,
            phone: singleMember.phone,
            photo_url: photoUrl,
            plan_id: plan.id,
            plan_name: plan.name,
            start_date: start,
            expiry_date: expiry,
          })
          .select()
          .single();

        /* PAYMENT INSERT */
        await supabase.from("payments").insert({
          source_type: "single_new",
          member_id: member.id,
          plan_id: plan.id,
          plan_name: plan.name,
          amount: plan.price,
          payment_mode: "cash",
        });
      }

      /* GROUP MEMBER */
      else {
        const { data: group } = await supabase
          .from("membership_groups")
          .insert({
            plan_id: plan.id,
            plan_name: plan.name,
            start_date: start,
            expiry_date: expiry,
          })
          .select()
          .single();

        for (const m of groupMembers) {
          let photoUrl = null;
          if (m.photo) photoUrl = await uploadPhoto(m.photo);

          await supabase.from("group_members").insert({
            group_id: group.id,
            full_name: m.full_name,
            phone: m.phone,
            photo_url: photoUrl,
            is_primary: m.is_primary,
          });
        }

        /* PAYMENT INSERT */
        await supabase.from("payments").insert({
          source_type: "group_new",
          group_id: group.id,
          plan_id: plan.id,
          plan_name: plan.name,
          amount: plan.price,
          payment_mode: "cash",
        });
      }

      alert("Member added successfully ✅");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error adding member");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-10 max-w-3xl mx-auto animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8">Add Member</h1>

      {/* PLAN SELECT */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Plan</label>
        <select
          className="border w-full px-4 py-3 rounded-xl shadow-sm"
          onChange={(e) => handlePlanChange(e.target.value)}
        >
          <option value="">Select Plan</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} – ₹{p.price}
            </option>
          ))}
        </select>
      </div>

      {/* PLAN INFO */}
      {plan && (
        <div className="bg-slate-100 p-4 rounded-xl mb-6">
          <div>Duration: {plan.duration_days} days</div>
          <div>Max Members: {plan.max_members}</div>
        </div>
      )}

      {/* SINGLE FORM */}
      {plan?.max_members === 1 && (
        <div className="space-y-4">
          <input
            placeholder="Full Name"
            className="border px-4 py-3 rounded-xl w-full"
            onChange={(e) =>
              setSingleMember({ ...singleMember, full_name: e.target.value })
            }
          />
          <input
            placeholder="Phone"
            className="border px-4 py-3 rounded-xl w-full"
            onChange={(e) =>
              setSingleMember({ ...singleMember, phone: e.target.value })
            }
          />
          <input
            type="file"
            className="w-full"
            onChange={(e) =>
              setSingleMember({ ...singleMember, photo: e.target.files[0] })
            }
          />
        </div>
      )}

      {/* GROUP FORM */}
      {plan?.max_members > 1 &&
        groupMembers.map((m, i) => (
          <div key={i} className="border rounded-xl p-4 mb-4">
            <div className="font-semibold mb-2">
              {m.is_primary ? "Primary Member" : `Member ${i + 1}`}
            </div>

            <input
              placeholder="Full Name"
              className="border px-4 py-2 rounded w-full mb-2"
              onChange={(e) => {
                const c = [...groupMembers];
                c[i].full_name = e.target.value;
                setGroupMembers(c);
              }}
            />

            <input
              placeholder="Phone"
              className="border px-4 py-2 rounded w-full mb-2"
              onChange={(e) => {
                const c = [...groupMembers];
                c[i].phone = e.target.value;
                setGroupMembers(c);
              }}
            />

            <input
              type="file"
              onChange={(e) => {
                const c = [...groupMembers];
                c[i].photo = e.target.files[0];
                setGroupMembers(c);
              }}
            />
          </div>
        ))}

      {plan && (
        <button
          disabled={loading}
          onClick={handleSubmit}
          className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl hover:scale-105 transition"
        >
          {loading ? "Saving..." : "Add Member"}
        </button>
      )}
    </div>
  );
}
