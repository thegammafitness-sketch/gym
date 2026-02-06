import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { motion } from "framer-motion";

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | due | expired
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setMembers(data || []);
    setLoading(false);
  }

  /* ===== STATUS LOGIC ===== */
  const today = new Date().toISOString().split("T")[0];
  const dueLimit = new Date();
  dueLimit.setDate(dueLimit.getDate() + 2);
  const dueStr = dueLimit.toISOString().split("T")[0];

  function getStatus(member) {
    if (member.expiry_date < today) return "expired";
    if (member.expiry_date <= dueStr) return "due";
    return "active";
  }

  /* ===== FILTERED DATA ===== */
  const filteredMembers = members.filter((m) => {
    const status = getStatus(m);

    if (filter !== "all" && status !== filter) return false;

    if (search) {
      return (
        m.full_name.toLowerCase().includes(search.toLowerCase()) ||
        m.phone.includes(search)
      );
    }
    return true;
  });

  /* ===== DELETE ===== */
  async function deleteMember(id) {
    if (!confirm("Delete this member?")) return;

    await supabase.from("members").delete().eq("id", id);
    fetchMembers();
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <h1 className="text-3xl font-bold mb-6">Members</h1>

      {/* SEARCH + FILTER */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          placeholder="Search name / phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border w-64"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="due">Due</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white/70 backdrop-blur border rounded-2xl shadow">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Expiry</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredMembers.map((m) => {
              const status = getStatus(m);

              return (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="p-4 font-medium">{m.full_name}</td>
                  <td className="p-4">*****{m.phone.slice(-5)}</td>
                  <td className="p-4">{m.plan_name}</td>
                  <td className="p-4">{m.expiry_date}</td>

                  <td className="p-4">
                    <StatusBadge status={status} />
                  </td>

                  <td className="p-4 flex gap-2">
                    {(status === "expired" || status === "due") && (
                      <button className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm">
                        Renew
                      </button>
                    )}

                    <button
                      onClick={() => deleteMember(m.id)}
                      className="px-3 py-1 rounded-lg bg-rose-600 text-white text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {!loading && filteredMembers.length === 0 && (
          <p className="p-6 text-center text-gray-500">No members found</p>
        )}
      </div>
    </div>
  );
}

/* ===== STATUS BADGE ===== */
function StatusBadge({ status }) {
  const styles = {
    active: "bg-emerald-100 text-emerald-700",
    due: "bg-amber-100 text-amber-700",
    expired: "bg-rose-100 text-rose-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}
