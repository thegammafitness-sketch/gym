// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";

// export default function AdminMembers() {
//   const [singleMembers, setSingleMembers] = useState([]);
//   const [groupMembers, setGroupMembers] = useState([]);
//   const [plans, setPlans] = useState([]);
//   const [filter, setFilter] = useState("all");

//   const [editingMember, setEditingMember] = useState(null);
//   const [editName, setEditName] = useState("");
//   const [editPhone, setEditPhone] = useState("");

//   const [renewTarget, setRenewTarget] = useState(null);
//   const [selectedPlanId, setSelectedPlanId] = useState("");
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [editPhoto, setEditPhoto] = useState(null);
//   const [editPlanId, setEditPlanId] = useState("");
//   const [editingGroup, setEditingGroup] = useState(null);
//   const [selectedStartDate, setSelectedStartDate] = useState(
//     new Date().toISOString().split("T")[0],
//   );
//   useEffect(() => {
//     fetchAll();
//   }, []);

//   async function fetchAll() {
//     const { data: singles } = await supabase
//       .from("members")
//       .select("*")
//       .order("created_at", { ascending: false });

//     const { data: groups } = await supabase
//       .from("membership_groups")
//       .select(
//         `
//         id,
//         plan_id,
//         plan_name,
//         start_date,
//         expiry_date,
//         group_members (
//           id,
//           full_name,
//           phone,
//           photo_url,
//           is_primary
//         )
//       `,
//       )
//       .order("created_at", { ascending: false });

//     const { data: plans } = await supabase.from("plans").select("*");

//     setSingleMembers(singles || []);
//     setGroupMembers(groups || []);
//     setPlans(plans || []);
//   }

//   function getStatus(expiry) {
//     const today = new Date();
//     const exp = new Date(expiry);
//     const diff = Math.ceil((exp - today) / 86400000);
//     if (diff < 0) return "expired";
//     if (diff <= 2) return "due";
//     return "active";
//   }

//   function applyFilter(list) {
//     if (filter === "all") return list;
//     return list.filter((i) => getStatus(i.expiry_date) === filter);
//   }
//   async function uploadPhoto(file) {
//     const name = `${crypto.randomUUID()}-${file.name}`;

//     await supabase.storage.from("member-photos").upload(name, file);

//     return supabase.storage.from("member-photos").getPublicUrl(name).data
//       .publicUrl;
//   }
//   async function handleRenewConfirm() {
//     const plan = plans.find((p) => p.id === selectedPlanId);

//     if (!plan) {
//       alert("Select a plan");
//       return;
//     }

//     const startDateObj = new Date(selectedStartDate);

//     const expiryDateObj = new Date(startDateObj);
//     expiryDateObj.setDate(expiryDateObj.getDate() + plan.duration_days);

//     const start = startDateObj.toLocaleDateString("en-CA");
//     const expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//     /* SINGLE MEMBER RENEW */
//     if (renewTarget.type === "single") {
//       const m = renewTarget.data;

//       await supabase
//         .from("members")
//         .update({
//           plan_id: plan.id,
//           plan_name: plan.name,
//           start_date: start,
//           expiry_date: expiryDate,
//         })
//         .eq("id", m.id);

//       await supabase.from("payments").insert({
//         source_type: "single_renew",
//         member_id: m.id,
//         plan_id: plan.id,
//         plan_name: plan.name,
//         amount: plan.price,
//         payment_mode: "cash",
//       });
//     }

//     /* GROUP RENEW */
//     if (renewTarget.type === "group") {
//       const g = renewTarget.data;

//       await supabase
//         .from("membership_groups")
//         .update({
//           plan_id: plan.id,
//           plan_name: plan.name,
//           start_date: start,
//           expiry_date: expiryDate,
//         })
//         .eq("id", g.id);

//       await supabase.from("payments").insert({
//         source_type: "group_renew",
//         group_id: g.id,
//         plan_id: plan.id,
//         plan_name: plan.name,
//         amount: plan.price,
//         payment_mode: "cash",
//       });
//     }

//     setRenewTarget(null);
//     setSelectedPlanId("");
//     setSelectedStartDate(new Date().toISOString().split("T")[0]);

//     fetchAll();
//   }

//   async function saveEdit() {
//     if (!editingMember) return;

//     if (!/^[A-Za-z ]{2,50}$/.test(editName)) {
//       alert("Invalid name");
//       return;
//     }

//     if (!/^[6-9]\d{9}$/.test(editPhone)) {
//       alert("Invalid phone");
//       return;
//     }

//     let photoUrl = null;

//     if (editPhoto) {
//       photoUrl = await uploadPhoto(editPhoto);
//     }

//     const selectedPlan = plans.find((p) => p.id == editPlanId);

//     let upgradeAmount = 0;
//     let expiryDate = null;

//     /* ================= SINGLE MEMBER ================= */

//     if (editingMember.type === "single") {
//       const currentMember = singleMembers.find(
//         (m) => m.id === editingMember.id,
//       );

//       const updateData = {
//         full_name: editName,
//         phone: editPhone,
//       };

//       if (photoUrl) updateData.photo_url = photoUrl;

//       if (selectedPlan) {
//         const currentPlan = plans.find((p) => p.id === currentMember.plan_id);

//         const currentPrice = currentPlan ? currentPlan.price : 0;
//         const newPrice = selectedPlan.price;

//         upgradeAmount = newPrice - currentPrice;

//         if (upgradeAmount < 0) {
//           alert("Downgrade not allowed");
//           return;
//         }

//         const startDateObj = new Date(currentMember.start_date);

//         const expiryDateObj = new Date(startDateObj);

//         expiryDateObj.setDate(
//           expiryDateObj.getDate() + selectedPlan.duration_days,
//         );
//         expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//         updateData.plan_id = selectedPlan.id;
//         updateData.plan_name = selectedPlan.name;
//         updateData.expiry_date = expiryDate;
//       }

//       await supabase
//         .from("members")
//         .update(updateData)
//         .eq("id", editingMember.id);

//       if (selectedPlan) {
//         await supabase.from("payments").insert({
//           source_type: "single_upgrade",
//           member_id: editingMember.id,
//           plan_id: selectedPlan.id,
//           plan_name: selectedPlan.name,
//           amount: upgradeAmount,
//           payment_mode: "cash",
//         });
//       }
//     } else {
//       /* ================= GROUP MEMBER ================= */
//       const updateData = {
//         full_name: editName,
//         phone: editPhone,
//       };

//       if (photoUrl) updateData.photo_url = photoUrl;

//       await supabase
//         .from("group_members")
//         .update(updateData)
//         .eq("id", editingMember.id);

//       if (selectedPlan) {
//         const group = groupMembers.find((g) =>
//           g.group_members.some((m) => m.id === editingMember.id),
//         );

//         const currentPlan = plans.find((p) => p.id === group.plan_id);

//         const currentPrice = currentPlan ? currentPlan.price : 0;
//         const newPrice = selectedPlan.price;

//         upgradeAmount = newPrice - currentPrice;

//         if (upgradeAmount < 0) {
//           alert("Downgrade not allowed");
//           return;
//         }

//         const startDateObj = new Date(group.start_date);

//         const expiryDateObj = new Date(startDateObj);

//         expiryDateObj.setDate(
//           expiryDateObj.getDate() + selectedPlan.duration_days,
//         );

//         expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//         await supabase
//           .from("membership_groups")
//           .update({
//             plan_id: selectedPlan.id,
//             plan_name: selectedPlan.name,
//             expiry_date: expiryDate,
//           })
//           .eq("id", group.id);

//         await supabase.from("payments").insert({
//           source_type: "group_upgrade",
//           group_id: group.id,
//           plan_id: selectedPlan.id,
//           plan_name: selectedPlan.name,
//           amount: upgradeAmount,
//           payment_mode: "cash",
//         });
//       }
//     }

//     setEditingMember(null);
//     setEditPhoto(null);
//     setEditPlanId("");

//     fetchAll();
//   }
//   async function saveGroupEdit() {
//     for (const m of editingGroup.group_members) {
//       let photoUrl = m.photo_url;

//       if (m.newPhoto) {
//         photoUrl = await uploadPhoto(m.newPhoto);
//       }

//       await supabase
//         .from("group_members")
//         .update({
//           full_name: m.full_name,
//           phone: m.phone,
//           photo_url: photoUrl,
//         })
//         .eq("id", m.id);
//     }

//     setEditingGroup(null);
//     fetchAll();
//   }
//   async function deleteSingle(id) {
//     if (!confirm("Delete this member?")) return;
//     await supabase.from("members").delete().eq("id", id);
//     fetchAll();
//   }

//   async function deleteGroup(id) {
//     if (!confirm("Delete this group?")) return;
//     await supabase.from("membership_groups").delete().eq("id", id);
//     fetchAll();
//   }

//   return (
//     <div className="p-8 animate-fadeIn">
//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-10">
//         <h1 className="text-3xl font-bold">Members</h1>

//         <select
//           className="border px-4 py-2 rounded-xl shadow-sm"
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//         >
//           <option value="all">All</option>
//           <option value="active">Active</option>
//           <option value="due">Due</option>
//           <option value="expired">Expired</option>
//         </select>
//       </div>
//       {/* ================= SINGLE MEMBERS ================= */}
//       <h2 className="text-xl font-semibold mb-6">Single Members</h2>
//       <div className="grid md:grid-cols-3 gap-8 mb-14">
//         {applyFilter(singleMembers).map((m) => {
//           const status = getStatus(m.expiry_date);

//           const accent =
//             status === "active"
//               ? "from-emerald-500 to-green-600"
//               : status === "due"
//                 ? "from-amber-500 to-orange-600"
//                 : "from-rose-500 to-red-600";

//           return (
//             <div
//               key={m.id}
//               className="relative rounded-3xl p-6 bg-white shadow-xl hover:shadow-2xl transition overflow-hidden"
//             >
//               {/* Accent Strip */}
//               <div
//                 className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${accent}`}
//               />

//               {/* Clickable Area */}
//               <div
//                 className="cursor-pointer"
//                 onClick={() => setSelectedMember({ ...m, type: "single" })}
//               >
//                 <div className="flex items-center gap-4 mb-4">
//                   <img
//                     src={
//                       m.photo_url ||
//                       `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                         m.full_name,
//                       )}`
//                     }
//                     className="w-16 h-16 rounded-full"
//                   />
//                   <div>
//                     <h3 className="font-semibold">{m.full_name}</h3>
//                     <p className="text-sm text-slate-500">{m.phone}</p>
//                   </div>
//                 </div>

//                 <div className="text-sm text-slate-600 mb-3">
//                   <div>Plan: {m.plan_name}</div>
//                   <div>Start: {m.start_date}</div>
//                   <div>Expiry: {m.expiry_date}</div>
//                 </div>

//                 <span
//                   className={`px-3 py-1 text-xs rounded-full font-semibold text-white
//                   ${
//                     status === "active"
//                       ? "bg-emerald-600"
//                       : status === "due"
//                         ? "bg-amber-500"
//                         : "bg-rose-600"
//                   }`}
//                 >
//                   {status.toUpperCase()}
//                 </span>
//               </div>

//               {/* Buttons */}
//               <div className="flex gap-2 mt-4">
//                 {(status === "expired" || status === "due") && (
//                   <button
//                     onClick={() => setRenewTarget({ type: "single", data: m })}
//                     className="flex-1 bg-indigo-600 text-white py-2 rounded-xl"
//                   >
//                     Renew
//                   </button>
//                 )}

//                 <button
//                   onClick={() => {
//                     setEditingMember({ id: m.id, type: "single" });
//                     setEditName(m.full_name);
//                     setEditPhone(m.phone);
//                   }}
//                   className="flex-1 bg-yellow-500 text-white py-2 rounded-xl"
//                 >
//                   Edit
//                 </button>

//                 <button
//                   onClick={() => deleteSingle(m.id)}
//                   className="flex-1 bg-red-600 text-white py-2 rounded-xl"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//       {/* ================= GROUP MEMBERS ================= */}
//       {/* ================= GROUP MEMBERS ================= */}
//       <h2 className="text-xl font-semibold mb-6">Group Members</h2>
//       <div className="grid md:grid-cols-3 gap-8">
//         {applyFilter(groupMembers).map((g) => {
//           const status = getStatus(g.expiry_date);

//           const accent =
//             status === "active"
//               ? "from-emerald-500 to-green-600"
//               : status === "due"
//                 ? "from-amber-500 to-orange-600"
//                 : "from-rose-500 to-red-600";

//           return (
//             <div
//               key={g.id}
//               className="relative rounded-3xl p-6 bg-white shadow-xl hover:shadow-2xl transition overflow-hidden"
//             >
//               {/* Accent Strip */}
//               <div
//                 className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${accent}`}
//               />

//               <h3 className="font-semibold mb-3 text-lg">{g.plan_name}</h3>

//               {/* PLAN INFO */}
//               <div className="text-sm text-slate-600 mb-4">
//                 <div>Start: {g.start_date}</div>
//                 <div>Expiry: {g.expiry_date}</div>
//               </div>

//               {/* GROUP MEMBERS */}
//               <div className="space-y-3 mb-4">
//                 {g.group_members.map((m) => (
//                   <div
//                     key={m.id}
//                     onClick={() => {
//                       setEditingMember({ id: m.id, type: "group" });
//                       setEditName(m.full_name);
//                       setEditPhone(m.phone);
//                     }}
//                     className="flex items-center gap-3 cursor-pointer"
//                   >
//                     <img
//                       src={
//                         m.photo_url ||
//                         `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                           m.full_name,
//                         )}`
//                       }
//                       className="w-10 h-10 rounded-full"
//                     />

//                     <span className="text-sm">
//                       {m.is_primary && "👑 "}
//                       {m.full_name}
//                     </span>
//                   </div>
//                 ))}
//               </div>

//               <span
//                 className={`px-3 py-1 text-xs rounded-full font-semibold text-white
//     ${
//       status === "active"
//         ? "bg-emerald-600"
//         : status === "due"
//           ? "bg-amber-500"
//           : "bg-rose-600"
//     }`}
//               >
//                 {status.toUpperCase()}
//               </span>

//               {/* BUTTONS */}
//               <div className="flex gap-2 mt-4">
//                 <button
//                   onClick={() => setEditingGroup(g)}
//                   className="flex-1 bg-yellow-500 text-white py-2 rounded-xl"
//                 >
//                   Edit Group
//                 </button>

//                 <button
//                   onClick={() => deleteGroup(g.id)}
//                   className="flex-1 bg-red-600 text-white py-2 rounded-xl"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//       {/* ================= EDIT MODAL ================= */}
//       {editingMember && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-2xl w-96 shadow-xl">
//             <h3 className="font-semibold mb-4">Edit Member</h3>

//             <input
//               className="border w-full px-3 py-2 mb-3 rounded-lg"
//               value={editName}
//               onChange={(e) => setEditName(e.target.value)}
//             />

//             <input
//               className="border w-full px-3 py-2 mb-3 rounded-lg"
//               value={editPhone}
//               onChange={(e) => setEditPhone(e.target.value)}
//             />

//             <input
//               type="file"
//               onChange={(e) => setEditPhoto(e.target.files[0])}
//               className="border w-full px-3 py-2 mb-3 rounded-lg"
//             />

//             <select
//               value={editPlanId}
//               onChange={(e) => setEditPlanId(e.target.value)}
//               className="border w-full px-3 py-2 mb-4 rounded-lg"
//             >
//               <option value="">Keep Current Plan</option>
//               {plans.map((p) => (
//                 <option key={p.id} value={p.id}>
//                   {p.name} – ₹{p.price}
//                 </option>
//               ))}
//             </select>

