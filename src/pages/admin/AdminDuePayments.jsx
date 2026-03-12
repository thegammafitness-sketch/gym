import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export default function AdminDuePayments() {

  const [dues, setDues] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("");
  const [total, setTotal] = useState("");
  const [paid, setPaid] = useState("");

  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchDues();
  }, []);

  async function fetchDues() {

    const { data } = await supabase
      .from("due_payments")
      .select("*")
      .order("created_at", { ascending: false });

    setDues(data || []);
  }

  async function addDue() {

    const due = Number(total) - Number(paid);

    await supabase.from("due_payments").insert({
      member_name: name,
      phone: phone,
      plan_name: plan,
      total_amount: Number(total),
      paid_amount: Number(paid),
      due_amount: due
    });

    setShowAdd(false);

    setName("");
    setPhone("");
    setPlan("");
    setTotal("");
    setPaid("");

    fetchDues();
  }

  async function payDue() {

    const due = selected;

    await supabase.from("payments").insert({
      member_id: due.member_id,
      plan_name: due.plan_name,
      amount: Number(amount),
      source_type: "due_payment"
    });

    const newDue = due.due_amount - Number(amount);

    if (newDue <= 0) {

      await supabase
        .from("due_payments")
        .delete()
        .eq("id", due.id);

    } else {

      await supabase
        .from("due_payments")
        .update({
          paid_amount: due.paid_amount + Number(amount),
          due_amount: newDue
        })
        .eq("id", due.id);

    }

    setSelected(null);
    setAmount("");

    fetchDues();
  }

  return (

    <div className="p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Due Payments
        </h1>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:scale-105 transition"
        >
          + Add Due
        </button>

      </div>


      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Phone</th>
              {/* <th className="p-3 text-left">Plan</th> */}
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Paid</th>
              <th className="p-3 text-left">Due</th>
              <th className="p-3 text-left">Action</th>

            </tr>

          </thead>

          <tbody>

            {dues.map((d) => (

              <tr key={d.id} className="border-t">

                <td className="p-3">{d.member_name}</td>

                <td className="p-3">{d.phone}</td>

                {/* <td className="p-3">{d.plan_name}</td> */}

                <td className="p-3">
                  ₹ {d.total_amount}
                </td>

                <td className="p-3">
                  ₹ {d.paid_amount}
                </td>

                <td className="p-3 text-red-600 font-semibold">
                  ₹ {d.due_amount}
                </td>

                <td className="p-3">

                  <button
                    onClick={() => setSelected(d)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition"
                  >
                    Pay
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* ADD DUE MODAL */}
      {showAdd && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">

            <h2 className="text-xl font-bold mb-4">
              Add Due Payment
            </h2>

            <input
              placeholder="Member Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border w-full px-3 py-2 rounded mb-3"
            />

            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border w-full px-3 py-2 rounded mb-3"
            />

            {/* <input
              placeholder="Plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="border w-full px-3 py-2 rounded mb-3"
            /> */}

            <input
              type="number"
              placeholder="Total Amount"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="border w-full px-3 py-2 rounded mb-3"
            />

            <input
              type="number"
              placeholder="Paid Amount"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
              className="border w-full px-3 py-2 rounded mb-4"
            />

            <button
              onClick={addDue}
              className="bg-indigo-600 text-white w-full py-2 rounded"
            >
              Save
            </button>

          </div>

        </div>

      )}


      {/* PAY MODAL */}
      {selected && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">

            <h2 className="text-xl font-bold mb-4">
              Add Payment
            </h2>

            <div className="mb-3 font-semibold">
              {selected.member_name}
            </div>

            <div className="mb-3 text-red-600">
              Due: ₹ {selected.due_amount}
            </div>

            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border w-full px-3 py-2 rounded mb-4"
            />

            <button
              onClick={payDue}
              className="bg-green-600 text-white w-full py-2 rounded"
            >
              Confirm Payment
            </button>

          </div>

        </div>

      )}

    </div>

  );
}
