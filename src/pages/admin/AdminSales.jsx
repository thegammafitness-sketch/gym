// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";

// export default function AdminSales() {
//   const [todaySales, setTodaySales] = useState(0);
//   const [monthSales, setMonthSales] = useState(0);
//   const [yearSales, setYearSales] = useState(0);

//   useEffect(() => {
//     fetchSales();
//   }, []);

//   async function fetchSales() {
//     const now = new Date();

//     const todayStr = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       now.getDate()
//     ).toISOString();

//     const monthStart = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       1
//     ).toISOString();

//     const yearStart = new Date(
//       now.getFullYear(),
//       0,
//       1
//     ).toISOString();

//     const { data: todayData } = await supabase
//       .from("payments")
//       .select("amount")
//       .gte("created_at", todayStr);

//     const { data: monthData } = await supabase
//       .from("payments")
//       .select("amount")
//       .gte("created_at", monthStart);

//     const { data: yearData } = await supabase
//       .from("payments")
//       .select("amount")
//       .gte("created_at", yearStart);

//     setTodaySales(
//       todayData?.reduce((sum, p) => sum + p.amount, 0) || 0
//     );
//     setMonthSales(
//       monthData?.reduce((sum, p) => sum + p.amount, 0) || 0
//     );
//     setYearSales(
//       yearData?.reduce((sum, p) => sum + p.amount, 0) || 0
//     );
//   }

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-6">Sales</h1>

//       <div className="grid md:grid-cols-3 gap-6">
//         <div className="border rounded p-6">
//           <h2 className="font-semibold">Today</h2>
//           <p className="text-2xl font-bold">₹ {todaySales}</p>
//         </div>

//         <div className="border rounded p-6">
//           <h2 className="font-semibold">This Month</h2>
//           <p className="text-2xl font-bold">₹ {monthSales}</p>
//         </div>

//         <div className="border rounded p-6">
//           <h2 className="font-semibold">This Year</h2>
//           <p className="text-2xl font-bold">₹ {yearSales}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// export default function AdminSales() {
//   const [mode, setMode] = useState("today"); // today | month | year | custom
//   const [month, setMonth] = useState(new Date().getMonth());
//   const [year, setYear] = useState(new Date().getFullYear());

//   const [summary, setSummary] = useState({
//     today: 0,
//     month: 0,
//     year: 0,
//   });

//   const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     loadSummary();
//   }, []);

//   useEffect(() => {
//     loadChart();
//   }, [mode, month, year]);

//   /* ================= SUMMARY ================= */

//   async function loadSummary() {
//     const now = new Date();

//     const todayStart = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       now.getDate()
//     ).toISOString();

//     const monthStart = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       1
//     ).toISOString();

//     const yearStart = new Date(
//       now.getFullYear(),
//       0,
//       1
//     ).toISOString();

//     const { data: today } = await supabase
//       .from("payments")
//       .select("amount")
//       .gte("created_at", todayStart);

//     const { data: month } = await supabase
//       .from("payments")
//       .select("amount")
//       .gte("created_at", monthStart);

//     const { data: year } = await supabase
//       .from("payments")
//       .select("amount")
//       .gte("created_at", yearStart);

//     setSummary({
//       today: sum(today),
//       month: sum(month),
//       year: sum(year),
//     });
//   }

//   function sum(data) {
//     return data?.reduce((s, i) => s + i.amount, 0) || 0;
//   }

//   /* ================= CHART ================= */

//   async function loadChart() {
//     let start, end;

//     if (mode === "today") {
//       start = new Date(year, month, new Date().getDate());
//       end = new Date(year, month, new Date().getDate() + 1);
//     }

//     if (mode === "month" || mode === "custom") {
//       start = new Date(year, month, 1);
//       end = new Date(year, month + 1, 1);
//     }

//     if (mode === "year") {
//       start = new Date(year, 0, 1);
//       end = new Date(year + 1, 0, 1);
//     }

//     const { data } = await supabase
//       .from("payments")
//       .select("amount, created_at")
//       .gte("created_at", start.toISOString())
//       .lt("created_at", end.toISOString());

//     if (mode === "year") {
//       // group by month
//       const map = {};
//       data?.forEach((p) => {
//         const m = new Date(p.created_at).getMonth();
//         map[m] = (map[m] || 0) + p.amount;
//       });

//       setChartData(
//         Object.keys(map).map((m) => ({
//           label: new Date(0, m).toLocaleString("default", {
//             month: "short",
//           }),
//           amount: map[m],
//         }))
//       );
//     } else {
//       // group by day
//       const map = {};
//       data?.forEach((p) => {
//         const d = new Date(p.created_at).getDate();
//         map[d] = (map[d] || 0) + p.amount;
//       });

//       setChartData(
//         Object.keys(map).map((d) => ({
//           label: d,
//           amount: map[d],
//         }))
//       );
//     }
//   }

//   /* ================= UI ================= */

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-6">Sales Dashboard</h1>

//       {/* SUMMARY */}
//       <div className="grid md:grid-cols-3 gap-4 mb-8">
//         <Card title="Today" value={summary.today} />
//         <Card title="This Month" value={summary.month} />
//         <Card title="This Year" value={summary.year} />
//       </div>

//       {/* FILTERS */}
//       <div className="flex flex-wrap gap-3 mb-6">
//         <FilterBtn active={mode === "today"} onClick={() => setMode("today")}>
//           Today
//         </FilterBtn>
//         <FilterBtn active={mode === "month"} onClick={() => setMode("month")}>
//           This Month
//         </FilterBtn>
//         <FilterBtn active={mode === "year"} onClick={() => setMode("year")}>
//           This Year
//         </FilterBtn>
//         <FilterBtn active={mode === "custom"} onClick={() => setMode("custom")}>
//           Custom
//         </FilterBtn>