//             <button
//               onClick={saveEdit}
//               className="w-full bg-indigo-600 text-white py-2 rounded-xl"
//             >
//               Save
//             </button>
//           </div>
//         </div>
//       )}
//       {/* ================= RENEW MODAL ================= */}
//       {renewTarget && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-2xl w-96 shadow-xl">
//             <h3 className="text-lg font-semibold mb-4">
//               Select Plan for Renewal
//             </h3>

//             <input
//               type="date"
//               value={selectedStartDate}
//               onChange={(e) => setSelectedStartDate(e.target.value)}
//               className="border w-full px-3 py-2 mb-4 rounded-lg"
//             />
//             <select
//               value={selectedPlanId}
//               onChange={(e) => setSelectedPlanId(e.target.value)}
//               className="border w-full px-3 py-2 mb-4 rounded-lg"
//             >
//               <option value="">Select Plan</option>
//               {plans.map((p) => (
//                 <option key={p.id} value={p.id}>
//                   {p.name} – ₹{p.price}
//                 </option>
//               ))}
//             </select>

//             <div className="flex gap-2">
//               <button
//                 onClick={handleRenewConfirm}
//                 className="flex-1 bg-indigo-600 text-white py-2 rounded-xl"
//               >
//                 Confirm
//               </button>

//               <button
//                 onClick={() => {
//                   setRenewTarget(null);
//                   setSelectedPlanId("");
//                 }}
//                 className="flex-1 bg-gray-300 py-2 rounded-xl"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {/* ==========group edit modal ================= */}
//       {editingGroup && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white rounded-3xl p-8 w-[500px] shadow-2xl">
//             <h2 className="text-xl font-semibold mb-6">Edit Group Members</h2>

//             {editingGroup.group_members.map((m, i) => (
//               <div key={m.id} className="border p-4 rounded-xl mb-4">
//                 <div className="font-medium mb-2">
//                   {m.is_primary ? "Primary Member" : `Member ${i + 1}`}
//                 </div>

//                 <input
//                   defaultValue={m.full_name}
//                   onChange={(e) => (m.full_name = e.target.value)}
//                   className="border px-3 py-2 rounded w-full mb-2"
//                 />

//                 <input
//                   defaultValue={m.phone}
//                   onChange={(e) => (m.phone = e.target.value)}
//                   className="border px-3 py-2 rounded w-full mb-2"
//                 />

//                 <input
//                   type="file"
//                   onChange={(e) => (m.newPhoto = e.target.files[0])}
//                 />
//               </div>
//             ))}

//             <button
//               onClick={saveGroupEdit}
//               className="w-full bg-indigo-600 text-white py-2 rounded-xl"
//             >
//               Save Changes
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";

// export default function AdminMembers() {
//   const [singleMembers, setSingleMembers] = useState([]);
//   const [groupMembers, setGroupMembers] = useState([]);
//   const [plans, setPlans] = useState([]);
//   const [filter, setFilter] = useState("all");
//   const [search, setSearch] = useState(""); // ← added

//   const [editingMember, setEditingMember] = useState(null);
//   const [editName, setEditName] = useState("");
//   const [editPhone, setEditPhone] = useState("");

