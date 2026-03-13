import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export default function AdminMembers() {
  const [singleMembers, setSingleMembers] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [filter, setFilter] = useState("all");

  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [renewTarget, setRenewTarget] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPlanId, setEditPlanId] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const { data: singles } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: groups } = await supabase
      .from("membership_groups")
      .select(
        `
        id,
        plan_id,
        plan_name,
        start_date,
        expiry_date,
        group_members (
          id,
          full_name,
          phone,
          photo_url,
          is_primary
        )
      `,
      )
      .order("created_at", { ascending: false });

    const { data: plans } = await supabase.from("plans").select("*");

    setSingleMembers(singles || []);
    setGroupMembers(groups || []);
    setPlans(plans || []);
  }

  function getStatus(expiry) {
    const today = new Date();
    const exp = new Date(expiry);
    const diff = Math.ceil((exp - today) / 86400000);
    if (diff < 0) return "expired";
    if (diff <= 2) return "due";
    return "active";
  }

  function applyFilter(list) {
    if (filter === "all") return list;
    return list.filter((i) => getStatus(i.expiry_date) === filter);
  }
  async function uploadPhoto(file) {
    const name = `${crypto.randomUUID()}-${file.name}`;

    await supabase.storage.from("member-photos").upload(name, file);

    return supabase.storage.from("member-photos").getPublicUrl(name).data
      .publicUrl;
  }
  async function handleRenewConfirm() {
    const plan = plans.find((p) => p.id === selectedPlanId);

    if (!plan) {
      alert("Select a plan");
      return;
    }

    const startDateObj = new Date(selectedStartDate);

    const expiryDateObj = new Date(startDateObj);
    expiryDateObj.setDate(expiryDateObj.getDate() + plan.duration_days);

    const start = startDateObj.toLocaleDateString("en-CA");
    const expiryDate = expiryDateObj.toLocaleDateString("en-CA");

    /* SINGLE MEMBER RENEW */
    if (renewTarget.type === "single") {
      const m = renewTarget.data;

      await supabase
        .from("members")
        .update({
          plan_id: plan.id,
          plan_name: plan.name,
          start_date: start,
          expiry_date: expiryDate,
        })
        .eq("id", m.id);

      await supabase.from("payments").insert({
        source_type: "single_renew",
        member_id: m.id,
        plan_id: plan.id,
        plan_name: plan.name,
        amount: plan.price,
        payment_mode: "cash",
      });
    }

    /* GROUP RENEW */
    if (renewTarget.type === "group") {
      const g = renewTarget.data;

      await supabase
        .from("membership_groups")
        .update({
          plan_id: plan.id,
          plan_name: plan.name,
          start_date: start,
          expiry_date: expiryDate,
        })
        .eq("id", g.id);

      await supabase.from("payments").insert({
        source_type: "group_renew",
        group_id: g.id,
        plan_id: plan.id,
        plan_name: plan.name,
        amount: plan.price,
        payment_mode: "cash",
      });
    }

    setRenewTarget(null);
    setSelectedPlanId("");
    setSelectedStartDate(new Date().toISOString().split("T")[0]);

    fetchAll();
  }

  async function saveEdit() {
    if (!editingMember) return;

    if (!/^[A-Za-z ]{2,50}$/.test(editName)) {
      alert("Invalid name");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(editPhone)) {
      alert("Invalid phone");
      return;
    }

    let photoUrl = null;

    if (editPhoto) {
      photoUrl = await uploadPhoto(editPhoto);
    }

    const selectedPlan = plans.find((p) => p.id == editPlanId);

    let upgradeAmount = 0;
    let expiryDate = null;

    /* ================= SINGLE MEMBER ================= */

    if (editingMember.type === "single") {
      const currentMember = singleMembers.find(
        (m) => m.id === editingMember.id,
      );

      const updateData = {
        full_name: editName,
        phone: editPhone,
      };

      if (photoUrl) updateData.photo_url = photoUrl;

      if (selectedPlan) {
        const currentPlan = plans.find((p) => p.id === currentMember.plan_id);

        const currentPrice = currentPlan ? currentPlan.price : 0;
        const newPrice = selectedPlan.price;

        upgradeAmount = newPrice - currentPrice;

        if (upgradeAmount < 0) {
          alert("Downgrade not allowed");
          return;
        }

        const startDateObj = new Date(currentMember.start_date);

        const expiryDateObj = new Date(startDateObj);

        expiryDateObj.setDate(
          expiryDateObj.getDate() + selectedPlan.duration_days,
        );
        expiryDate = expiryDateObj.toLocaleDateString("en-CA");

        updateData.plan_id = selectedPlan.id;
        updateData.plan_name = selectedPlan.name;
        updateData.expiry_date = expiryDate;
      }

      await supabase
        .from("members")
        .update(updateData)
        .eq("id", editingMember.id);

      if (selectedPlan) {
        await supabase.from("payments").insert({
          source_type: "single_upgrade",
          member_id: editingMember.id,
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          amount: upgradeAmount,
          payment_mode: "cash",
        });
      }
    } else {
      /* ================= GROUP MEMBER ================= */
      const updateData = {
        full_name: editName,
        phone: editPhone,
      };

      if (photoUrl) updateData.photo_url = photoUrl;

      await supabase
        .from("group_members")
        .update(updateData)
        .eq("id", editingMember.id);

      if (selectedPlan) {
        const group = groupMembers.find((g) =>
          g.group_members.some((m) => m.id === editingMember.id),
        );

        const currentPlan = plans.find((p) => p.id === group.plan_id);

        const currentPrice = currentPlan ? currentPlan.price : 0;
        const newPrice = selectedPlan.price;

        upgradeAmount = newPrice - currentPrice;

        if (upgradeAmount < 0) {
          alert("Downgrade not allowed");
          return;
        }

        const startDateObj = new Date(group.start_date);

        const expiryDateObj = new Date(startDateObj);

        expiryDateObj.setDate(
          expiryDateObj.getDate() + selectedPlan.duration_days,
        );

        expiryDate = expiryDateObj.toLocaleDateString("en-CA");

        await supabase
          .from("membership_groups")
          .update({
            plan_id: selectedPlan.id,
            plan_name: selectedPlan.name,
            expiry_date: expiryDate,
          })
          .eq("id", group.id);

        await supabase.from("payments").insert({
          source_type: "group_upgrade",
          group_id: group.id,
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          amount: upgradeAmount,
          payment_mode: "cash",
        });
      }
    }

    setEditingMember(null);
    setEditPhoto(null);
    setEditPlanId("");

    fetchAll();
  }
  async function saveGroupEdit() {
    for (const m of editingGroup.group_members) {
      let photoUrl = m.photo_url;

      if (m.newPhoto) {
        photoUrl = await uploadPhoto(m.newPhoto);
      }

      await supabase
        .from("group_members")
        .update({
          full_name: m.full_name,
          phone: m.phone,
          photo_url: photoUrl,
        })
        .eq("id", m.id);
    }

    setEditingGroup(null);
    fetchAll();
  }
  async function deleteSingle(id) {
    if (!confirm("Delete this member?")) return;
    await supabase.from("members").delete().eq("id", id);
    fetchAll();
  }

  async function deleteGroup(id) {
    if (!confirm("Delete this group?")) return;
    await supabase.from("membership_groups").delete().eq("id", id);
    fetchAll();
  }

  return (
    <div className="p-8 animate-fadeIn">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Members</h1>

        <select
          className="border px-4 py-2 rounded-xl shadow-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="due">Due</option>
          <option value="expired">Expired</option>
        </select>
      </div>
      {/* ================= SINGLE MEMBERS ================= */}
      <h2 className="text-xl font-semibold mb-6">Single Members</h2>
      <div className="grid md:grid-cols-3 gap-8 mb-14">
        {applyFilter(singleMembers).map((m) => {
          const status = getStatus(m.expiry_date);

          const accent =
            status === "active"
              ? "from-emerald-500 to-green-600"
              : status === "due"
                ? "from-amber-500 to-orange-600"
                : "from-rose-500 to-red-600";

          return (
            <div
              key={m.id}
              className="relative rounded-3xl p-6 bg-white shadow-xl hover:shadow-2xl transition overflow-hidden"
            >
              {/* Accent Strip */}
              <div
                className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${accent}`}
              />

              {/* Clickable Area */}
              <div
                className="cursor-pointer"
                onClick={() => setSelectedMember({ ...m, type: "single" })}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={
                      m.photo_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        m.full_name,
                      )}`
                    }
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{m.full_name}</h3>
                    <p className="text-sm text-slate-500">{m.phone}</p>
                  </div>
                </div>

                <div className="text-sm text-slate-600 mb-3">
                  <div>Plan: {m.plan_name}</div>
                  <div>Start: {m.start_date}</div>
                  <div>Expiry: {m.expiry_date}</div>
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-full font-semibold text-white
                  ${
                    status === "active"
                      ? "bg-emerald-600"
                      : status === "due"
                        ? "bg-amber-500"
                        : "bg-rose-600"
                  }`}
                >
                  {status.toUpperCase()}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-4">
                {(status === "expired" || status === "due") && (
                  <button
                    onClick={() => setRenewTarget({ type: "single", data: m })}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-xl"
                  >
                    Renew
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditingMember({ id: m.id, type: "single" });
                    setEditName(m.full_name);
                    setEditPhone(m.phone);
                  }}
                  className="flex-1 bg-yellow-500 text-white py-2 rounded-xl"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteSingle(m.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* ================= GROUP MEMBERS ================= */}
      {/* ================= GROUP MEMBERS ================= */}
      <h2 className="text-xl font-semibold mb-6">Group Members</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {applyFilter(groupMembers).map((g) => {
          const status = getStatus(g.expiry_date);

          const accent =
            status === "active"
              ? "from-emerald-500 to-green-600"
              : status === "due"
                ? "from-amber-500 to-orange-600"
                : "from-rose-500 to-red-600";

          return (
            <div
              key={g.id}
              className="relative rounded-3xl p-6 bg-white shadow-xl hover:shadow-2xl transition overflow-hidden"
            >
              {/* Accent Strip */}
              <div
                className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${accent}`}
              />

              <h3 className="font-semibold mb-3 text-lg">{g.plan_name}</h3>

              {/* PLAN INFO */}
              <div className="text-sm text-slate-600 mb-4">
                <div>Start: {g.start_date}</div>
                <div>Expiry: {g.expiry_date}</div>
              </div>

              {/* GROUP MEMBERS */}
              <div className="space-y-3 mb-4">
                {g.group_members.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setEditingMember({ id: m.id, type: "group" });
                      setEditName(m.full_name);
                      setEditPhone(m.phone);
                    }}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <img
                      src={
                        m.photo_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          m.full_name,
                        )}`
                      }
                      className="w-10 h-10 rounded-full"
                    />

                    <span className="text-sm">
                      {m.is_primary && "👑 "}
                      {m.full_name}
                    </span>
                  </div>
                ))}
              </div>

              <span
                className={`px-3 py-1 text-xs rounded-full font-semibold text-white
    ${
      status === "active"
        ? "bg-emerald-600"
        : status === "due"
          ? "bg-amber-500"
          : "bg-rose-600"
    }`}
              >
                {status.toUpperCase()}
              </span>

              {/* BUTTONS */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditingGroup(g)}
                  className="flex-1 bg-yellow-500 text-white py-2 rounded-xl"
                >
                  Edit Group
                </button>

                <button
                  onClick={() => deleteGroup(g.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* ================= EDIT MODAL ================= */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96 shadow-xl">
            <h3 className="font-semibold mb-4">Edit Member</h3>

            <input
              className="border w-full px-3 py-2 mb-3 rounded-lg"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <input
              className="border w-full px-3 py-2 mb-3 rounded-lg"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />

            <input
              type="file"
              onChange={(e) => setEditPhoto(e.target.files[0])}
              className="border w-full px-3 py-2 mb-3 rounded-lg"
            />

            <select
              value={editPlanId}
              onChange={(e) => setEditPlanId(e.target.value)}
              className="border w-full px-3 py-2 mb-4 rounded-lg"
            >
              <option value="">Keep Current Plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} – ₹{p.price}
                </option>
              ))}
            </select>

            <button
              onClick={saveEdit}
              className="w-full bg-indigo-600 text-white py-2 rounded-xl"
            >
              Save
            </button>
          </div>
        </div>
      )}
      {/* ================= RENEW MODAL ================= */}
      {renewTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              Select Plan for Renewal
            </h3>

            <input
              type="date"
              value={selectedStartDate}
              onChange={(e) => setSelectedStartDate(e.target.value)}
              className="border w-full px-3 py-2 mb-4 rounded-lg"
            />
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="border w-full px-3 py-2 mb-4 rounded-lg"
            >
              <option value="">Select Plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} – ₹{p.price}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleRenewConfirm}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-xl"
              >
                Confirm
              </button>

              <button
                onClick={() => {
                  setRenewTarget(null);
                  setSelectedPlanId("");
                }}
                className="flex-1 bg-gray-300 py-2 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ==========group edit modal ================= */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-[500px] shadow-2xl">
            <h2 className="text-xl font-semibold mb-6">Edit Group Members</h2>

            {editingGroup.group_members.map((m, i) => (
              <div key={m.id} className="border p-4 rounded-xl mb-4">
                <div className="font-medium mb-2">
                  {m.is_primary ? "Primary Member" : `Member ${i + 1}`}
                </div>

                <input
                  defaultValue={m.full_name}
                  onChange={(e) => (m.full_name = e.target.value)}
                  className="border px-3 py-2 rounded w-full mb-2"
                />

                <input
                  defaultValue={m.phone}
                  onChange={(e) => (m.phone = e.target.value)}
                  className="border px-3 py-2 rounded w-full mb-2"
                />

                <input
                  type="file"
                  onChange={(e) => (m.newPhoto = e.target.files[0])}
                />
              </div>
            ))}

            <button
              onClick={saveGroupEdit}
              className="w-full bg-indigo-600 text-white py-2 rounded-xl"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