//         {mode === "custom" && (
//           <>
//             <select value={month} onChange={(e) => setMonth(+e.target.value)}>
//               {[...Array(12)].map((_, i) => (
//                 <option key={i} value={i}>
//                   {new Date(0, i).toLocaleString("default", { month: "long" })}
//                 </option>
//               ))}
//             </select>

//             <select value={year} onChange={(e) => setYear(+e.target.value)}>
//               {[2024, 2025, 2026].map((y) => (
//                 <option key={y} value={y}>{y}</option>
//               ))}
//             </select>
//           </>
//         )}
//       </div>

//       {/* GRAPH */}
//       <div className="bg-white border rounded-xl p-4 h-80">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={chartData}>
//             <XAxis dataKey="label" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="amount" fill="#6366f1" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

// /* ================= SMALL COMPONENTS ================= */

// function Card({ title, value }) {
//   return (
//     <div className="border rounded-xl p-6">
//       <div className="text-sm text-gray-500">{title}</div>
//       <div className="text-2xl font-bold">₹ {value}</div>
//     </div>
//   );
// }

// function FilterBtn({ active, children, ...props }) {
//   return (
//     <button
//       {...props}
//       className={`px-4 py-2 rounded ${
//         active ? "bg-indigo-600 text-white" : "bg-gray-200"
//       }`}
//     >
//       {children}
//     </button>
//   );
// }

import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AdminSales() {
  const [mode, setMode] = useState("today");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const [summary, setSummary] = useState({
    today: 0,
    month: 0,
    year: 0,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    loadChart();
  }, [mode, month, year]);

  async function loadSummary() {
    const now = new Date();

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).toISOString();

    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();

    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

    const { data: today } = await supabase
      .from("payments")
      .select("amount")
      .gte("created_at", todayStart);

    const { data: month } = await supabase
      .from("payments")
      .select("amount")
      .gte("created_at", monthStart);

    const { data: year } = await supabase
      .from("payments")
      .select("amount")
      .gte("created_at", yearStart);

    setSummary({
      today: sum(today),
      month: sum(month),
      year: sum(year),
    });
  }

  function sum(data) {
    return data?.reduce((s, i) => s + i.amount, 0) || 0;
  }

  async function loadChart() {
    let start, end;

    if (mode === "today") {
      start = new Date(year, month, new Date().getDate());
      end = new Date(year, month, new Date().getDate() + 1);
    }

    if (mode === "month" || mode === "custom") {
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 1);
    }

    if (mode === "year") {
      start = new Date(year, 0, 1);
      end = new Date(year + 1, 0, 1);
    }

    const { data } = await supabase
      .from("payments")
      .select("amount, created_at")
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString());

    if (mode === "year") {
      const map = {};
      data?.forEach((p) => {
        const m = new Date(p.created_at).getMonth();
        map[m] = (map[m] || 0) + p.amount;
      });

      setChartData(
        Object.keys(map).map((m) => ({
          label: new Date(0, m).toLocaleString("default", {
            month: "short",
          }),
          amount: map[m],
        })),
      );
    } else {
      const map = {};
      data?.forEach((p) => {
        const d = new Date(p.created_at).getDate();
        map[d] = (map[d] || 0) + p.amount;
      });

      setChartData(
        Object.keys(map).map((d) => ({
          label: d,
          amount: map[d],
        })),
      );
    }
  }

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 animate-fadeIn">
      <h1 className="text-4xl font-bold mb-10">Sales Dashboard</h1>

      {/* SUMMARY CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <SummaryCard
          title="Today"
          value={summary.today}
          gradient="from-emerald-500 to-green-600"
        />
        <SummaryCard
          title="This Month"
          value={summary.month}
          gradient="from-indigo-500 to-purple-600"
        />
        <SummaryCard
          title="This Year"
          value={summary.year}
          gradient="from-rose-500 to-pink-600"
        />
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-8">
        <FilterBtn active={mode === "today"} onClick={() => setMode("today")}>
          Today
        </FilterBtn>
        <FilterBtn active={mode === "month"} onClick={() => setMode("month")}>
          This Month
        </FilterBtn>
        <FilterBtn active={mode === "year"} onClick={() => setMode("year")}>
          This Year
        </FilterBtn>
        <FilterBtn active={mode === "custom"} onClick={() => setMode("custom")}>
          Custom
        </FilterBtn>

        {mode === "custom" && (
          <>
            <select
              className="px-4 py-2 rounded-xl border"
              value={month}
              onChange={(e) => setMonth(+e.target.value)}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 rounded-xl border"
              value={year}
              onChange={(e) => setYear(+e.target.value)}
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* CHART */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
              }}
            />

            <Area
              type="monotone"
              dataKey="amount"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* SUMMARY CARD */
function SummaryCard({ title, value, gradient }) {
  return (
    <div
      className={`p-8 rounded-3xl text-white bg-gradient-to-br ${gradient} shadow-xl hover:scale-105 transition`}
    >
      <div className="text-sm opacity-80">{title}</div>
      <div className="text-4xl font-bold mt-2">₹ {value}</div>
    </div>
  );
}

/* FILTER BUTTON */
function FilterBtn({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-5 py-2 rounded-xl font-medium transition ${
        active
          ? "bg-indigo-600 text-white shadow"
          : "bg-gray-200 hover:bg-gray-300"
      }`}
    >
      {children}
    </button>
  );
}