//   const [renewTarget, setRenewTarget] = useState(null);
//   const [selectedPlanId, setSelectedPlanId] = useState("");
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [editPhoto, setEditPhoto] = useState(null);
//   const [editPlanId, setEditPlanId] = useState("");
//   const [editingGroup, setEditingGroup] = useState(null);
//   const [selectedStartDate, setSelectedStartDate] = useState(
//     new Date().toISOString().split("T")[0],
//   );

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   async function fetchAll() {
//     const { data: singles } = await supabase
//       .from("members")
//       .select("*")
//       .order("created_at", { ascending: false });

//     const { data: groups } = await supabase
//       .from("membership_groups")
//       .select(
//         `id, plan_id, plan_name, start_date, expiry_date,
//         group_members (id, full_name, phone, photo_url, is_primary)`,
//       )
//       .order("created_at", { ascending: false });

//     const { data: plans } = await supabase.from("plans").select("*");

//     setSingleMembers(singles || []);
//     setGroupMembers(groups || []);
//     setPlans(plans || []);
//   }

//   function getStatus(expiry) {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const exp = new Date(expiry);
//   exp.setHours(0, 0, 0, 0);
//   const diff = Math.ceil((exp - today) / 86400000);

//   if (diff <= 0) return "expired"; // ← aaj ya pehle = expired
//   if (diff <= 2) return "due";
//   return "active";
// }
//   // ← updated to also apply search
//   function applyFilter(list, type = "single") {
//     let result = list;

//     if (filter !== "all") {
//       result = result.filter((i) => getStatus(i.expiry_date) === filter);
//     }

//     if (search.trim()) {
//       const q = search.toLowerCase();
//       if (type === "single") {
//         result = result.filter(
//           (m) =>
//             m.full_name?.toLowerCase().includes(q) ||
//             m.phone?.includes(q),
//         );
//       } else {
//         result = result.filter((g) =>
//           g.group_members?.some(
//             (m) =>
//               m.full_name?.toLowerCase().includes(q) ||
//               m.phone?.includes(q),
//           ),
//         );
//       }
//     }

//     return result;
//   }

//   async function uploadPhoto(file) {
//     const name = `${crypto.randomUUID()}-${file.name}`;
//     await supabase.storage.from("member-photos").upload(name, file);
//     return supabase.storage.from("member-photos").getPublicUrl(name).data.publicUrl;
//   }

//   async function handleRenewConfirm() {
//     const plan = plans.find((p) => p.id === selectedPlanId);
//     if (!plan) { alert("Select a plan"); return; }

//     const startDateObj = new Date(selectedStartDate);
//     const expiryDateObj = new Date(startDateObj);
//     expiryDateObj.setDate(expiryDateObj.getDate() + plan.duration_days);

//     const start = startDateObj.toLocaleDateString("en-CA");
//     const expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//     if (renewTarget.type === "single") {
//       const m = renewTarget.data;
//       await supabase.from("members").update({
//         plan_id: plan.id, plan_name: plan.name,
//         start_date: start, expiry_date: expiryDate,
//       }).eq("id", m.id);
//       await supabase.from("payments").insert({
//         source_type: "single_renew", member_id: m.id,
//         plan_id: plan.id, plan_name: plan.name,
//         amount: plan.price, payment_mode: "cash",
//       });
//     }

//     if (renewTarget.type === "group") {
//       const g = renewTarget.data;
//       await supabase.from("membership_groups").update({
//         plan_id: plan.id, plan_name: plan.name,
//         start_date: start, expiry_date: expiryDate,
//       }).eq("id", g.id);
//       await supabase.from("payments").insert({
//         source_type: "group_renew", group_id: g.id,
//         plan_id: plan.id, plan_name: plan.name,
//         amount: plan.price, payment_mode: "cash",
//       });
//     }

//     setRenewTarget(null);
//     setSelectedPlanId("");
//     setSelectedStartDate(new Date().toISOString().split("T")[0]);
//     fetchAll();
//   }

//   async function saveEdit() {
//     if (!editingMember) return;
//     if (!/^[A-Za-z ]{2,50}$/.test(editName)) { alert("Invalid name"); return; }
//     if (!/^[6-9]\d{9}$/.test(editPhone)) { alert("Invalid phone"); return; }

//     let photoUrl = null;
//     if (editPhoto) photoUrl = await uploadPhoto(editPhoto);

//     const selectedPlan = plans.find((p) => p.id == editPlanId);
//     let upgradeAmount = 0;
//     let expiryDate = null;

//     if (editingMember.type === "single") {
//       const currentMember = singleMembers.find((m) => m.id === editingMember.id);
//       const updateData = { full_name: editName, phone: editPhone };
//       if (photoUrl) updateData.photo_url = photoUrl;

//       if (selectedPlan) {
//         const currentPlan = plans.find((p) => p.id === currentMember.plan_id);
//         upgradeAmount = selectedPlan.price - (currentPlan?.price || 0);
//         if (upgradeAmount < 0) { alert("Downgrade not allowed"); return; }

//         const expiryDateObj = new Date(currentMember.start_date);
//         expiryDateObj.setDate(expiryDateObj.getDate() + selectedPlan.duration_days);
//         expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//         updateData.plan_id = selectedPlan.id;
//         updateData.plan_name = selectedPlan.name;
//         updateData.expiry_date = expiryDate;
//       }

//       await supabase.from("members").update(updateData).eq("id", editingMember.id);

//       if (selectedPlan) {
//         await supabase.from("payments").insert({
//           source_type: "single_upgrade", member_id: editingMember.id,
//           plan_id: selectedPlan.id, plan_name: selectedPlan.name,
//           amount: upgradeAmount, payment_mode: "cash",
//         });
//       }
//     } else {
//       const updateData = { full_name: editName, phone: editPhone };
//       if (photoUrl) updateData.photo_url = photoUrl;
//       await supabase.from("group_members").update(updateData).eq("id", editingMember.id);

//       if (selectedPlan) {
//         const group = groupMembers.find((g) =>
//           g.group_members.some((m) => m.id === editingMember.id),
//         );
//         const currentPlan = plans.find((p) => p.id === group.plan_id);
//         upgradeAmount = selectedPlan.price - (currentPlan?.price || 0);
//         if (upgradeAmount < 0) { alert("Downgrade not allowed"); return; }

//         const expiryDateObj = new Date(group.start_date);
//         expiryDateObj.setDate(expiryDateObj.getDate() + selectedPlan.duration_days);
//         expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//         await supabase.from("membership_groups").update({
//           plan_id: selectedPlan.id, plan_name: selectedPlan.name,
//           expiry_date: expiryDate,
//         }).eq("id", group.id);

//         await supabase.from("payments").insert({
//           source_type: "group_upgrade", group_id: group.id,
//           plan_id: selectedPlan.id, plan_name: selectedPlan.name,
//           amount: upgradeAmount, payment_mode: "cash",
//         });
//       }
//     }

//     setEditingMember(null);
//     setEditPhoto(null);
//     setEditPlanId("");
//     fetchAll();
//   }

//   async function saveGroupEdit() {
//     for (const m of editingGroup.group_members) {
//       let photoUrl = m.photo_url;
//       if (m.newPhoto) photoUrl = await uploadPhoto(m.newPhoto);
//       await supabase.from("group_members").update({
//         full_name: m.full_name, phone: m.phone, photo_url: photoUrl,
//       }).eq("id", m.id);
//     }
//     setEditingGroup(null);
//     fetchAll();
//   }

//   async function deleteSingle(id) {
//     if (!confirm("Delete this member?")) return;
//     await supabase.from("members").delete().eq("id", id);
//     fetchAll();
//   }

//   async function deleteGroup(id) {
//     if (!confirm("Delete this group?")) return;
//     await supabase.from("membership_groups").delete().eq("id", id);
//     fetchAll();
//   }

//   return (
//     <div className="p-8 animate-fadeIn">
//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Members</h1>
//         <select
//           className="border px-4 py-2 rounded-xl shadow-sm"
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//         >
//           <option value="all">All</option>
//           <option value="active">Active</option>
//           <option value="due">Due</option>
//           <option value="expired">Expired</option>
//         </select>
//       </div>

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

//       {/* ================= SINGLE MEMBERS ================= */}
//       <h2 className="text-xl font-semibold mb-6">Single Members</h2>
//       <div className="grid md:grid-cols-3 gap-8 mb-14">
//         {applyFilter(singleMembers, "single").map((m) => {
//           const status = getStatus(m.expiry_date);
//           const accent =
//             status === "active" ? "from-emerald-500 to-green-600"
//             : status === "due" ? "from-amber-500 to-orange-600"
//             : "from-rose-500 to-red-600";

//           return (
//             <div key={m.id} className="relative rounded-3xl p-6 bg-white shadow-xl hover:shadow-2xl transition overflow-hidden">
//               <div className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${accent}`} />
//               <div className="cursor-pointer" onClick={() => setSelectedMember({ ...m, type: "single" })}>
//                 <div className="flex items-center gap-4 mb-4">
//                   <img
//                     src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}`}
//                     className="w-16 h-16 rounded-full"
//                   />
//                   <div>
//                     <h3 className="font-semibold">{m.full_name}</h3>
//                     <p className="text-sm text-slate-500">{m.phone}</p>
//                   </div>
//                 </div>
//                 <div className="text-sm text-slate-600 mb-3">
//                   <div>Plan: {m.plan_name}</div>
//                   <div>Start: {m.start_date}</div>
//                   <div>Expiry: {m.expiry_date}</div>
//                 </div>
//                 <span className={`px-3 py-1 text-xs rounded-full font-semibold text-white ${
//                   status === "active" ? "bg-emerald-600"
//                   : status === "due" ? "bg-amber-500"
//                   : "bg-rose-600"
//                 }`}>
//                   {status.toUpperCase()}
//                 </span>
//               </div>
//               <div className="flex gap-2 mt-4">
//                 {(status === "expired" || status === "due") && (
//                   <button onClick={() => setRenewTarget({ type: "single", data: m })} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl">Renew</button>
//                 )}
//                 <button onClick={() => { setEditingMember({ id: m.id, type: "single" }); setEditName(m.full_name); setEditPhone(m.phone); }} className="flex-1 bg-yellow-500 text-white py-2 rounded-xl">Edit</button>
//                 <button onClick={() => deleteSingle(m.id)} className="flex-1 bg-red-600 text-white py-2 rounded-xl">Delete</button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ================= GROUP MEMBERS ================= */}
//       <h2 className="text-xl font-semibold mb-6">Group Members</h2>
//       <div className="grid md:grid-cols-3 gap-8">
//         {applyFilter(groupMembers, "group").map((g) => {
//           const status = getStatus(g.expiry_date);
//           const accent =
//             status === "active" ? "from-emerald-500 to-green-600"
//             : status === "due" ? "from-amber-500 to-orange-600"
//             : "from-rose-500 to-red-600";

//           return (
//             <div key={g.id} className="relative rounded-3xl p-6 bg-white shadow-xl hover:shadow-2xl transition overflow-hidden">
//               <div className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${accent}`} />
//               <h3 className="font-semibold mb-3 text-lg">{g.plan_name}</h3>
//               <div className="text-sm text-slate-600 mb-4">
//                 <div>Start: {g.start_date}</div>
//                 <div>Expiry: {g.expiry_date}</div>
//               </div>
//               <div className="space-y-3 mb-4">
//                 {g.group_members.map((m) => (
//                   <div key={m.id} onClick={() => { setEditingMember({ id: m.id, type: "group" }); setEditName(m.full_name); setEditPhone(m.phone); }} className="flex items-center gap-3 cursor-pointer">
//                     <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}`} className="w-10 h-10 rounded-full" />
//                     <span className="text-sm">{m.is_primary && "👑 "}{m.full_name}</span>
//                   </div>
//                 ))}
//               </div>
//               <span className={`px-3 py-1 text-xs rounded-full font-semibold text-white ${
//                 status === "active" ? "bg-emerald-600"
//                 : status === "due" ? "bg-amber-500"
//                 : "bg-rose-600"
//               }`}>
//                 {status.toUpperCase()}
//               </span>
//               <div className="flex gap-2 mt-4">
//                 <button onClick={() => setEditingGroup(g)} className="flex-1 bg-yellow-500 text-white py-2 rounded-xl">Edit Group</button>
//                 <button onClick={() => deleteGroup(g.id)} className="flex-1 bg-red-600 text-white py-2 rounded-xl">Delete</button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ================= EDIT MODAL ================= */}
//       {editingMember && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-2xl w-96 shadow-xl">
//             <h3 className="font-semibold mb-4">Edit Member</h3>
//             <input className="border w-full px-3 py-2 mb-3 rounded-lg" value={editName} onChange={(e) => setEditName(e.target.value)} />
//             <input className="border w-full px-3 py-2 mb-3 rounded-lg" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
//             <input type="file" onChange={(e) => setEditPhoto(e.target.files[0])} className="border w-full px-3 py-2 mb-3 rounded-lg" />
//             <select value={editPlanId} onChange={(e) => setEditPlanId(e.target.value)} className="border w-full px-3 py-2 mb-4 rounded-lg">
//               <option value="">Keep Current Plan</option>
//               {plans.map((p) => <option key={p.id} value={p.id}>{p.name} – ₹{p.price}</option>)}
//             </select>
//             <button onClick={saveEdit} className="w-full bg-indigo-600 text-white py-2 rounded-xl">Save</button>
//           </div>
//         </div>
//       )}

//       {/* ================= RENEW MODAL ================= */}
//       {renewTarget && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-2xl w-96 shadow-xl">
//             <h3 className="text-lg font-semibold mb-4">Select Plan for Renewal</h3>
//             <input type="date" value={selectedStartDate} onChange={(e) => setSelectedStartDate(e.target.value)} className="border w-full px-3 py-2 mb-4 rounded-lg" />
//             <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} className="border w-full px-3 py-2 mb-4 rounded-lg">
//               <option value="">Select Plan</option>
//               {plans.map((p) => <option key={p.id} value={p.id}>{p.name} – ₹{p.price}</option>)}
//             </select>
//             <div className="flex gap-2">
//               <button onClick={handleRenewConfirm} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl">Confirm</button>
//               <button onClick={() => { setRenewTarget(null); setSelectedPlanId(""); }} className="flex-1 bg-gray-300 py-2 rounded-xl">Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================= GROUP EDIT MODAL ================= */}
//       {editingGroup && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white rounded-3xl p-8 w-[500px] shadow-2xl">
//             <h2 className="text-xl font-semibold mb-6">Edit Group Members</h2>
//             {editingGroup.group_members.map((m, i) => (
//               <div key={m.id} className="border p-4 rounded-xl mb-4">
//                 <div className="font-medium mb-2">{m.is_primary ? "Primary Member" : `Member ${i + 1}`}</div>
//                 <input defaultValue={m.full_name} onChange={(e) => (m.full_name = e.target.value)} className="border px-3 py-2 rounded w-full mb-2" />
//                 <input defaultValue={m.phone} onChange={(e) => (m.phone = e.target.value)} className="border px-3 py-2 rounded w-full mb-2" />
//                 <input type="file" onChange={(e) => (m.newPhoto = e.target.files[0])} />
//               </div>
//             ))}
//             <button onClick={saveGroupEdit} className="w-full bg-indigo-600 text-white py-2 rounded-xl">Save Changes</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";

// export default function AdminMembers() {
//   const [singleMembers, setSingleMembers] = useState([]);
//   const [groupMembers, setGroupMembers] = useState([]);
//   const [plans, setPlans] = useState([]);
//   const [filter, setFilter] = useState("all");
//   const [search, setSearch] = useState("");

//   const [editingMember, setEditingMember] = useState(null);
//   const [editName, setEditName] = useState("");
//   const [editPhone, setEditPhone] = useState("");

//   const [renewTarget, setRenewTarget] = useState(null);
//   const [selectedPlanId, setSelectedPlanId] = useState("");
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [editPhoto, setEditPhoto] = useState(null);
//   const [editPlanId, setEditPlanId] = useState("");
//   const [editingGroup, setEditingGroup] = useState(null);
//   const [selectedStartDate, setSelectedStartDate] = useState(
//     new Date().toISOString().split("T")[0],
//   );

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   async function fetchAll() {
//     const { data: singles } = await supabase
//       .from("members")
//       .select("*")
//       .order("created_at", { ascending: false });

//     const { data: groups } = await supabase
//       .from("membership_groups")
//       .select(
//         `id, plan_id, plan_name, start_date, expiry_date,
//         group_members (id, full_name, phone, photo_url, is_primary)`,
//       )
//       .order("created_at", { ascending: false });

//     const { data: plans } = await supabase.from("plans").select("*");

//     setSingleMembers(singles || []);
//     setGroupMembers(groups || []);
//     setPlans(plans || []);
//   }

//   function getStatus(expiry) {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const exp = new Date(expiry);
//     exp.setHours(0, 0, 0, 0);
//     const diff = Math.ceil((exp - today) / 86400000);
//     if (diff <= 0) return "expired";
//     if (diff <= 2) return "due";
//     return "active";
//   }

//   function applyFilter(list, type = "single") {
//     let result = list;
//     if (filter !== "all") {
//       result = result.filter((i) => getStatus(i.expiry_date) === filter);
//     }
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       if (type === "single") {
//         result = result.filter(
//           (m) =>
//             m.full_name?.toLowerCase().includes(q) ||
//             m.phone?.includes(q),
//         );
//       } else {
//         result = result.filter((g) =>
//           g.group_members?.some(
//             (m) =>
//               m.full_name?.toLowerCase().includes(q) ||
//               m.phone?.includes(q),
//           ),
//         );
//       }
//     }
//     return result;
//   }

//   async function uploadPhoto(file) {
//     const name = `${crypto.randomUUID()}-${file.name}`;
//     await supabase.storage.from("member-photos").upload(name, file);
//     return supabase.storage.from("member-photos").getPublicUrl(name).data.publicUrl;
//   }

//   async function handleRenewConfirm() {
//     const plan = plans.find((p) => p.id === selectedPlanId);
//     if (!plan) { alert("Select a plan"); return; }

//     const startDateObj = new Date(selectedStartDate);
//     const expiryDateObj = new Date(startDateObj);
//     expiryDateObj.setDate(expiryDateObj.getDate() + plan.duration_days);

//     const start = startDateObj.toLocaleDateString("en-CA");
//     const expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//     if (renewTarget.type === "single") {
//       const m = renewTarget.data;
//       await supabase.from("members").update({
//         plan_id: plan.id,
//         plan_name: plan.name,
//         start_date: start,
//         expiry_date: expiryDate,
//       }).eq("id", m.id);

//       await supabase.from("payments").insert({
//         source_type: "single_renew",
//         member_id: m.id,
//         plan_id: plan.id,
//         plan_name: plan.name,
//         amount: plan.price,
//         payment_mode: "cash",
//       });
//     }

//     if (renewTarget.type === "group") {
//       const g = renewTarget.data;
//       await supabase.from("membership_groups").update({
//         plan_id: plan.id,
//         plan_name: plan.name,
//         start_date: start,
//         expiry_date: expiryDate,
//       }).eq("id", g.id);

//       await supabase.from("payments").insert({
//         source_type: "group_renew",
//         group_id: g.id,
//         plan_id: plan.id,
//         plan_name: plan.name,
//         amount: plan.price,
//         payment_mode: "cash",
//       });
//     }

//     setRenewTarget(null);
//     setSelectedPlanId("");
//     setSelectedStartDate(new Date().toISOString().split("T")[0]);
//     fetchAll();
//   }

//   async function saveEdit() {
//     if (!editingMember) return;
//     if (!/^[A-Za-z ]{2,50}$/.test(editName)) { alert("Invalid name"); return; }
//     if (!/^[6-9]\d{9}$/.test(editPhone)) { alert("Invalid phone"); return; }

//     let photoUrl = null;
//     if (editPhoto) photoUrl = await uploadPhoto(editPhoto);

//     const selectedPlan = plans.find((p) => p.id == editPlanId);
//     let upgradeAmount = 0;
//     let expiryDate = null;

//     if (editingMember.type === "single") {
//       const currentMember = singleMembers.find((m) => m.id === editingMember.id);
//       const updateData = { full_name: editName, phone: editPhone };
//       if (photoUrl) updateData.photo_url = photoUrl;

//       if (selectedPlan) {
//         const currentPlan = plans.find((p) => p.id === currentMember.plan_id);
//         upgradeAmount = selectedPlan.price - (currentPlan?.price || 0);
//         if (upgradeAmount < 0) { alert("Downgrade not allowed"); return; }

//         const expiryDateObj = new Date(currentMember.start_date);
//         expiryDateObj.setDate(expiryDateObj.getDate() + selectedPlan.duration_days);
//         expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//         updateData.plan_id = selectedPlan.id;
//         updateData.plan_name = selectedPlan.name;
//         updateData.expiry_date = expiryDate;
//       }

//       await supabase.from("members").update(updateData).eq("id", editingMember.id);

//       if (selectedPlan) {
//         await supabase.from("payments").insert({
//           source_type: "single_upgrade",
//           member_id: editingMember.id,
//           plan_id: selectedPlan.id,
//           plan_name: selectedPlan.name,
//           amount: upgradeAmount,
//           payment_mode: "cash",
//         });
//       }
//     } else {
//       const updateData = { full_name: editName, phone: editPhone };
//       if (photoUrl) updateData.photo_url = photoUrl;
//       await supabase.from("group_members").update(updateData).eq("id", editingMember.id);

//       if (selectedPlan) {
//         const group = groupMembers.find((g) =>
//           g.group_members.some((m) => m.id === editingMember.id),
//         );
//         const currentPlan = plans.find((p) => p.id === group.plan_id);
//         upgradeAmount = selectedPlan.price - (currentPlan?.price || 0);
//         if (upgradeAmount < 0) { alert("Downgrade not allowed"); return; }

//         const expiryDateObj = new Date(group.start_date);
//         expiryDateObj.setDate(expiryDateObj.getDate() + selectedPlan.duration_days);
//         expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//         await supabase.from("membership_groups").update({
//           plan_id: selectedPlan.id,
//           plan_name: selectedPlan.name,
//           expiry_date: expiryDate,
//         }).eq("id", group.id);

//         await supabase.from("payments").insert({
//           source_type: "group_upgrade",
//           group_id: group.id,
//           plan_id: selectedPlan.id,
//           plan_name: selectedPlan.name,
//           amount: upgradeAmount,
//           payment_mode: "cash",
//         });
//       }
//     }

//     setEditingMember(null);
//     setEditPhoto(null);
//     setEditPlanId("");
//     fetchAll();
//   }

//   async function saveGroupEdit() {
//     for (const m of editingGroup.group_members) {
//       let photoUrl = m.photo_url;
//       if (m.newPhoto) photoUrl = await uploadPhoto(m.newPhoto);
//       await supabase.from("group_members").update({
//         full_name: m.full_name,
//         phone: m.phone,
//         photo_url: photoUrl,
//       }).eq("id", m.id);
//     }
//     setEditingGroup(null);
//     fetchAll();
//   }

//   async function deleteSingle(id) {
//     if (!confirm("Delete this member?")) return;
//     await supabase.from("members").delete().eq("id", id);
//     fetchAll();
//   }

//   async function deleteGroup(id) {
//     if (!confirm("Delete this group?")) return;
//     await supabase.from("membership_groups").delete().eq("id", id);
//     fetchAll();
//   }

//   return (
//     <div className="p-8 animate-fadeIn">
//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Members</h1>
//         <select
//           className="border px-4 py-2 rounded-xl shadow-sm"
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//         >
//           <option value="all">All</option>
//           <option value="active">Active</option>
//           <option value="due">Due</option>
//           <option value="expired">Expired</option>
//         </select>
//       </div>

//       {/* SEARCH BAR */}
//       <div className="mb-10">
//         <input
//           type="text"
//           placeholder="Search by name or phone..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full border px-4 py-3 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//         />
//       </div>

//       {/* ================= SINGLE MEMBERS ================= */}
//       <h2 className="text-xl font-semibold mb-6">Single Members</h2>
//       <div className="grid md:grid-cols-3 gap-8 mb-14">
//         {applyFilter(singleMembers, "single").map((m) => {
//           const status = getStatus(m.expiry_date);
//           const accent =
//             status === "active" ? "from-emerald-500 to-green-600"
//             : status === "due" ? "from-amber-500 to-orange-600"
//             : "from-rose-500 to-red-600";

//           return (
//             <div key={m.id} className="relative rounded-3xl p-6 bg-white shadow-xl hover:shadow-2xl transition overflow-hidden">
//               <div className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${accent}`} />
//               <div className="cursor-pointer" onClick={() => setSelectedMember({ ...m, type: "single" })}>
//                 <div className="flex items-center gap-4 mb-4">
//                   <img
//                     src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}`}
//                     className="w-16 h-16 rounded-full"
//                   />
//                   <div>
//                     <h3 className="font-semibold">{m.full_name}</h3>
//                     <p className="text-sm text-slate-500">{m.phone}</p>
//                   </div>
//                 </div>
//                 <div className="text-sm text-slate-600 mb-3">
//                   <div>Plan: {m.plan_name}</div>
//                   <div>Start: {m.start_date}</div>
//                   <div>Expiry: {m.expiry_date}</div>
//                 </div>
//                 <span className={`px-3 py-1 text-xs rounded-full font-semibold text-white ${
//                   status === "active" ? "bg-emerald-600"
//                   : status === "due" ? "bg-amber-500"
//                   : "bg-rose-600"
//                 }`}>
//                   {status.toUpperCase()}
//                 </span>
//               </div>
//               <div className="flex gap-2 mt-4">
//                 {(status === "expired" || status === "due") && (
//                   <button
//                     onClick={() => setRenewTarget({ type: "single", data: m })}
//                     className="flex-1 bg-indigo-600 text-white py-2 rounded-xl"
//                   >
//                     Renew
//                   </button>
//                 )}
//                 <button
//                   onClick={() => {
//                     setEditingMember({ id: m.id, type: "single" });
//                     setEditName(m.full_name);
//                     setEditPhone(m.phone);
//                   }}
//                   className="flex-1 bg-yellow-500 text-white py-2 rounded-xl"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => deleteSingle(m.id)}
//                   className="flex-1 bg-red-600 text-white py-2 rounded-xl"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ================= GROUP MEMBERS ================= */}
//       <h2 className="text-xl font-semibold mb-6">Group Members</h2>
//       <div className="grid md:grid-cols-3 gap-8">
//         {applyFilter(groupMembers, "group").map((g) => {
//           const status = getStatus(g.expiry_date);
//           const accent =
//             status === "active" ? "from-emerald-500 to-green-600"
//             : status === "due" ? "from-amber-500 to-orange-600"
//             : "from-rose-500 to-red-600";

//           return (
//             <div key={g.id} className="relative rounded-3xl p-6 bg-white shadow-xl hover:shadow-2xl transition overflow-hidden">
//               <div className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${accent}`} />
//               <h3 className="font-semibold mb-3 text-lg">{g.plan_name}</h3>
//               <div className="text-sm text-slate-600 mb-4">
//                 <div>Start: {g.start_date}</div>
//                 <div>Expiry: {g.expiry_date}</div>
//               </div>
//               <div className="space-y-3 mb-4">
//                 {g.group_members.map((m) => (
//                   <div
//                     key={m.id}
//                     onClick={() => {
//                       setEditingMember({ id: m.id, type: "group" });
//                       setEditName(m.full_name);
//                       setEditPhone(m.phone);
//                     }}
//                     className="flex items-center gap-3 cursor-pointer"
//                   >
//                     <img
//                       src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}`}
//                       className="w-10 h-10 rounded-full"
//                     />
//                     <span className="text-sm">{m.is_primary && "👑 "}{m.full_name}</span>
//                   </div>
//                 ))}
//               </div>
//               <span className={`px-3 py-1 text-xs rounded-full font-semibold text-white ${
//                 status === "active" ? "bg-emerald-600"
//                 : status === "due" ? "bg-amber-500"
//                 : "bg-rose-600"
//               }`}>
//                 {status.toUpperCase()}
//               </span>

//               {/* ✅ RENEW BUTTON ADDED FOR GROUPS */}
//               <div className="flex gap-2 mt-4">
//                 {(status === "expired" || status === "due") && (
//                   <button
//                     onClick={() => setRenewTarget({ type: "group", data: g })}
//                     className="flex-1 bg-indigo-600 text-white py-2 rounded-xl"
//                   >
//                     Renew
//                   </button>
//                 )}
//                 <button
//                   onClick={() => setEditingGroup(g)}
//                   className="flex-1 bg-yellow-500 text-white py-2 rounded-xl"
//                 >
//                   Edit Group
//                 </button>
//                 <button
//                   onClick={() => deleteGroup(g.id)}
//                   className="flex-1 bg-red-600 text-white py-2 rounded-xl"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ================= EDIT MODAL ================= */}
//       {editingMember && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-2xl w-96 shadow-xl">
//             <h3 className="font-semibold mb-4">Edit Member</h3>
//             <input className="border w-full px-3 py-2 mb-3 rounded-lg" value={editName} onChange={(e) => setEditName(e.target.value)} />
//             <input className="border w-full px-3 py-2 mb-3 rounded-lg" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
//             <input type="file" onChange={(e) => setEditPhoto(e.target.files[0])} className="border w-full px-3 py-2 mb-3 rounded-lg" />
//             <select value={editPlanId} onChange={(e) => setEditPlanId(e.target.value)} className="border w-full px-3 py-2 mb-4 rounded-lg">
//               <option value="">Keep Current Plan</option>
//               {plans.map((p) => <option key={p.id} value={p.id}>{p.name} – ₹{p.price}</option>)}
//             </select>
//             <button onClick={saveEdit} className="w-full bg-indigo-600 text-white py-2 rounded-xl">Save</button>
//           </div>
//         </div>
//       )}

//       {/* ================= RENEW MODAL ================= */}
//       {renewTarget && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-2xl w-96 shadow-xl">
//             <h3 className="text-lg font-semibold mb-4">
//               {/* ✅ Shows group member names in renew modal */}
//               {renewTarget.type === "group"
//                 ? `Renew Group — ${renewTarget.data.group_members?.map(m => m.full_name).join(", ")}`
//                 : "Select Plan for Renewal"
//               }
//             </h3>
//             <input
//               type="date"
//               value={selectedStartDate}
//               onChange={(e) => setSelectedStartDate(e.target.value)}
//               className="border w-full px-3 py-2 mb-4 rounded-lg"
//             />
//             <select
//               value={selectedPlanId}
//               onChange={(e) => setSelectedPlanId(e.target.value)}
//               className="border w-full px-3 py-2 mb-4 rounded-lg"
//             >
//               <option value="">Select Plan</option>
//               {plans.map((p) => (
//                 <option key={p.id} value={p.id}>
//                   {p.name} – ₹{p.price}
//                 </option>
//               ))}
//             </select>
//             <div className="flex gap-2">
//               <button
//                 onClick={handleRenewConfirm}
//                 className="flex-1 bg-indigo-600 text-white py-2 rounded-xl"
//               >
//                 Confirm
//               </button>
//               <button
//                 onClick={() => { setRenewTarget(null); setSelectedPlanId(""); }}
//                 className="flex-1 bg-gray-300 py-2 rounded-xl"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================= GROUP EDIT MODAL ================= */}
//       {editingGroup && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white rounded-3xl p-8 w-[500px] shadow-2xl">
//             <h2 className="text-xl font-semibold mb-6">Edit Group Members</h2>
//             {editingGroup.group_members.map((m, i) => (
//               <div key={m.id} className="border p-4 rounded-xl mb-4">
//                 <div className="font-medium mb-2">{m.is_primary ? "Primary Member" : `Member ${i + 1}`}</div>
//                 <input defaultValue={m.full_name} onChange={(e) => (m.full_name = e.target.value)} className="border px-3 py-2 rounded w-full mb-2" />
//                 <input defaultValue={m.phone} onChange={(e) => (m.phone = e.target.value)} className="border px-3 py-2 rounded w-full mb-2" />
//                 <input type="file" onChange={(e) => (m.newPhoto = e.target.files[0])} />
//               </div>
//             ))}
//             <button onClick={saveGroupEdit} className="w-full bg-indigo-600 text-white py-2 rounded-xl">Save Changes</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";

// const SOURCE_LABELS = {
//   single_new:     "New Member",
//   single_renew:   "Renewal",
//   single_upgrade: "Upgrade",
//   group_new:      "New Group",
//   group_renew:    "Group Renewal",
//   group_upgrade:  "Group Upgrade",
//   due_payment:    "Due Payment",
// };

// const MODE_ICONS = { cash: "💵", upi: "📱", card: "💳" };

// function fmtDate(iso) {
//   if (!iso) return "—";
//   return new Date(iso).toLocaleDateString("en-IN", {
//     day: "2-digit", month: "short", year: "numeric",
//   });
// }

// export default function AdminMembers() {
//   const [singleMembers, setSingleMembers] = useState([]);
//   const [groupMembers, setGroupMembers]   = useState([]);
//   const [plans, setPlans]                 = useState([]);
//   const [filter, setFilter]               = useState("all");
//   const [search, setSearch]               = useState("");

//   const [editingMember, setEditingMember] = useState(null);
//   const [editName, setEditName]           = useState("");
//   const [editPhone, setEditPhone]         = useState("");
//   const [editPhoto, setEditPhoto]         = useState(null);
//   const [editPlanId, setEditPlanId]       = useState("");

//   const [renewTarget, setRenewTarget]         = useState(null);
//   const [selectedPlanId, setSelectedPlanId]   = useState("");
//   const [selectedStartDate, setSelectedStartDate] = useState(
//     new Date().toISOString().split("T")[0]
//   );
//   const [renewPaymentMode, setRenewPaymentMode] = useState("cash");

//   const [editingGroup, setEditingGroup]   = useState(null);

//   // Payment history modal
//   const [payHistoryMember, setPayHistoryMember] = useState(null); // { id, name, type }
//   const [payHistory, setPayHistory]             = useState([]);
//   const [payHistoryLoading, setPayHistoryLoading] = useState(false);

//   // Member detail modal
//   const [selectedMember, setSelectedMember] = useState(null);

//   useEffect(() => { fetchAll(); }, []);

//   async function fetchAll() {
//     const { data: singles } = await supabase
//       .from("members")
//       .select("*")
//       .order("created_at", { ascending: false });

//     const { data: groups } = await supabase
//       .from("membership_groups")
//       .select(`id, plan_id, plan_name, start_date, expiry_date,
//         group_members (id, full_name, phone, photo_url, is_primary)`)
//       .order("created_at", { ascending: false });

//     const { data: plansData } = await supabase.from("plans").select("*");

//     setSingleMembers(singles || []);
//     setGroupMembers(groups || []);
//     setPlans(plansData || []);
//   }

//   function getStatus(expiry) {
//     const today = new Date(); today.setHours(0,0,0,0);
//     const exp   = new Date(expiry); exp.setHours(0,0,0,0);
//     const diff  = Math.ceil((exp - today) / 86400000);
//     if (diff <= 0) return "expired";
//     if (diff <= 2) return "due";
//     return "active";
//   }

//   function applyFilter(list, type = "single") {
//     let result = list;
//     if (filter !== "all") result = result.filter((i) => getStatus(i.expiry_date) === filter);
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       if (type === "single") {
//         result = result.filter((m) => m.full_name?.toLowerCase().includes(q) || m.phone?.includes(q));
//       } else {
//         result = result.filter((g) =>
//           g.group_members?.some((m) => m.full_name?.toLowerCase().includes(q) || m.phone?.includes(q))
//         );
//       }
//     }
//     return result;
//   }

//   async function uploadPhoto(file) {
//     const name = `${crypto.randomUUID()}-${file.name}`;
//     await supabase.storage.from("member-photos").upload(name, file);
//     return supabase.storage.from("member-photos").getPublicUrl(name).data.publicUrl;
//   }

//   /* ── Open payment history for a member ── */
//   async function openPayHistory(id, name, type) {
//     setPayHistoryMember({ id, name, type });
//     setPayHistoryLoading(true);
//     setPayHistory([]);

//     let query;
//     if (type === "single") {
//       query = supabase.from("payments").select("*").eq("member_id", id).order("created_at", { ascending: false });
//     } else {
//       // group — id here is the group_id
//       query = supabase.from("payments").select("*").eq("group_id", id).order("created_at", { ascending: false });
//     }

//     const { data } = await query;
//     setPayHistory(data || []);
//     setPayHistoryLoading(false);
//   }

//   /* ── Renew ── */
//   async function handleRenewConfirm() {
//     const plan = plans.find((p) => p.id === selectedPlanId);
//     if (!plan) { alert("Select a plan"); return; }

//     const startDateObj  = new Date(selectedStartDate);
//     const expiryDateObj = new Date(startDateObj);
//     expiryDateObj.setDate(expiryDateObj.getDate() + plan.duration_days);

//     const start      = startDateObj.toLocaleDateString("en-CA");
//     const expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//     if (renewTarget.type === "single") {
//       const m = renewTarget.data;
//       await supabase.from("members").update({
//         plan_id: plan.id, plan_name: plan.name,
//         start_date: start, expiry_date: expiryDate,
//       }).eq("id", m.id);

//       await supabase.from("payments").insert({
//         source_type: "single_renew",
//         member_id:   m.id,
//         plan_id:     plan.id,
//         plan_name:   plan.name,
//         amount:      plan.price,
//         payment_mode: renewPaymentMode,
//       });
//     }

//     if (renewTarget.type === "group") {
//       const g = renewTarget.data;
//       await supabase.from("membership_groups").update({
//         plan_id: plan.id, plan_name: plan.name,
//         start_date: start, expiry_date: expiryDate,
//       }).eq("id", g.id);

//       await supabase.from("payments").insert({
//         source_type: "group_renew",
//         group_id:    g.id,
//         plan_id:     plan.id,
//         plan_name:   plan.name,
//         amount:      plan.price,
//         payment_mode: renewPaymentMode,
//       });
//     }

//     setRenewTarget(null);
//     setSelectedPlanId("");
//     setRenewPaymentMode("cash");
//     setSelectedStartDate(new Date().toISOString().split("T")[0]);
//     fetchAll();
//   }

//   /* ── Edit single / group member ── */
//   async function saveEdit() {
//     if (!editingMember) return;
//     if (!/^[A-Za-z ]{2,50}$/.test(editName))  { alert("Invalid name");  return; }
//     if (!/^[6-9]\d{9}$/.test(editPhone))       { alert("Invalid phone"); return; }

//     let photoUrl = null;
//     if (editPhoto) photoUrl = await uploadPhoto(editPhoto);

//     const selectedPlan  = plans.find((p) => p.id == editPlanId);
//     let upgradeAmount   = 0;
//     let expiryDate      = null;

//     if (editingMember.type === "single") {
//       const currentMember = singleMembers.find((m) => m.id === editingMember.id);
//       const updateData    = { full_name: editName, phone: editPhone };
//       if (photoUrl) updateData.photo_url = photoUrl;

//       if (selectedPlan) {
//         const currentPlan = plans.find((p) => p.id === currentMember.plan_id);
//         upgradeAmount = selectedPlan.price - (currentPlan?.price || 0);
//         if (upgradeAmount < 0) { alert("Downgrade not allowed"); return; }

//         const expiryDateObj = new Date(currentMember.start_date);
//         expiryDateObj.setDate(expiryDateObj.getDate() + selectedPlan.duration_days);
//         expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//         updateData.plan_id     = selectedPlan.id;
//         updateData.plan_name   = selectedPlan.name;
//         updateData.expiry_date = expiryDate;
//       }

//       await supabase.from("members").update(updateData).eq("id", editingMember.id);

//       if (selectedPlan) {
//         await supabase.from("payments").insert({
//           source_type: "single_upgrade",
//           member_id:   editingMember.id,
//           plan_id:     selectedPlan.id,
//           plan_name:   selectedPlan.name,
//           amount:      upgradeAmount,
//           payment_mode: "cash",
//         });
//       }
//     } else {
//       const updateData = { full_name: editName, phone: editPhone };
//       if (photoUrl) updateData.photo_url = photoUrl;
//       await supabase.from("group_members").update(updateData).eq("id", editingMember.id);

//       if (selectedPlan) {
//         const group       = groupMembers.find((g) => g.group_members.some((m) => m.id === editingMember.id));
//         const currentPlan = plans.find((p) => p.id === group.plan_id);
//         upgradeAmount     = selectedPlan.price - (currentPlan?.price || 0);
//         if (upgradeAmount < 0) { alert("Downgrade not allowed"); return; }

//         const expiryDateObj = new Date(group.start_date);
//         expiryDateObj.setDate(expiryDateObj.getDate() + selectedPlan.duration_days);
//         expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//         await supabase.from("membership_groups").update({
//           plan_id: selectedPlan.id, plan_name: selectedPlan.name, expiry_date: expiryDate,
//         }).eq("id", group.id);

//         await supabase.from("payments").insert({
//           source_type: "group_upgrade",
//           group_id:    group.id,
//           plan_id:     selectedPlan.id,
//           plan_name:   selectedPlan.name,
//           amount:      upgradeAmount,
//           payment_mode: "cash",
//         });
//       }
//     }

//     setEditingMember(null);
//     setEditPhoto(null);
//     setEditPlanId("");
//     fetchAll();
//   }

//   async function saveGroupEdit() {
//     for (const m of editingGroup.group_members) {
//       let photoUrl = m.photo_url;
//       if (m.newPhoto) photoUrl = await uploadPhoto(m.newPhoto);
//       await supabase.from("group_members").update({
//         full_name: m.full_name, phone: m.phone, photo_url: photoUrl,
//       }).eq("id", m.id);
//     }
//     setEditingGroup(null);
//     fetchAll();
//   }

//   async function deleteSingle(id) {
//     if (!confirm("Delete this member?")) return;
//     await supabase.from("members").delete().eq("id", id);
//     fetchAll();
//   }

//   async function deleteGroup(id) {
//     if (!confirm("Delete this group?")) return;
//     await supabase.from("membership_groups").delete().eq("id", id);
//     fetchAll();
//   }

//   /* ═══════════════════════════════════ RENDER ═══════════════════════════════════ */
//   return (
//     <div className="p-8 animate-fadeIn">

//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Members</h1>
//         <select
//           className="border px-4 py-2 rounded-xl shadow-sm"
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//         >
//           <option value="all">All</option>
//           <option value="active">Active</option>
//           <option value="due">Due</option>
//           <option value="expired">Expired</option>
//         </select>
//       </div>

//       {/* SEARCH */}
//       <div className="mb-10">
//         <input
//           type="text"
//           placeholder="Search by name or phone..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full border px-4 py-3 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//         />
//       </div>

//       {/* ── SINGLE MEMBERS ── */}
//       <h2 className="text-xl font-semibold mb-6">Single Members</h2>
//       <div className="grid md:grid-cols-3 gap-8 mb-14">
//         {applyFilter(singleMembers, "single").map((m) => {
//           const status = getStatus(m.expiry_date);
//           const accent =
//             status === "active" ? "from-emerald-500 to-green-600"
//             : status === "due"  ? "from-amber-500 to-orange-600"
//             : "from-rose-500 to-red-600";

//           return (
//             <div key={m.id} className="relative rounded-3xl p-6 bg-white shadow-xl hover:shadow-2xl transition overflow-hidden">
//               <div className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${accent}`} />

//               {/* Clickable card body → detail modal */}
//               <div className="cursor-pointer" onClick={() => setSelectedMember({ ...m, type: "single" })}>
//                 <div className="flex items-center gap-4 mb-4">
//                   <img
//                     src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}`}
//                     className="w-16 h-16 rounded-full object-cover"
//                   />
//                   <div>
//                     <h3 className="font-semibold">{m.full_name}</h3>
//                     <p className="text-sm text-slate-500">{m.phone}</p>
//                   </div>
//                 </div>
//                 <div className="text-sm text-slate-600 mb-3">
//                   <div>Plan: {m.plan_name}</div>
//                   <div>Start: {m.start_date}</div>
//                   <div>Expiry: {m.expiry_date}</div>
//                 </div>
//                 <span className={`px-3 py-1 text-xs rounded-full font-semibold text-white ${
//                   status === "active" ? "bg-emerald-600" : status === "due" ? "bg-amber-500" : "bg-rose-600"
//                 }`}>
//                   {status.toUpperCase()}
//                 </span>
//               </div>

//               <div className="flex gap-2 mt-4">
//                 {/* Payment History */}
//                 <button
//                   onClick={() => openPayHistory(m.id, m.full_name, "single")}
//                   className="flex-1 bg-slate-700 text-white py-2 rounded-xl text-sm hover:scale-105 transition"
//                 >
//                   💳 History
//                 </button>

//                 {(status === "expired" || status === "due") && (
//                   <button
//                     onClick={() => setRenewTarget({ type: "single", data: m })}
//                     className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm"
//                   >
//                     Renew
//                   </button>
//                 )}
//                 <button
//                   onClick={() => {
//                     setEditingMember({ id: m.id, type: "single" });
//                     setEditName(m.full_name);
//                     setEditPhone(m.phone);
//                   }}
//                   className="flex-1 bg-yellow-500 text-white py-2 rounded-xl text-sm"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => deleteSingle(m.id)}
//                   className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ── GROUP MEMBERS ── */}
//       <h2 className="text-xl font-semibold mb-6">Group Members</h2>
//       <div className="grid md:grid-cols-3 gap-8">
//         {applyFilter(groupMembers, "group").map((g) => {
//           const status = getStatus(g.expiry_date);
//           const accent =
//             status === "active" ? "from-emerald-500 to-green-600"
//             : status === "due"  ? "from-amber-500 to-orange-600"
//             : "from-rose-500 to-red-600";

//           return (
//             <div key={g.id} className="relative rounded-3xl p-6 bg-white shadow-xl hover:shadow-2xl transition overflow-hidden">
//               <div className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${accent}`} />
//               <h3 className="font-semibold mb-3 text-lg">{g.plan_name}</h3>
//               <div className="text-sm text-slate-600 mb-4">
//                 <div>Start: {g.start_date}</div>
//                 <div>Expiry: {g.expiry_date}</div>
//               </div>
//               <div className="space-y-3 mb-4">
//                 {g.group_members.map((m) => (
//                   <div key={m.id} className="flex items-center gap-3">
//                     <img
//                       src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}`}
//                       className="w-10 h-10 rounded-full object-cover"
//                     />
//                     <span className="text-sm">{m.is_primary && "👑 "}{m.full_name}</span>
//                   </div>
//                 ))}
//               </div>
//               <span className={`px-3 py-1 text-xs rounded-full font-semibold text-white ${
//                 status === "active" ? "bg-emerald-600" : status === "due" ? "bg-amber-500" : "bg-rose-600"
//               }`}>
//                 {status.toUpperCase()}
//               </span>

//               <div className="flex gap-2 mt-4">
//                 {/* Payment History for the group */}
//                 <button
//                   onClick={() => openPayHistory(g.id, g.plan_name, "group")}
//                   className="flex-1 bg-slate-700 text-white py-2 rounded-xl text-sm hover:scale-105 transition"
//                 >
//                   💳 History
//                 </button>

//                 {(status === "expired" || status === "due") && (
//                   <button
//                     onClick={() => setRenewTarget({ type: "group", data: g })}
//                     className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm"
//                   >
//                     Renew
//                   </button>
//                 )}
//                 <button
//                   onClick={() => setEditingGroup(g)}
//                   className="flex-1 bg-yellow-500 text-white py-2 rounded-xl text-sm"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => deleteGroup(g.id)}
//                   className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ═══════════════ PAYMENT HISTORY MODAL ═══════════════ */}
//       {payHistoryMember && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
//             {/* Header */}
//             <div className="flex justify-between items-center px-8 py-6 border-b">
//               <div>
//                 <h2 className="text-xl font-bold text-slate-800">💳 Payment History</h2>
//                 <p className="text-sm text-slate-500 mt-0.5">{payHistoryMember.name}</p>
//               </div>
//               <button
//                 onClick={() => { setPayHistoryMember(null); setPayHistory([]); }}
//                 className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Body */}
//             <div className="overflow-y-auto flex-1 px-8 py-6">
//               {payHistoryLoading ? (
//                 <p className="text-center text-slate-400 animate-pulse py-8">Loading…</p>
//               ) : payHistory.length === 0 ? (
//                 <p className="text-center text-slate-400 py-8">No payment records found.</p>
//               ) : (
//                 <div className="space-y-3">
//                   {payHistory.map((p) => (
//                     <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-4">
//                       <div>
//                         <div className="text-sm font-semibold text-slate-700">
//                           {SOURCE_LABELS[p.source_type] || p.source_type}
//                         </div>
//                         <div className="text-xs text-slate-400 mt-0.5">{p.plan_name || "—"}</div>
//                         <div className="text-xs text-slate-400">{fmtDate(p.created_at)}</div>
//                       </div>
//                       <div className="text-right">
//                         <div className="font-bold text-slate-800 text-lg">
//                           ₹{Number(p.amount || 0).toLocaleString("en-IN")}
//                         </div>
//                         <div className="text-xs text-slate-500 mt-0.5">
//                           {MODE_ICONS[p.payment_mode]} {p.payment_mode?.toUpperCase()}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Footer total */}
//             {payHistory.length > 0 && (
//               <div className="px-8 py-4 border-t flex justify-between items-center">
//                 <span className="text-sm text-slate-500 font-medium">Total Paid</span>
//                 <span className="font-extrabold text-xl text-indigo-600">
//                   ₹{payHistory.reduce((s, p) => s + Number(p.amount || 0), 0).toLocaleString("en-IN")}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* ═══════════════ RENEW MODAL ═══════════════ */}
//       {renewTarget && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-2xl w-96 shadow-xl">
//             <h3 className="text-lg font-semibold mb-4">
//               {renewTarget.type === "group"
//                 ? `Renew Group — ${renewTarget.data.group_members?.map((m) => m.full_name).join(", ")}`
//                 : "Select Plan for Renewal"}
//             </h3>

//             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Start Date</label>
//             <input
//               type="date"
//               value={selectedStartDate}
//               onChange={(e) => setSelectedStartDate(e.target.value)}
//               className="border w-full px-3 py-2 mb-4 rounded-lg"
//             />

//             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Plan</label>
//             <select
//               value={selectedPlanId}
//               onChange={(e) => setSelectedPlanId(e.target.value)}
//               className="border w-full px-3 py-2 mb-4 rounded-lg"
//             >
//               <option value="">Select Plan</option>
//               {plans.map((p) => (
//                 <option key={p.id} value={p.id}>{p.name} – ₹{p.price}</option>
//               ))}
//             </select>

//             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Payment Mode</label>
//             <select
//               value={renewPaymentMode}
//               onChange={(e) => setRenewPaymentMode(e.target.value)}
//               className="border w-full px-3 py-2 mb-6 rounded-lg"
//             >
//               <option value="cash">💵 Cash</option>
//               <option value="upi">📱 UPI</option>
//               <option value="card">💳 Card</option>
//             </select>

//             <div className="flex gap-2">
//               <button
//                 onClick={handleRenewConfirm}
//                 className="flex-1 bg-indigo-600 text-white py-2 rounded-xl"
//               >
//                 Confirm
//               </button>
//               <button
//                 onClick={() => { setRenewTarget(null); setSelectedPlanId(""); setRenewPaymentMode("cash"); }}
//                 className="flex-1 bg-gray-300 py-2 rounded-xl"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ═══════════════ EDIT SINGLE MODAL ═══════════════ */}
//       {editingMember && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-2xl w-96 shadow-xl">
//             <h3 className="font-semibold mb-4">Edit Member</h3>
//             <input className="border w-full px-3 py-2 mb-3 rounded-lg" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full Name" />
//             <input className="border w-full px-3 py-2 mb-3 rounded-lg" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" />
//             <input type="file" onChange={(e) => setEditPhoto(e.target.files[0])} className="border w-full px-3 py-2 mb-3 rounded-lg" />
//             <select value={editPlanId} onChange={(e) => setEditPlanId(e.target.value)} className="border w-full px-3 py-2 mb-4 rounded-lg">
//               <option value="">Keep Current Plan</option>
//               {plans.map((p) => <option key={p.id} value={p.id}>{p.name} – ₹{p.price}</option>)}
//             </select>
//             <div className="flex gap-2">
//               <button onClick={saveEdit} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl">Save</button>
//               <button onClick={() => setEditingMember(null)} className="flex-1 bg-gray-300 py-2 rounded-xl">Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ═══════════════ GROUP EDIT MODAL ═══════════════ */}
//       {editingGroup && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white rounded-3xl p-8 w-[500px] shadow-2xl">
//             <h2 className="text-xl font-semibold mb-6">Edit Group Members</h2>
//             {editingGroup.group_members.map((m, i) => (
//               <div key={m.id} className="border p-4 rounded-xl mb-4">
//                 <div className="font-medium mb-2">{m.is_primary ? "Primary Member" : `Member ${i + 1}`}</div>
//                 <input defaultValue={m.full_name} onChange={(e) => (m.full_name = e.target.value)} className="border px-3 py-2 rounded w-full mb-2" />
//                 <input defaultValue={m.phone}     onChange={(e) => (m.phone     = e.target.value)} className="border px-3 py-2 rounded w-full mb-2" />
//                 <input type="file" onChange={(e) => (m.newPhoto = e.target.files[0])} />
//               </div>
//             ))}
//             <div className="flex gap-2">
//               <button onClick={saveGroupEdit} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl">Save Changes</button>
//               <button onClick={() => setEditingGroup(null)} className="flex-1 bg-gray-300 py-2 rounded-xl">Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ═══════════════ MEMBER DETAIL MODAL (existing) ═══════════════ */}
//       {selectedMember && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-bold">Member Details</h2>
//               <button onClick={() => setSelectedMember(null)} className="text-slate-400 hover:text-slate-700 text-2xl">✕</button>
//             </div>
//             <div className="flex items-center gap-4 mb-6">
//               <img
//                 src={selectedMember.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.full_name)}`}
//                 className="w-20 h-20 rounded-full object-cover"
//               />
//               <div>
//                 <div className="text-xl font-bold">{selectedMember.full_name}</div>
//                 <div className="text-slate-500">{selectedMember.phone}</div>
//               </div>
//             </div>
//             <div className="space-y-2 text-sm text-slate-700 mb-6">
//               <div className="flex justify-between"><span className="text-slate-400">Plan</span><span className="font-medium">{selectedMember.plan_name}</span></div>
//               <div className="flex justify-between"><span className="text-slate-400">Start Date</span><span>{selectedMember.start_date}</span></div>
//               <div className="flex justify-between"><span className="text-slate-400">Expiry Date</span><span>{selectedMember.expiry_date}</span></div>
//             </div>
//             <button
//               onClick={() => { setSelectedMember(null); openPayHistory(selectedMember.id, selectedMember.full_name, "single"); }}
//               className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition"
//             >
//               💳 View Payment History
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { createPortal } from "react-dom";
// import { supabase } from "../../supabase";

// /* Renders children into document.body — always centered on viewport, never affected by page scroll */
// function Modal({ children }) {
//   return createPortal(children, document.body);
// }

// const SOURCE_LABELS = {
//   single_new:     "New Member",
//   single_renew:   "Renewal",
//   single_upgrade: "Upgrade",
//   group_new:      "New Group",
//   group_renew:    "Group Renewal",
//   group_upgrade:  "Group Upgrade",
//   due_payment:    "Due Payment",
// };

// const MODE_ICONS = { cash: "💵", upi: "📱", card: "💳" };

// function fmtDate(iso) {
//   if (!iso) return "—";
//   return new Date(iso).toLocaleDateString("en-IN", {
//     day: "2-digit", month: "short", year: "numeric",
//   });
// }

// export default function AdminMembers() {
//   const [singleMembers, setSingleMembers] = useState([]);
//   const [groupMembers, setGroupMembers]   = useState([]);
//   const [plans, setPlans]                 = useState([]);
//   const [filter, setFilter]               = useState("all");
//   const [search, setSearch]               = useState("");

//   const [editingMember, setEditingMember] = useState(null);
//   const [editName, setEditName]           = useState("");
//   const [editPhone, setEditPhone]         = useState("");
//   const [editPhoto, setEditPhoto]         = useState(null);
//   const [editPlanId, setEditPlanId]       = useState("");

//   const [renewTarget, setRenewTarget]         = useState(null);
//   const [selectedPlanId, setSelectedPlanId]   = useState("");
//   const [selectedStartDate, setSelectedStartDate] = useState(
//     new Date().toISOString().split("T")[0]
//   );
//   const [renewPaymentMode, setRenewPaymentMode] = useState("cash");

//   const [editingGroup, setEditingGroup]   = useState(null);

//   // Payment history modal
//   const [payHistoryMember, setPayHistoryMember] = useState(null); // { id, name, type }
//   const [payHistory, setPayHistory]             = useState([]);
//   const [payHistoryLoading, setPayHistoryLoading] = useState(false);

//   // Member detail modal
//   const [selectedMember, setSelectedMember] = useState(null);

//   useEffect(() => { fetchAll(); }, []);

//   async function fetchAll() {
//     const { data: singles } = await supabase
//       .from("members")
//       .select("*")
//       .order("created_at", { ascending: false });

//     const { data: groups } = await supabase
//       .from("membership_groups")
//       .select(`id, plan_id, plan_name, start_date, expiry_date,
//         group_members (id, full_name, phone, photo_url, is_primary)`)
//       .order("created_at", { ascending: false });

//     const { data: plansData } = await supabase.from("plans").select("*");

//     setSingleMembers(singles || []);
//     setGroupMembers(groups || []);
//     setPlans(plansData || []);
//   }

//   function getStatus(expiry) {
//     const today = new Date(); today.setHours(0,0,0,0);
//     const exp   = new Date(expiry); exp.setHours(0,0,0,0);
//     const diff  = Math.ceil((exp - today) / 86400000);
//     if (diff <= 0) return "expired";
//     if (diff <= 2) return "due";
//     return "active";
//   }

//   function applyFilter(list, type = "single") {
//     let result = list;
//     if (filter !== "all") result = result.filter((i) => getStatus(i.expiry_date) === filter);
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       if (type === "single") {
//         result = result.filter((m) => m.full_name?.toLowerCase().includes(q) || m.phone?.includes(q));
//       } else {
//         result = result.filter((g) =>
//           g.group_members?.some((m) => m.full_name?.toLowerCase().includes(q) || m.phone?.includes(q))
//         );
//       }
//     }
//     return result;
//   }

//   async function uploadPhoto(file) {
//     const name = `${crypto.randomUUID()}-${file.name}`;
//     await supabase.storage.from("member-photos").upload(name, file);
//     return supabase.storage.from("member-photos").getPublicUrl(name).data.publicUrl;
//   }

//   /* ── Open payment history for a member ── */
//   async function openPayHistory(id, name, type) {
//     setPayHistoryMember({ id, name, type });
//     setPayHistoryLoading(true);
//     setPayHistory([]);

//     let query;
//     if (type === "single") {
//       query = supabase.from("payments").select("*").eq("member_id", id).order("created_at", { ascending: false });
//     } else {
//       // group — id here is the group_id
//       query = supabase.from("payments").select("*").eq("group_id", id).order("created_at", { ascending: false });
//     }

//     const { data } = await query;
//     setPayHistory(data || []);
//     setPayHistoryLoading(false);
//   }

//   /* ── Renew ── */
//   async function handleRenewConfirm() {
//     const plan = plans.find((p) => p.id === selectedPlanId);
//     if (!plan) { alert("Select a plan"); return; }

//     const startDateObj  = new Date(selectedStartDate);
//     const expiryDateObj = new Date(startDateObj);
//     expiryDateObj.setDate(expiryDateObj.getDate() + plan.duration_days);

//     const start      = startDateObj.toLocaleDateString("en-CA");
//     const expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//     if (renewTarget.type === "single") {
//       const m = renewTarget.data;
//       await supabase.from("members").update({
//         plan_id: plan.id, plan_name: plan.name,
//         start_date: start, expiry_date: expiryDate,
//       }).eq("id", m.id);

//       await supabase.from("payments").insert({
//         source_type: "single_renew",
//         member_id:   m.id,
//         plan_id:     plan.id,
//         plan_name:   plan.name,
//         amount:      plan.price,
//         payment_mode: renewPaymentMode,
//       });
//     }

//     if (renewTarget.type === "group") {
//       const g = renewTarget.data;
//       await supabase.from("membership_groups").update({
//         plan_id: plan.id, plan_name: plan.name,
//         start_date: start, expiry_date: expiryDate,
//       }).eq("id", g.id);

//       await supabase.from("payments").insert({
//         source_type: "group_renew",
//         group_id:    g.id,
//         plan_id:     plan.id,
//         plan_name:   plan.name,
//         amount:      plan.price,
//         payment_mode: renewPaymentMode,
//       });
//     }

//     setRenewTarget(null);
//     setSelectedPlanId("");
//     setRenewPaymentMode("cash");
//     setSelectedStartDate(new Date().toISOString().split("T")[0]);
//     fetchAll();
//   }

//   /* ── Edit single / group member ── */
//   async function saveEdit() {
//     if (!editingMember) return;
//     if (!/^[A-Za-z ]{2,50}$/.test(editName))  { alert("Invalid name");  return; }
//     if (!/^[6-9]\d{9}$/.test(editPhone))       { alert("Invalid phone"); return; }

//     let photoUrl = null;
//     if (editPhoto) photoUrl = await uploadPhoto(editPhoto);

//     const selectedPlan  = plans.find((p) => p.id == editPlanId);
//     let upgradeAmount   = 0;
//     let expiryDate      = null;

//     if (editingMember.type === "single") {
//       const currentMember = singleMembers.find((m) => m.id === editingMember.id);
//       const updateData    = { full_name: editName, phone: editPhone };
//       if (photoUrl) updateData.photo_url = photoUrl;

//       if (selectedPlan) {
//         const currentPlan = plans.find((p) => p.id === currentMember.plan_id);
//         upgradeAmount = selectedPlan.price - (currentPlan?.price || 0);
//         if (upgradeAmount < 0) { alert("Downgrade not allowed"); return; }

//         const expiryDateObj = new Date(currentMember.start_date);
//         expiryDateObj.setDate(expiryDateObj.getDate() + selectedPlan.duration_days);
//         expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//         updateData.plan_id     = selectedPlan.id;
//         updateData.plan_name   = selectedPlan.name;
//         updateData.expiry_date = expiryDate;
//       }

//       await supabase.from("members").update(updateData).eq("id", editingMember.id);

//       if (selectedPlan) {
//         await supabase.from("payments").insert({
//           source_type: "single_upgrade",
//           member_id:   editingMember.id,
//           plan_id:     selectedPlan.id,
//           plan_name:   selectedPlan.name,
//           amount:      upgradeAmount,
//           payment_mode: "cash",
//         });
//       }
//     } else {
//       const updateData = { full_name: editName, phone: editPhone };
//       if (photoUrl) updateData.photo_url = photoUrl;
//       await supabase.from("group_members").update(updateData).eq("id", editingMember.id);

//       if (selectedPlan) {
//         const group       = groupMembers.find((g) => g.group_members.some((m) => m.id === editingMember.id));
//         const currentPlan = plans.find((p) => p.id === group.plan_id);
//         upgradeAmount     = selectedPlan.price - (currentPlan?.price || 0);
//         if (upgradeAmount < 0) { alert("Downgrade not allowed"); return; }

//         const expiryDateObj = new Date(group.start_date);
//         expiryDateObj.setDate(expiryDateObj.getDate() + selectedPlan.duration_days);
//         expiryDate = expiryDateObj.toLocaleDateString("en-CA");

//         await supabase.from("membership_groups").update({
//           plan_id: selectedPlan.id, plan_name: selectedPlan.name, expiry_date: expiryDate,
//         }).eq("id", group.id);

//         await supabase.from("payments").insert({
//           source_type: "group_upgrade",
//           group_id:    group.id,
//           plan_id:     selectedPlan.id,
//           plan_name:   selectedPlan.name,
//           amount:      upgradeAmount,
//           payment_mode: "cash",
//         });
//       }
//     }

//     setEditingMember(null);
//     setEditPhoto(null);
//     setEditPlanId("");
//     fetchAll();
//   }

//   async function saveGroupEdit() {
//     for (const m of editingGroup.group_members) {
//       let photoUrl = m.photo_url;
//       if (m.newPhoto) photoUrl = await uploadPhoto(m.newPhoto);
//       await supabase.from("group_members").update({
//         full_name: m.full_name, phone: m.phone, photo_url: photoUrl,
//       }).eq("id", m.id);
//     }
//     setEditingGroup(null);
//     fetchAll();
//   }

//   async function deleteSingle(id) {
//     if (!confirm("Delete this member?")) return;
//     await supabase.from("members").delete().eq("id", id);
//     fetchAll();
//   }

//   async function deleteGroup(id) {
//     if (!confirm("Delete this group?")) return;
//     await supabase.from("membership_groups").delete().eq("id", id);
//     fetchAll();
//   }

//   /* ═══════════════════════════════════ RENDER ═══════════════════════════════════ */
//   return (
//     <div className="p-8 animate-fadeIn">

//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Members</h1>
//         <select
//           className="border px-4 py-2 rounded-xl shadow-sm"
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//         >
//           <option value="all">All</option>
//           <option value="active">Active</option>
//           <option value="due">Due</option>
//           <option value="expired">Expired</option>
//         </select>
//       </div>

//       {/* SEARCH */}
//       <div className="mb-10">
//         <input
//           type="text"
//           placeholder="Search by name or phone..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full border px-4 py-3 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//         />
//       </div>

//       {/* ── SINGLE MEMBERS ── */}
//       <h2 className="text-xl font-semibold mb-6">Single Members</h2>
//       <div className="grid md:grid-cols-3 gap-8 mb-14">
//         {applyFilter(singleMembers, "single").map((m) => {
//           const status = getStatus(m.expiry_date);
//           const accent =
//             status === "active" ? "from-emerald-500 to-green-600"
//             : status === "due"  ? "from-amber-500 to-orange-600"
//             : "from-rose-500 to-red-600";

//           return (
//             <div key={m.id} className="relative rounded-3xl p-6 bg-white shadow-xl hover:shadow-2xl transition overflow-hidden">
//               <div className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${accent}`} />

//               {/* Clickable card body → detail modal */}
//               <div className="cursor-pointer" onClick={() => setSelectedMember({ ...m, type: "single" })}>
//                 <div className="flex items-center gap-4 mb-4">
//                   <img
//                     src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}`}
//                     className="w-16 h-16 rounded-full object-cover"
//                   />
//                   <div>
//                     <h3 className="font-semibold">{m.full_name}</h3>
//                     <p className="text-sm text-slate-500">{m.phone}</p>
//                   </div>
//                 </div>
//                 <div className="text-sm text-slate-600 mb-3">
//                   <div>Plan: {m.plan_name}</div>
//                   <div>Start: {m.start_date}</div>
//                   <div>Expiry: {m.expiry_date}</div>
//                 </div>
//                 <span className={`px-3 py-1 text-xs rounded-full font-semibold text-white ${
//                   status === "active" ? "bg-emerald-600" : status === "due" ? "bg-amber-500" : "bg-rose-600"
//                 }`}>
//                   {status.toUpperCase()}
//                 </span>
//               </div>

//               <div className="flex gap-2 mt-4">
//                 {/* Payment History */}
//                 <button
//                   onClick={() => openPayHistory(m.id, m.full_name, "single")}
//                   className="flex-1 bg-slate-700 text-white py-2 rounded-xl text-sm hover:scale-105 transition"
//                 >
//                   💳 History
//                 </button>

//                 {(status === "expired" || status === "due") && (
//                   <button
//                     onClick={() => setRenewTarget({ type: "single", data: m })}
//                     className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm"
//                   >
//                     Renew
//                   </button>
//                 )}
//                 <button
//                   onClick={() => {
//                     setEditingMember({ id: m.id, type: "single" });
//                     setEditName(m.full_name);
//                     setEditPhone(m.phone);
//                   }}
//                   className="flex-1 bg-yellow-500 text-white py-2 rounded-xl text-sm"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => deleteSingle(m.id)}
//                   className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ── GROUP MEMBERS ── */}
//       <h2 className="text-xl font-semibold mb-6">Group Members</h2>
//       <div className="grid md:grid-cols-3 gap-8">
//         {applyFilter(groupMembers, "group").map((g) => {
//           const status = getStatus(g.expiry_date);
//           const accent =
//             status === "active" ? "from-emerald-500 to-green-600"
//             : status === "due"  ? "from-amber-500 to-orange-600"
//             : "from-rose-500 to-red-600";

//           return (
//             <div key={g.id} className="relative rounded-3xl p-6 bg-white shadow-xl hover:shadow-2xl transition overflow-hidden">
//               <div className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${accent}`} />
//               <h3 className="font-semibold mb-3 text-lg">{g.plan_name}</h3>
//               <div className="text-sm text-slate-600 mb-4">
//                 <div>Start: {g.start_date}</div>
//                 <div>Expiry: {g.expiry_date}</div>
//               </div>
//               <div className="space-y-3 mb-4">
//                 {g.group_members.map((m) => (
//                   <div key={m.id} className="flex items-center gap-3">
//                     <img
//                       src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}`}
//                       className="w-10 h-10 rounded-full object-cover"
//                     />
//                     <span className="text-sm">{m.is_primary && "👑 "}{m.full_name}</span>
//                   </div>
//                 ))}
//               </div>
//               <span className={`px-3 py-1 text-xs rounded-full font-semibold text-white ${
//                 status === "active" ? "bg-emerald-600" : status === "due" ? "bg-amber-500" : "bg-rose-600"
//               }`}>
//                 {status.toUpperCase()}
//               </span>

//               <div className="flex gap-2 mt-4">
//                 {/* Payment History for the group */}
//                 <button
//                   onClick={() => openPayHistory(g.id, g.plan_name, "group")}
//                   className="flex-1 bg-slate-700 text-white py-2 rounded-xl text-sm hover:scale-105 transition"
//                 >
//                   💳 History
//                 </button>

//                 {(status === "expired" || status === "due") && (
//                   <button
//                     onClick={() => setRenewTarget({ type: "group", data: g })}
//                     className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm"
//                   >
//                     Renew
//                   </button>
//                 )}
//                 <button
//                   onClick={() => setEditingGroup(g)}
//                   className="flex-1 bg-yellow-500 text-white py-2 rounded-xl text-sm"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => deleteGroup(g.id)}
//                   className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ═══════════════ PAYMENT HISTORY MODAL ═══════════════ */}
//       {payHistoryMember && (
//         <Modal>
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
//             {/* Header */}
//             <div className="flex justify-between items-center px-8 py-6 border-b">
//               <div>
//                 <h2 className="text-xl font-bold text-slate-800">💳 Payment History</h2>
//                 <p className="text-sm text-slate-500 mt-0.5">{payHistoryMember.name}</p>
//               </div>
//               <button
//                 onClick={() => { setPayHistoryMember(null); setPayHistory([]); }}
//                 className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Body */}
//             <div className="overflow-y-auto flex-1 px-8 py-6">
//               {payHistoryLoading ? (
//                 <p className="text-center text-slate-400 animate-pulse py-8">Loading…</p>
//               ) : payHistory.length === 0 ? (
//                 <p className="text-center text-slate-400 py-8">No payment records found.</p>
//               ) : (
//                 <div className="space-y-3">
//                   {payHistory.map((p) => (
//                     <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-4">
//                       <div>
//                         <div className="text-sm font-semibold text-slate-700">
//                           {SOURCE_LABELS[p.source_type] || p.source_type}
//                         </div>
//                         <div className="text-xs text-slate-400 mt-0.5">{p.plan_name || "—"}</div>
//                         <div className="text-xs text-slate-400">{fmtDate(p.created_at)}</div>
//                       </div>
//                       <div className="text-right">
//                         <div className="font-bold text-slate-800 text-lg">
//                           ₹{Number(p.amount || 0).toLocaleString("en-IN")}
//                         </div>
//                         <div className="text-xs text-slate-500 mt-0.5">
//                           {MODE_ICONS[p.payment_mode]} {p.payment_mode?.toUpperCase()}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Footer total */}
//             {payHistory.length > 0 && (
//               <div className="px-8 py-4 border-t flex justify-between items-center">
//                 <span className="text-sm text-slate-500 font-medium">Total Paid</span>
//                 <span className="font-extrabold text-xl text-indigo-600">
//                   ₹{payHistory.reduce((s, p) => s + Number(p.amount || 0), 0).toLocaleString("en-IN")}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//         </Modal>
//       )}

//       {/* ═══════════════ RENEW MODAL ═══════════════ */}
//       {renewTarget && (
//         <Modal>
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-2xl w-96 shadow-xl">
//             <h3 className="text-lg font-semibold mb-4">
//               {renewTarget.type === "group"
//                 ? `Renew Group — ${renewTarget.data.group_members?.map((m) => m.full_name).join(", ")}`
//                 : "Select Plan for Renewal"}
//             </h3>

//             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Start Date</label>
//             <input
//               type="date"
//               value={selectedStartDate}
//               onChange={(e) => setSelectedStartDate(e.target.value)}
//               className="border w-full px-3 py-2 mb-4 rounded-lg"
//             />

//             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Plan</label>
//             <select
//               value={selectedPlanId}
//               onChange={(e) => setSelectedPlanId(e.target.value)}
//               className="border w-full px-3 py-2 mb-4 rounded-lg"
//             >
//               <option value="">Select Plan</option>
//               {plans.map((p) => (
//                 <option key={p.id} value={p.id}>{p.name} – ₹{p.price}</option>
//               ))}
//             </select>

//             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Payment Mode</label>
//             <select
//               value={renewPaymentMode}
//               onChange={(e) => setRenewPaymentMode(e.target.value)}
//               className="border w-full px-3 py-2 mb-6 rounded-lg"
//             >
//               <option value="cash">💵 Cash</option>
//               <option value="upi">📱 UPI</option>
//               <option value="card">💳 Card</option>
//             </select>

//             <div className="flex gap-2">
//               <button
//                 onClick={handleRenewConfirm}
//                 className="flex-1 bg-indigo-600 text-white py-2 rounded-xl"
//               >
//                 Confirm
//               </button>
//               <button
//                 onClick={() => { setRenewTarget(null); setSelectedPlanId(""); setRenewPaymentMode("cash"); }}
//                 className="flex-1 bg-gray-300 py-2 rounded-xl"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//         </Modal>
//       )}

//       {/* ═══════════════ EDIT SINGLE MODAL ═══════════════ */}
//       {editingMember && (
//         <Modal>
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-2xl w-96 shadow-xl">
//             <h3 className="font-semibold mb-4">Edit Member</h3>
//             <input className="border w-full px-3 py-2 mb-3 rounded-lg" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full Name" />
//             <input className="border w-full px-3 py-2 mb-3 rounded-lg" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" />
//             <input type="file" onChange={(e) => setEditPhoto(e.target.files[0])} className="border w-full px-3 py-2 mb-3 rounded-lg" />
//             <select value={editPlanId} onChange={(e) => setEditPlanId(e.target.value)} className="border w-full px-3 py-2 mb-4 rounded-lg">
//               <option value="">Keep Current Plan</option>
//               {plans.map((p) => <option key={p.id} value={p.id}>{p.name} – ₹{p.price}</option>)}
//             </select>
//             <div className="flex gap-2">
//               <button onClick={saveEdit} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl">Save</button>
//               <button onClick={() => setEditingMember(null)} className="flex-1 bg-gray-300 py-2 rounded-xl">Cancel</button>
//             </div>
//           </div>
//         </div>
//         </Modal>
//       )}

//       {/* ═══════════════ GROUP EDIT MODAL ═══════════════ */}
//       {editingGroup && (
//         <Modal>
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white rounded-3xl p-8 w-[500px] shadow-2xl">
//             <h2 className="text-xl font-semibold mb-6">Edit Group Members</h2>
//             {editingGroup.group_members.map((m, i) => (
//               <div key={m.id} className="border p-4 rounded-xl mb-4">
//                 <div className="font-medium mb-2">{m.is_primary ? "Primary Member" : `Member ${i + 1}`}</div>
//                 <input defaultValue={m.full_name} onChange={(e) => (m.full_name = e.target.value)} className="border px-3 py-2 rounded w-full mb-2" />
//                 <input defaultValue={m.phone}     onChange={(e) => (m.phone     = e.target.value)} className="border px-3 py-2 rounded w-full mb-2" />
//                 <input type="file" onChange={(e) => (m.newPhoto = e.target.files[0])} />
//               </div>
//             ))}
//             <div className="flex gap-2">
//               <button onClick={saveGroupEdit} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl">Save Changes</button>
//               <button onClick={() => setEditingGroup(null)} className="flex-1 bg-gray-300 py-2 rounded-xl">Cancel</button>
//             </div>
//           </div>
//         </div>
//         </Modal>
//       )}

//       {/* ═══════════════ MEMBER DETAIL MODAL (existing) ═══════════════ */}
//       {selectedMember && (
//         <Modal>
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-bold">Member Details</h2>
//               <button onClick={() => setSelectedMember(null)} className="text-slate-400 hover:text-slate-700 text-2xl">✕</button>
//             </div>
//             <div className="flex items-center gap-4 mb-6">
//               <img
//                 src={selectedMember.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.full_name)}`}
//                 className="w-20 h-20 rounded-full object-cover"
//               />
//               <div>
//                 <div className="text-xl font-bold">{selectedMember.full_name}</div>
//                 <div className="text-slate-500">{selectedMember.phone}</div>
//               </div>
//             </div>
//             <div className="space-y-2 text-sm text-slate-700 mb-6">
//               <div className="flex justify-between"><span className="text-slate-400">Plan</span><span className="font-medium">{selectedMember.plan_name}</span></div>
//               <div className="flex justify-between"><span className="text-slate-400">Start Date</span><span>{selectedMember.start_date}</span></div>
//               <div className="flex justify-between"><span className="text-slate-400">Expiry Date</span><span>{selectedMember.expiry_date}</span></div>
//             </div>
//             <button
//               onClick={() => { setSelectedMember(null); openPayHistory(selectedMember.id, selectedMember.full_name, "single"); }}
//               className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition"
//             >
//               💳 View Payment History
//             </button>
//           </div>
//         </div>
//         </Modal>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../supabase";

function Modal({ children }) {
  return createPortal(children, document.body);
}

const SOURCE_LABELS = {
  single_new:     "New Member",
  single_renew:   "Renewal",
  single_upgrade: "Upgrade",
  group_new:      "New Group",
  group_renew:    "Group Renewal",
  group_upgrade:  "Group Upgrade",
  due_payment:    "Due Payment",
};

const MODE_ICONS = { cash: "💵", upi: "📱", card: "💳" };

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
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

export default function AdminMembers() {
  const [singleMembers, setSingleMembers] = useState([]);
  const [groupMembers,  setGroupMembers]  = useState([]);
  const [plans,         setPlans]         = useState([]);

  const [activeTab,    setActiveTab]    = useState("all");
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingMember, setEditingMember] = useState(null);
  const [editName,  setEditName]  = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPlanId, setEditPlanId] = useState("");

  const [renewTarget,       setRenewTarget]       = useState(null);
  const [selectedPlanId,    setSelectedPlanId]    = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [renewPaymentMode,  setRenewPaymentMode]  = useState("cash");
  const [additionalMembers, setAdditionalMembers] = useState([]);

  const [editingGroup, setEditingGroup] = useState(null);

  const [payHistoryMember,  setPayHistoryMember]  = useState(null);
  const [payHistory,        setPayHistory]        = useState([]);
  const [payHistoryLoading, setPayHistoryLoading] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [{ data: singles }, { data: groups }, { data: plansData }] = await Promise.all([
      supabase.from("members").select("*").order("created_at", { ascending: false }),
      supabase.from("membership_groups")
        .select(`id, plan_id, plan_name, start_date, expiry_date,
          group_members (id, full_name, phone, photo_url, is_primary)`)
        .order("created_at", { ascending: false }),
      supabase.from("plans").select("*"),
    ]);
    setSingleMembers(singles || []);
    setGroupMembers(groups   || []);
    setPlans(plansData       || []);
  }

  function sortMembers(list, filter) {
    return [...list].sort((a, b) => {
      const expA = a.expiry_date || "";
      const expB = b.expiry_date || "";
      if (!expA && !expB) return 0;
      if (!expA) return 1;
      if (!expB) return -1;

      if (filter === "expired") {
        // Most recently expired first (e.g. 2026-08-09 before 2026-07-01)
        return expB.localeCompare(expA);
      } else if (filter === "due" || filter === "active") {
        // Expiring soonest first
        return expA.localeCompare(expB);
      } else {
        // For 'all': sort with most recent expiry date at top
        return expB.localeCompare(expA);
      }
    });
  }

  function filterSingles(list) {
    const filtered = list.filter((m) => {
      if (statusFilter !== "all" && getStatus(m.expiry_date) !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return m.full_name?.toLowerCase().includes(q) || m.phone?.includes(q);
      }
      return true;
    });
    return sortMembers(filtered, statusFilter);
  }

  function filterGroups(list) {
    const filtered = list.filter((g) => {
      if (statusFilter !== "all" && getStatus(g.expiry_date) !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return g.group_members?.some(
          (m) => m.full_name?.toLowerCase().includes(q) || m.phone?.includes(q)
        );
      }
      return true;
    });
    return sortMembers(filtered, statusFilter);
  }

  const filteredSingles = filterSingles(singleMembers);
  const filteredGroups  = filterGroups(groupMembers);
  const counts = {
    all:    filteredSingles.length + filteredGroups.length,
    single: filteredSingles.length,
    group:  filteredGroups.length,
  };

  async function uploadPhoto(file) {
    const name = `${crypto.randomUUID()}-${file.name}`;
    await supabase.storage.from("member-photos").upload(name, file);
    return supabase.storage.from("member-photos").getPublicUrl(name).data.publicUrl;
  }

  async function openPayHistory(id, name, type) {
    setPayHistoryMember({ id, name, type });
    setPayHistoryLoading(true);
    setPayHistory([]);
    const col = type === "single" ? "member_id" : "group_id";
    const { data } = await supabase.from("payments").select("*").eq(col, id).order("created_at", { ascending: false });
    setPayHistory(data || []);
    setPayHistoryLoading(false);
  }

  function handleRenewPlanChange(planId) {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      setAdditionalMembers([]);
      return;
    }

    if (renewTarget?.type === "single" && plan.max_members > 1) {
      const needed = plan.max_members - 1;
      setAdditionalMembers(
        Array.from({ length: needed }).map(() => ({
          full_name: "",
          phone: "",
          photo: null,
        }))
      );
    } else if (
      renewTarget?.type === "group" &&
      plan.max_members > (renewTarget.data.group_members?.length || 1)
    ) {
      const currentCount = renewTarget.data.group_members?.length || 1;
      const needed = plan.max_members - currentCount;
      setAdditionalMembers(
        Array.from({ length: needed }).map(() => ({
          full_name: "",
          phone: "",
          photo: null,
        }))
      );
    } else {
      setAdditionalMembers([]);
    }
  }

  async function handleRenewConfirm() {
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) { alert("Select a plan"); return; }
    const startObj  = new Date(selectedStartDate + "T00:00:00");
    const expiryObj = new Date(startObj);
    expiryObj.setDate(expiryObj.getDate() + plan.duration_days);
    const start  = startObj.toLocaleDateString("en-CA");
    const expiry = expiryObj.toLocaleDateString("en-CA");

    // Case 1: Single Member converting to Group Pack (Couple / Buddy)
    if (renewTarget.type === "single" && plan.max_members > 1) {
      for (let i = 0; i < additionalMembers.length; i++) {
        const extra = additionalMembers[i];
        if (!/^[A-Za-z ]{2,50}$/.test(extra.full_name)) {
          alert(`Enter a valid name for Member ${i + 2}`);
          return;
        }
        if (!/^[6-9]\d{9}$/.test(extra.phone)) {
          alert(`Enter a valid 10-digit phone for Member ${i + 2}`);
          return;
        }
      }

      const m = renewTarget.data;

      // 1. Create membership group
      const { data: group, error: groupError } = await supabase
        .from("membership_groups")
        .insert({
          plan_id: plan.id,
          plan_name: plan.name,
          start_date: start,
          expiry_date: expiry,
        })
        .select()
        .single();

      if (groupError) {
        console.error(groupError);
        alert("Failed to create membership group.");
        return;
      }

      // 2. Insert primary member into group_members
      const { error: primaryError } = await supabase.from("group_members").insert({
        group_id: group.id,
        full_name: m.full_name,
        phone: m.phone,
        photo_url: m.photo_url,
        is_primary: true,
        whatsapp_opt_in: true,
      });

      if (primaryError) {
        console.error(primaryError);
        alert("Failed to add primary member to group.");
        return;
      }

      // 3. Insert additional member(s) into group_members
      for (const extra of additionalMembers) {
        let photoUrl = null;
        if (extra.photo) {
          photoUrl = await uploadPhoto(extra.photo);
        }
        await supabase.from("group_members").insert({
          group_id: group.id,
          full_name: extra.full_name,
          phone: extra.phone,
          photo_url: photoUrl,
          is_primary: false,
          whatsapp_opt_in: true,
        });
      }

      // 4. Record payment
      await supabase.from("payments").insert({
        source_type: "group_renew",
        group_id: group.id,
        plan_id: plan.id,
        plan_name: plan.name,
        amount: plan.price,
        payment_mode: renewPaymentMode,
      });

      // 5. Delete old single member row
      await supabase.from("members").delete().eq("id", m.id);

      alert(`Successfully renewed and converted ${m.full_name} to ${plan.name}!`);
    }
    // Case 2: Standard Single Member Renew (to single plan)
    else if (renewTarget.type === "single") {
      const m = renewTarget.data;
      await supabase.from("members").update({ plan_id: plan.id, plan_name: plan.name, start_date: start, expiry_date: expiry }).eq("id", m.id);
      await supabase.from("payments").insert({ source_type: "single_renew", member_id: m.id, plan_id: plan.id, plan_name: plan.name, amount: plan.price, payment_mode: renewPaymentMode });
    }
    // Case 3: Group Member Renew
    else {
      const g = renewTarget.data;
      await supabase.from("membership_groups").update({ plan_id: plan.id, plan_name: plan.name, start_date: start, expiry_date: expiry }).eq("id", g.id);

      // If group size expanded, insert extra members
      if (additionalMembers.length > 0) {
        for (let i = 0; i < additionalMembers.length; i++) {
          const extra = additionalMembers[i];
          if (extra.full_name && extra.phone) {
            let photoUrl = null;
            if (extra.photo) photoUrl = await uploadPhoto(extra.photo);
            await supabase.from("group_members").insert({
              group_id: g.id,
              full_name: extra.full_name,
              phone: extra.phone,
              photo_url: photoUrl,
              is_primary: false,
              whatsapp_opt_in: true,
            });
          }
        }
      }

      await supabase.from("payments").insert({ source_type: "group_renew", group_id: g.id, plan_id: plan.id, plan_name: plan.name, amount: plan.price, payment_mode: renewPaymentMode });
    }

    setRenewTarget(null);
    setSelectedPlanId("");
    setAdditionalMembers([]);
    setRenewPaymentMode("cash");
    setSelectedStartDate(new Date().toISOString().split("T")[0]);
    fetchAll();
  }

  async function saveEdit() {
    if (!editingMember) return;
    if (!/^[A-Za-z ]{2,50}$/.test(editName))  { alert("Invalid name");  return; }
    if (!/^[6-9]\d{9}$/.test(editPhone))       { alert("Invalid phone"); return; }
    let photoUrl = null;
    if (editPhoto) photoUrl = await uploadPhoto(editPhoto);
    const selectedPlan = plans.find((p) => p.id == editPlanId);

    if (editingMember.type === "single") {
      const cur = singleMembers.find((m) => m.id === editingMember.id);
      const updateData = { full_name: editName, phone: editPhone };
      if (photoUrl) updateData.photo_url = photoUrl;
      if (selectedPlan) {
        const curPlan = plans.find((p) => p.id === cur.plan_id);
        const diff    = selectedPlan.price - (curPlan?.price || 0);
        if (diff < 0) { alert("Downgrade not allowed"); return; }
        const expiryObj = new Date(cur.start_date);
        expiryObj.setDate(expiryObj.getDate() + selectedPlan.duration_days);
        updateData.plan_id     = selectedPlan.id;
        updateData.plan_name   = selectedPlan.name;
        updateData.expiry_date = expiryObj.toLocaleDateString("en-CA");
        await supabase.from("members").update(updateData).eq("id", editingMember.id);
        await supabase.from("payments").insert({ source_type: "single_upgrade", member_id: editingMember.id, plan_id: selectedPlan.id, plan_name: selectedPlan.name, amount: Math.max(0, diff), payment_mode: "cash" });
      } else {
        await supabase.from("members").update(updateData).eq("id", editingMember.id);
      }
    } else {
      const updateData = { full_name: editName, phone: editPhone };
      if (photoUrl) updateData.photo_url = photoUrl;
      await supabase.from("group_members").update(updateData).eq("id", editingMember.id);
      if (selectedPlan) {
        const group   = groupMembers.find((g) => g.group_members.some((m) => m.id === editingMember.id));
        const curPlan = plans.find((p) => p.id === group?.plan_id);
        const diff    = selectedPlan.price - (curPlan?.price || 0);
        if (diff < 0) { alert("Downgrade not allowed"); return; }
        const expiryObj = new Date(group.start_date);
        expiryObj.setDate(expiryObj.getDate() + selectedPlan.duration_days);
        await supabase.from("membership_groups").update({ plan_id: selectedPlan.id, plan_name: selectedPlan.name, expiry_date: expiryObj.toLocaleDateString("en-CA") }).eq("id", group.id);
        await supabase.from("payments").insert({ source_type: "group_upgrade", group_id: group.id, plan_id: selectedPlan.id, plan_name: selectedPlan.name, amount: diff, payment_mode: "cash" });
      }
    }
    setEditingMember(null); setEditPhoto(null); setEditPlanId("");
    fetchAll();
  }

  async function saveGroupEdit() {
    for (const m of editingGroup.group_members) {
      let photoUrl = m.photo_url;
      if (m.newPhoto) photoUrl = await uploadPhoto(m.newPhoto);
      await supabase.from("group_members").update({ full_name: m.full_name, phone: m.phone, photo_url: photoUrl }).eq("id", m.id);
    }
    setEditingGroup(null); fetchAll();
  }

  async function deleteSingle(id) {
    if (!confirm("Delete this member?")) return;
    await supabase.from("members").delete().eq("id", id); fetchAll();
  }

  async function deleteGroup(id) {
    if (!confirm("Delete this group?")) return;
    await supabase.from("membership_groups").delete().eq("id", id); fetchAll();
  }

  /* ══════════════════════════ RENDER ══════════════════════════ */
  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-800">Members</h1>
          <p className="text-slate-400 text-sm mt-1">
            {singleMembers.length} single · {groupMembers.length} groups
          </p>
        </div>
        <button onClick={fetchAll}
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:scale-105 transition shadow">
          ↻ Refresh
        </button>
      </div>

      {/* SEARCH + STATUS FILTER */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[220px] relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border pl-10 pr-4 py-3 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-4 py-3 rounded-2xl shadow-sm text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All Status</option>
          <option value="active">✅ Active</option>
          <option value="due">⚠️ Due</option>
          <option value="expired">❌ Expired</option>
        </select>
      </div>

      {/* TABS */}
      <div className="flex gap-1.5 mb-8 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 w-fit">
        {[
          { key: "all",    label: "All Members" },
          { key: "single", label: "👤 Single" },
          { key: "group",  label: "👥 Group" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── SINGLE MEMBERS ── */}
      {(activeTab === "all" || activeTab === "single") && (
        <section className="mb-12">
          {activeTab === "all" && (
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-bold text-slate-700">Single Members</h2>
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full font-semibold">{filteredSingles.length}</span>
            </div>
          )}
          {filteredSingles.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-5xl mb-3">👤</div>
              <div className="text-sm">No single members found</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSingles.map((m) => {
                const status = getStatus(m.expiry_date);
                const style  = STATUS_STYLES[status];
                return (
                  <div key={m.id} className="relative rounded-3xl p-6 bg-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                    <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${style.bar}`} />
                    <div className="cursor-pointer pl-2" onClick={() => setSelectedMember({ ...m, type: "single" })}>
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}&background=6366f1&color=fff`}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100"
                          alt={m.full_name}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 truncate">{m.full_name}</h3>
                          <p className="text-xs text-slate-400">{m.phone}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs rounded-full font-bold text-white shrink-0 ${style.badge}`}>
                          {status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 rounded-2xl p-3 mb-4">
                        <div><div className="text-slate-400">Plan</div><div className="font-semibold text-slate-700 mt-0.5 truncate">{m.plan_name}</div></div>
                        <div><div className="text-slate-400">Start</div><div className="font-medium text-slate-700 mt-0.5">{m.start_date}</div></div>
                        <div className="col-span-2"><div className="text-slate-400">Expires</div><div className="font-medium text-slate-700 mt-0.5">{m.expiry_date}</div></div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 pl-2">
                      <button onClick={() => openPayHistory(m.id, m.full_name, "single")}
                        className="flex-1 bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold hover:bg-slate-700 transition">
                        💳 History
                      </button>
                      {(status === "expired" || status === "due") && (
                        <button onClick={() => { setRenewTarget({ type: "single", data: m }); setSelectedPlanId(""); setAdditionalMembers([]); }}
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">
                          🔄 Renew
                        </button>
                      )}
                      <button onClick={() => { setEditingMember({ id: m.id, type: "single" }); setEditName(m.full_name); setEditPhone(m.phone); }}
                        className="flex-1 bg-amber-500 text-white py-2 rounded-xl text-xs font-semibold hover:bg-amber-600 transition">
                        ✏️ Edit
                      </button>
                      <button onClick={() => deleteSingle(m.id)}
                        className="flex-1 bg-rose-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-rose-700 transition">
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── GROUP MEMBERS ── */}
      {(activeTab === "all" || activeTab === "group") && (
        <section>
          {activeTab === "all" && (
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-bold text-slate-700">Group Members</h2>
              <span className="text-xs bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full font-semibold">{filteredGroups.length}</span>
            </div>
          )}
          {filteredGroups.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-5xl mb-3">👥</div>
              <div className="text-sm">No group members found</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGroups.map((g) => {
                const status = getStatus(g.expiry_date);
                const style  = STATUS_STYLES[status];
                return (
                  <div key={g.id} className="relative rounded-3xl p-6 bg-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                    <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${style.bar}`} />
                    <div className="pl-2">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-800">{g.plan_name}</h3>
                          <p className="text-xs text-slate-400">{g.group_members?.length} members</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs rounded-full font-bold text-white shrink-0 ${style.badge}`}>
                          {status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 mb-3">
                        {g.group_members.map((m) => (
                          <div key={m.id} className="flex items-center gap-3 bg-slate-50 rounded-2xl px-3 py-2">
                            <img
                              src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}&background=8b5cf6&color=fff`}
                              className="w-8 h-8 rounded-full object-cover"
                              alt={m.full_name}
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-slate-700 truncate">
                                {m.is_primary && <span className="mr-1">👑</span>}{m.full_name}
                              </div>
                              <div className="text-xs text-slate-400">{m.phone}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 rounded-2xl p-3 mb-4">
                        <div><div className="text-slate-400">Start</div><div className="font-medium text-slate-700 mt-0.5">{g.start_date}</div></div>
                        <div><div className="text-slate-400">Expires</div><div className="font-medium text-slate-700 mt-0.5">{g.expiry_date}</div></div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 pl-2">
                      <button onClick={() => openPayHistory(g.id, g.plan_name, "group")}
                        className="flex-1 bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold hover:bg-slate-700 transition">
                        💳 History
                      </button>
                      {(status === "expired" || status === "due") && (
                        <button onClick={() => { setRenewTarget({ type: "group", data: g }); setSelectedPlanId(""); setAdditionalMembers([]); }}
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">
                          🔄 Renew
                        </button>
                      )}
                      <button onClick={() => setEditingGroup(g)}
                        className="flex-1 bg-amber-500 text-white py-2 rounded-xl text-xs font-semibold hover:bg-amber-600 transition">
                        ✏️ Edit
                      </button>
                      <button onClick={() => deleteGroup(g.id)}
                        className="flex-1 bg-rose-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-rose-700 transition">
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ══════════════ MODALS ══════════════ */}

      {/* Payment History */}
      {payHistoryMember && (
        <Modal>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center px-8 py-6 border-b">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">💳 Payment History</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{payHistoryMember.name}</p>
                </div>
                <button onClick={() => { setPayHistoryMember(null); setPayHistory([]); }}
                  className="text-slate-400 hover:text-slate-700 text-2xl leading-none">✕</button>
              </div>
              <div className="overflow-y-auto flex-1 px-8 py-6">
                {payHistoryLoading ? (
                  <p className="text-center text-slate-400 animate-pulse py-8">Loading…</p>
                ) : payHistory.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">No payment records found.</p>
                ) : (
                  <div className="space-y-3">
                    {payHistory.map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-4">
                        <div>
                          <div className="text-sm font-semibold text-slate-700">{SOURCE_LABELS[p.source_type] || p.source_type}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{p.plan_name || "—"}</div>
                          <div className="text-xs text-slate-400">{fmtDate(p.created_at)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-800 text-lg">₹{Number(p.amount || 0).toLocaleString("en-IN")}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{MODE_ICONS[p.payment_mode]} {p.payment_mode?.toUpperCase()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {payHistory.length > 0 && (
                <div className="px-8 py-4 border-t flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium">Total Paid</span>
                  <span className="font-extrabold text-xl text-indigo-600">
                    ₹{payHistory.reduce((s, p) => s + Number(p.amount || 0), 0).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Renew Modal */}
      {renewTarget && (
        <Modal>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {renewTarget.type === "group" ? "Renew Group" : "Renew Member"}
                  </h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {renewTarget.type === "group"
                      ? renewTarget.data.group_members?.map((m) => m.full_name).join(", ")
                      : `${renewTarget.data.full_name} (${renewTarget.data.phone})`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setRenewTarget(null);
                    setSelectedPlanId("");
                    setAdditionalMembers([]);
                    setRenewPaymentMode("cash");
                  }}
                  className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={selectedStartDate}
                    onChange={(e) => setSelectedStartDate(e.target.value)}
                    className="border w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Select Plan</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => handleRenewPlanChange(e.target.value)}
                    className="border w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">Select Plan</option>
                    {plans.map((p) => {
                      const type = p.max_members === 1 ? "Single" : p.max_members === 2 ? "Couple" : `Buddy (${p.max_members})`;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} ({type}) – ₹{p.price} / {p.duration_days} days
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Upgrading Notice */}
                {selectedPlanId && plans.find((p) => p.id === selectedPlanId)?.max_members > 1 && renewTarget.type === "single" && (
                  <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium px-4 py-3 rounded-2xl flex items-start gap-2">
                    <span className="text-base">✨</span>
                    <div>
                      Converting <b>{renewTarget.data.full_name}</b> to a <b>{plans.find((p) => p.id === selectedPlanId)?.name}</b> group pack. Please fill the details for the additional member(s) below.
                    </div>
                  </div>
                )}

                {/* Additional Members Input Fields */}
                {additionalMembers.map((extra, idx) => {
                  const memberNum = renewTarget.type === "single" ? idx + 2 : (renewTarget.data.group_members?.length || 1) + idx + 1;
                  return (
                    <div key={idx} className="border border-indigo-100 bg-indigo-50/40 p-4 rounded-2xl space-y-3">
                      <div className="text-xs font-bold text-indigo-700 uppercase flex items-center gap-1.5">
                        <span>👤</span>
                        <span>Member {memberNum} Details</span>
                      </div>
                      <input
                        placeholder="Full Name"
                        value={extra.full_name}
                        onChange={(e) => {
                          const updated = [...additionalMembers];
                          updated[idx] = { ...updated[idx], full_name: e.target.value };
                          setAdditionalMembers(updated);
                        }}
                        className="border bg-white px-3 py-2 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <input
                        placeholder="10-digit Phone Number"
                        value={extra.phone}
                        onChange={(e) => {
                          const updated = [...additionalMembers];
                          updated[idx] = { ...updated[idx], phone: e.target.value };
                          setAdditionalMembers(updated);
                        }}
                        className="border bg-white px-3 py-2 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Photo (Optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const updated = [...additionalMembers];
                            updated[idx] = { ...updated[idx], photo: e.target.files[0] };
                            setAdditionalMembers(updated);
                          }}
                          className="text-xs text-slate-500"
                        />
                      </div>
                    </div>
                  );
                })}

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Payment Mode</label>
                  <select
                    value={renewPaymentMode}
                    onChange={(e) => setRenewPaymentMode(e.target.value)}
                    className="border w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="upi">📱 UPI</option>
                    <option value="card">💳 Card</option>
                  </select>
                </div>

                {selectedPlanId && (
                  <div className="bg-indigo-50 text-indigo-700 text-sm font-bold px-4 py-3 rounded-2xl text-center">
                    Amount: ₹{plans.find((p) => p.id === selectedPlanId)?.price?.toLocaleString("en-IN")}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRenewConfirm}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                >
                  Confirm & Renew
                </button>
                <button
                  onClick={() => {
                    setRenewTarget(null);
                    setSelectedPlanId("");
                    setAdditionalMembers([]);
                    setRenewPaymentMode("cash");
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Single */}
      {editingMember && (
        <Modal>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl w-96 shadow-2xl">
              <h3 className="font-bold text-slate-800 text-lg mb-6">Edit Member</h3>
              <input className="border w-full px-3 py-2.5 mb-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full Name" />
              <input className="border w-full px-3 py-2.5 mb-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" />
              <input type="file" onChange={(e) => setEditPhoto(e.target.files[0])}
                className="border w-full px-3 py-2.5 mb-3 rounded-xl text-sm" />
              <select value={editPlanId} onChange={(e) => setEditPlanId(e.target.value)}
                className="border w-full px-3 py-2.5 mb-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="">Keep Current Plan</option>
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name} – ₹{p.price}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={saveEdit}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">Save</button>
                <button onClick={() => setEditingMember(null)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition">Cancel</button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Group */}
      {editingGroup && (
        <Modal>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Edit Group Members</h2>
              {editingGroup.group_members.map((m, i) => (
                <div key={m.id} className="border border-slate-100 bg-slate-50 p-4 rounded-2xl mb-4">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-3">
                    {m.is_primary ? "👑 Primary Member" : `Member ${i + 1}`}
                  </div>
                  <input
                    value={m.full_name || ""}
                    onChange={(e) => {
                      const updated = [...editingGroup.group_members];
                      updated[i] = { ...updated[i], full_name: e.target.value };
                      setEditingGroup({ ...editingGroup, group_members: updated });
                    }}
                    className="border px-3 py-2 rounded-xl w-full mb-2 text-sm"
                    placeholder="Full Name"
                  />
                  <input
                    value={m.phone || ""}
                    onChange={(e) => {
                      const updated = [...editingGroup.group_members];
                      updated[i] = { ...updated[i], phone: e.target.value };
                      setEditingGroup({ ...editingGroup, group_members: updated });
                    }}
                    className="border px-3 py-2 rounded-xl w-full mb-2 text-sm"
                    placeholder="Phone"
                  />
                  <input
                    type="file"
                    onChange={(e) => {
                      const updated = [...editingGroup.group_members];
                      updated[i] = { ...updated[i], newPhoto: e.target.files[0] };
                      setEditingGroup({ ...editingGroup, group_members: updated });
                    }}
                    className="text-xs"
                  />
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <button onClick={saveGroupEdit}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">Save Changes</button>
                <button onClick={() => setEditingGroup(null)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition">Cancel</button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Member Detail */}
      {selectedMember && (
        <Modal>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Member Details</h2>
                <button onClick={() => setSelectedMember(null)} className="text-slate-400 hover:text-slate-700 text-2xl">✕</button>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={selectedMember.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.full_name)}&background=6366f1&color=fff`}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-100"
                  alt={selectedMember.full_name}
                />
                <div>
                  <div className="text-xl font-bold text-slate-800">{selectedMember.full_name}</div>
                  <div className="text-slate-400 text-sm">{selectedMember.phone}</div>
                </div>
              </div>
              <div className="space-y-3 bg-slate-50 rounded-2xl p-5 mb-6 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Plan</span><span className="font-semibold text-slate-700">{selectedMember.plan_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Start Date</span><span className="font-medium">{selectedMember.start_date}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Expiry Date</span><span className="font-medium">{selectedMember.expiry_date}</span></div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${STATUS_STYLES[getStatus(selectedMember.expiry_date)].badge}`}>
                    {getStatus(selectedMember.expiry_date).toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setSelectedMember(null); openPayHistory(selectedMember.id, selectedMember.full_name, "single"); }}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
              >
                💳 View Payment History
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}