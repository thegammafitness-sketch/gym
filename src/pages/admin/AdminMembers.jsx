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

  async function handleRenewConfirm() {
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) return alert("Select a plan");

    const startDateObj = new Date();
    startDateObj.setHours(0, 0, 0, 0);

    const expiryDateObj = new Date(startDateObj);
    expiryDateObj.setDate(expiryDateObj.getDate() + plan.duration_days);

    const start = startDateObj.toLocaleDateString("en-CA");
    const expiryDate = expiryDateObj.toLocaleDateString("en-CA");

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

      await supabase.from("attendance").delete().eq("member_id", m.id);
    }

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
    fetchAll();
  }

  async function saveEdit() {
    if (!editingMember) return;

    if (editingMember.type === "single") {
      await supabase
        .from("members")
        .update({ full_name: editName, phone: editPhone })
        .eq("id", editingMember.id);
    } else {
      await supabase
        .from("group_members")
        .update({ full_name: editName, phone: editPhone })
        .eq("id", editingMember.id);
    }

    setEditingMember(null);
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

              <div
                className="cursor-pointer"
                onClick={() => setSelectedMember({ ...g, type: "group" })}
              >
                <h3 className="font-semibold mb-3 text-lg">{g.plan_name}</h3>

                {/* GROUP MEMBERS PREVIEW */}
                <div className="space-y-3 mb-4">
                  {g.group_members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
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
              </div>

              {(status === "expired" || status === "due") && (
                <button
                  onClick={() => setRenewTarget({ type: "group", data: g })}
                  className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl"
                >
                  Renew Group
                </button>
              )}

              <button
                onClick={() => deleteGroup(g.id)}
                className="mt-3 w-full bg-red-600 text-white py-2 rounded-xl"
              >
                Delete Group
              </button>
            </div>
          );
        })}
      </div>

      {/* ================= DETAILS MODAL ================= */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[600px] rounded-3xl p-10 shadow-2xl animate-scaleIn relative">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-black"
            >
              ✕
            </button>

            {/* SINGLE MEMBER DETAILS */}
            {selectedMember.type === "single" && (
              <>
                <div className="flex flex-col items-center text-center mb-8">
                  <img
                    src={
                      selectedMember.photo_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        selectedMember.full_name,
                      )}&size=200`
                    }
                    className="w-28 h-28 rounded-full mb-4"
                  />
                  <h2 className="text-2xl font-bold">
                    {selectedMember.full_name}
                  </h2>
                  <p className="text-slate-500">{selectedMember.phone}</p>
                </div>

                <div className="space-y-4 text-sm text-slate-700">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Plan</span>
                    <span>{selectedMember.plan_name}</span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Start Date</span>
                    <span>{selectedMember.start_date}</span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Expiry Date</span>
                    <span>{selectedMember.expiry_date}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Status</span>
                    <span
                      className={`font-semibold
                ${
                  getStatus(selectedMember.expiry_date) === "active"
                    ? "text-emerald-600"
                    : getStatus(selectedMember.expiry_date) === "due"
                      ? "text-amber-500"
                      : "text-rose-600"
                }`}
                    >
                      {getStatus(selectedMember.expiry_date).toUpperCase()}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* GROUP DETAILS */}
            {selectedMember.type === "group" && (
              <>
                <h2 className="text-2xl font-bold mb-6 text-center">
                  {selectedMember.plan_name}
                </h2>

                <div className="space-y-4 text-sm text-slate-700 mb-6">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Start Date</span>
                    <span>{selectedMember.start_date}</span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Expiry Date</span>
                    <span>{selectedMember.expiry_date}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Status</span>
                    <span
                      className={`font-semibold
                ${
                  getStatus(selectedMember.expiry_date) === "active"
                    ? "text-emerald-600"
                    : getStatus(selectedMember.expiry_date) === "due"
                      ? "text-amber-500"
                      : "text-rose-600"
                }`}
                    >
                      {getStatus(selectedMember.expiry_date).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedMember.group_members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
                    >
                      <img
                        src={
                          m.photo_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            m.full_name,
                          )}`
                        }
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="font-medium">
                          {m.is_primary && "👑 "}
                          {m.full_name}
                        </div>
                        <div className="text-sm text-slate-500">{m.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-96 shadow-xl">
            <h3 className="font-semibold mb-4">Edit Member</h3>

            <input
              className="border w-full px-3 py-2 mb-3 rounded-lg"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <input
              className="border w-full px-3 py-2 mb-4 rounded-lg"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />

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
    </div>
  );
}
