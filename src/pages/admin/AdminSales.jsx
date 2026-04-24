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

// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";

// export default function AdminSales() {
//   const [mode, setMode] = useState("today");
//   const [month, setMonth] = useState(new Date().getMonth());
//   const [year, setYear] = useState(new Date().getFullYear());
//   const [paymentMode, setPaymentMode] = useState("all");
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
//   }, [mode, month, year, paymentMode]);

//   async function loadSummary() {
//     const now = new Date();

//     const todayStart = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       now.getDate(),
//     ).toISOString();

//     const monthStart = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       1,
//     ).toISOString();

//     const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

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

//     let query = supabase
//       .from("payments")
//       .select("amount, created_at, payment_mode")
//       .gte("created_at", start.toISOString())
//       .lt("created_at", end.toISOString());

//     if (paymentMode !== "all") {
//       query = query.eq("payment_mode", paymentMode);
//     }

//     const { data } = await query;

//     if (mode === "year") {
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
//         })),
//       );
//     } else {
//       const map = {};
//       data?.forEach((p) => {
//         const d = new Date(p.created_at).getDate();
//         map[d] = (map[d] || 0) + p.amount;
//       });

//       setChartData(
//         Object.keys(map).map((d) => ({
//           label: d,
//           amount: map[d],
//         })),
//       );
//     }
//   }

//   return (
//     <div className="p-10 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 animate-fadeIn">
//       <h1 className="text-4xl font-bold mb-10">Sales Dashboard</h1>

//       {/* SUMMARY CARDS */}
//       <div className="grid md:grid-cols-3 gap-6 mb-12">
//         <SummaryCard
//           title="Today"
//           value={summary.today}
//           gradient="from-emerald-500 to-green-600"
//         />
//         <SummaryCard
//           title="This Month"
//           value={summary.month}
//           gradient="from-indigo-500 to-purple-600"
//         />
//         <SummaryCard
//           title="This Year"
//           value={summary.year}
//           gradient="from-rose-500 to-pink-600"
//         />
//       </div>

//       {/* FILTERS */}
//       <div className="flex flex-wrap gap-3 mb-8">
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
//             <select
//               className="px-4 py-2 rounded-xl border"
//               value={month}
//               onChange={(e) => setMonth(+e.target.value)}
//             >
//               {[...Array(12)].map((_, i) => (
//                 <option key={i} value={i}>
//                   {new Date(0, i).toLocaleString("default", { month: "long" })}
//                 </option>
//               ))}
//             </select>

//             <select
//               className="px-4 py-2 rounded-xl border"
//               value={year}
//               onChange={(e) => setYear(+e.target.value)}
//             >
//               {[2024, 2025, 2026].map((y) => (
//                 <option key={y} value={y}>
//                   {y}
//                 </option>
//               ))}
//             </select>
//             <select
//               value={paymentMode}
//               onChange={(e) => setPaymentMode(e.target.value)}
//               className="px-4 py-2 rounded-xl border"
//             >
//               <option value="all">All Payments</option>
//               <option value="cash">Cash</option>
//               <option value="upi">UPI</option>
//               <option value="card">Card</option>
//             </select>
//           </>
//         )}
//       </div>

//       {/* CHART */}
//       <div className="bg-white rounded-3xl shadow-2xl p-8 h-[420px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={chartData}>
//             <defs>
//               <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
//                 <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
//               </linearGradient>
//             </defs>

//             <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//             <XAxis dataKey="label" stroke="#64748b" />
//             <YAxis stroke="#64748b" />
//             <Tooltip
//               contentStyle={{
//                 borderRadius: "16px",
//                 border: "none",
//                 boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
//               }}
//             />

//             <Area
//               type="monotone"
//               dataKey="amount"
//               stroke="#6366f1"
//               strokeWidth={3}
//               fillOpacity={1}
//               fill="url(#colorRevenue)"
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

// /* SUMMARY CARD */
// function SummaryCard({ title, value, gradient }) {
//   return (
//     <div
//       className={`p-8 rounded-3xl text-white bg-gradient-to-br ${gradient} shadow-xl hover:scale-105 transition`}
//     >
//       <div className="text-sm opacity-80">{title}</div>
//       <div className="text-4xl font-bold mt-2">₹ {value}</div>
//     </div>
//   );
// }

// /* FILTER BUTTON */
// function FilterBtn({ active, children, ...props }) {
//   return (
//     <button
//       {...props}
//       className={`px-5 py-2 rounded-xl font-medium transition ${
//         active
//           ? "bg-indigo-600 text-white shadow"
//           : "bg-gray-200 hover:bg-gray-300"
//       }`}
//     >
//       {children}
//     </button>
//   );
// }


// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip,
//   ResponsiveContainer, CartesianGrid,
// } from "recharts";

// export default function AdminSales() {
//   const [mode, setMode] = useState("today");
//   const [month, setMonth] = useState(new Date().getMonth());
//   const [year, setYear] = useState(new Date().getFullYear());
//   const [paymentMode, setPaymentMode] = useState("all");
//   const [summary, setSummary] = useState({ today: 0, month: 0, year: 0 });
//   const [chartData, setChartData] = useState([]);

//   useEffect(() => { loadSummary(); }, []);
//   useEffect(() => { loadChart(); }, [mode, month, year, paymentMode]);

//   // ✅ Parse timestamp as LOCAL (ignore timezone), e.g. "2026-04-01 00:55:48" → April 1
//   function parseLocal(dateStr) {
//     // Supabase returns "2026-04-01T00:55:48.150283" — parse as local date
//     const s = dateStr.replace("T", " ").replace(/\.\d+.*$/, "");
//     // "2026-04-01 00:55:48"
//     const [datePart] = s.split(" ");
//     const [y, m, d] = datePart.split("-").map(Number);
//     return { year: y, month: m - 1, day: d }; // month is 0-indexed
//   }

//   // ✅ Build a local midnight ISO string for Supabase range queries
//   function localMidnight(y, m, d = 1) {
//     const pad = (n) => String(n).padStart(2, "0");
//     // Send as a plain timestamp string with no timezone — Supabase treats it as-is
//     return `${y}-${pad(m + 1)}-${pad(d)}T00:00:00.000`;
//   }

//   async function loadSummary() {
//     const now = new Date();
//     const y = now.getFullYear();
//     const m = now.getMonth();
//     const d = now.getDate();

//     const todayStart = localMidnight(y, m, d);
//     const monthStart = localMidnight(y, m, 1);
//     const yearStart  = localMidnight(y, 0, 1);

//     const [{ data: todayData }, { data: monthData }, { data: yearData }] =
//       await Promise.all([
//         supabase.from("payments").select("amount").gte("created_at", todayStart),
//         supabase.from("payments").select("amount").gte("created_at", monthStart),
//         supabase.from("payments").select("amount").gte("created_at", yearStart),
//       ]);

//     setSummary({
//       today: sum(todayData),
//       month: sum(monthData),
//       year:  sum(yearData),
//     });
//   }

//   function sum(data) {
//     return data?.reduce((s, i) => s + i.amount, 0) || 0;
//   }

//   async function loadChart() {
//     const now = new Date();
//     let startISO, endISO;

//     if (mode === "today") {
//       startISO = localMidnight(now.getFullYear(), now.getMonth(), now.getDate());
//       endISO   = localMidnight(now.getFullYear(), now.getMonth(), now.getDate() + 1);
//     } else if (mode === "month" || mode === "custom") {
//       startISO = localMidnight(year, month, 1);
//       endISO   = localMidnight(year, month + 1, 1);
//     } else if (mode === "year") {
//       startISO = localMidnight(year, 0, 1);
//       endISO   = localMidnight(year + 1, 0, 1);
//     }

//     let query = supabase
//       .from("payments")
//       .select("amount, created_at, payment_mode")
//       .gte("created_at", startISO)
//       .lt("created_at", endISO);

//     if (paymentMode !== "all") {
//       query = query.eq("payment_mode", paymentMode);
//     }

//     const { data } = await query;

//     if (mode === "year") {
//       const map = Array.from({ length: 12 }, (_, i) => ({ month: i, amount: 0 }));
//       data?.forEach((p) => {
//         const { month: m } = parseLocal(p.created_at);
//         map[m].amount += p.amount;
//       });
//       setChartData(
//         map.map(({ month: m, amount }) => ({
//           label: new Date(0, m).toLocaleString("default", { month: "short" }),
//           amount,
//         }))
//       );
//     } else {
//       const daysInMonth = new Date(year, month + 1, 0).getDate();
//       const map = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, amount: 0 }));
//       data?.forEach((p) => {
//         const { day: d } = parseLocal(p.created_at);
//         if (map[d - 1]) map[d - 1].amount += p.amount;
//       });
//       setChartData(map.map(({ day, amount }) => ({ label: day, amount })));
//     }
//   }

//   return (
//     <div className="p-10 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
//       <h1 className="text-4xl font-bold mb-10">Sales Dashboard</h1>

//       <div className="grid md:grid-cols-3 gap-6 mb-12">
//         <SummaryCard title="Today"      value={summary.today} gradient="from-emerald-500 to-green-600" />
//         <SummaryCard title="This Month" value={summary.month} gradient="from-indigo-500 to-purple-600" />
//         <SummaryCard title="This Year"  value={summary.year}  gradient="from-rose-500 to-pink-600" />
//       </div>

//       <div className="flex flex-wrap gap-3 mb-8">
//         <FilterBtn active={mode === "today"}  onClick={() => setMode("today")}>Today</FilterBtn>
//         <FilterBtn active={mode === "month"}  onClick={() => setMode("month")}>This Month</FilterBtn>
//         <FilterBtn active={mode === "year"}   onClick={() => setMode("year")}>This Year</FilterBtn>
//         <FilterBtn active={mode === "custom"} onClick={() => setMode("custom")}>Custom</FilterBtn>

//         {mode === "custom" && (
//           <>
//             <select className="px-4 py-2 rounded-xl border" value={month}
//               onChange={(e) => setMonth(+e.target.value)}>
//               {[...Array(12)].map((_, i) => (
//                 <option key={i} value={i}>
//                   {new Date(0, i).toLocaleString("default", { month: "long" })}
//                 </option>
//               ))}
//             </select>
//             <select className="px-4 py-2 rounded-xl border" value={year}
//               onChange={(e) => setYear(+e.target.value)}>
//               {[2024, 2025, 2026].map((y) => (
//                 <option key={y} value={y}>{y}</option>
//               ))}
//             </select>
//             <select className="px-4 py-2 rounded-xl border" value={paymentMode}
//               onChange={(e) => setPaymentMode(e.target.value)}>
//               <option value="all">All Payments</option>
//               <option value="cash">Cash</option>
//               <option value="upi">UPI</option>
//               <option value="card">Card</option>
//             </select>
//           </>
//         )}
//       </div>

//       <div className="bg-white rounded-3xl shadow-2xl p-8 h-[420px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={chartData}>
//             <defs>
//               <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.8} />
//                 <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//             <XAxis dataKey="label" stroke="#64748b" />
//             <YAxis stroke="#64748b" />
//             <Tooltip contentStyle={{
//               borderRadius: "16px", border: "none",
//               boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
//             }} />
//             <Area type="monotone" dataKey="amount" stroke="#6366f1"
//               strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

// function SummaryCard({ title, value, gradient }) {
//   return (
//     <div className={`p-8 rounded-3xl text-white bg-gradient-to-br ${gradient} shadow-xl hover:scale-105 transition`}>
//       <div className="text-sm opacity-80">{title}</div>
//       <div className="text-4xl font-bold mt-2">₹ {value.toLocaleString("en-IN")}</div>
//     </div>
//   );
// }

// function FilterBtn({ active, children, ...props }) {
//   return (
//     <button {...props}
//       className={`px-5 py-2 rounded-xl font-medium transition ${
//         active ? "bg-indigo-600 text-white shadow" : "bg-gray-200 hover:bg-gray-300"
//       }`}>
//       {children}
//     </button>
//   );
// }

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../supabase";

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function fmt(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SOURCE_LABELS = {
  single_new:     { label: "New Member",      color: "bg-emerald-100 text-emerald-700" },
  single_renew:   { label: "Renewal",          color: "bg-blue-100 text-blue-700" },
  single_upgrade: { label: "Upgrade",          color: "bg-violet-100 text-violet-700" },
  group_new:      { label: "New Group",        color: "bg-emerald-100 text-emerald-700" },
  group_renew:    { label: "Group Renewal",    color: "bg-blue-100 text-blue-700" },
  group_upgrade:  { label: "Group Upgrade",    color: "bg-violet-100 text-violet-700" },
  due_payment:    { label: "Due Payment",      color: "bg-amber-100 text-amber-700" },
};

const MODE_ICONS = { cash: "💵", upi: "📱", card: "💳" };

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export default function AdminSales({ salesPin }) {
  const [payments, setPayments]     = useState([]);
  const [members, setMembers]       = useState({});   // id → name map
  const [groups, setGroups]         = useState({});   // id → plan_name map
  const [loading, setLoading]       = useState(true);

  // Filter state
  const [mode, setMode]             = useState("month"); // day | month | year | custom
  const [selectedDay, setSelectedDay]   = useState(today());
  const [selectedMonth, setSelectedMonth] = useState(thisYM());
  const [selectedYear, setSelectedYear]   = useState(String(new Date().getFullYear()));
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo]     = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);

    const [{ data: pays }, { data: mems }, { data: grps }] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("members").select("id, full_name, phone"),
      supabase.from("membership_groups").select("id, plan_name"),
    ]);

    const memMap = {};
    (mems || []).forEach((m) => { memMap[m.id] = m; });
    const grpMap = {};
    (grps || []).forEach((g) => { grpMap[g.id] = g; });

    setMemMap(memMap);
    setPayments(pays || []);
    setMembers(memMap);
    setGroups(grpMap);
    setLoading(false);
  }

  // Dummy setter workaround for closure
  const [, setMemMap] = useState({});

  /* ── Filter logic ── */
  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const d = new Date(p.created_at);

      // Date filter
      if (mode === "day") {
        if (toDateStr(d) !== selectedDay) return false;
      } else if (mode === "month") {
        if (toYM(d) !== selectedMonth) return false;
      } else if (mode === "year") {
        if (String(d.getFullYear()) !== selectedYear) return false;
      } else if (mode === "custom") {
        if (customFrom && toDateStr(d) < customFrom) return false;
        if (customTo   && toDateStr(d) > customTo)   return false;
      }

      // Source filter
      if (sourceFilter !== "all" && p.source_type !== sourceFilter) return false;

      // Mode filter
      if (modeFilter !== "all" && p.payment_mode !== modeFilter) return false;

      return true;
    });
  }, [payments, mode, selectedDay, selectedMonth, selectedYear, customFrom, customTo, sourceFilter, modeFilter]);

  const total = filtered.reduce((s, p) => s + Number(p.amount || 0), 0);

  /* ── Summary cards: today / this month / this year ── */
  const todayStr  = today();
  const thisYMStr = thisYM();
  const thisYear  = String(new Date().getFullYear());

  const todayTotal = payments
    .filter((p) => toDateStr(new Date(p.created_at)) === todayStr)
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  const monthTotal = payments
    .filter((p) => toYM(new Date(p.created_at)) === thisYMStr)
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  const yearTotal = payments
    .filter((p) => String(new Date(p.created_at).getFullYear()) === thisYear)
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  /* ── Group filtered by day for day-view breakdown ── */
  const bySource = useMemo(() => {
    const map = {};
    filtered.forEach((p) => {
      map[p.source_type] = (map[p.source_type] || 0) + Number(p.amount || 0);
    });
    return map;
  }, [filtered]);

  /* ── Years available ── */
  const years = useMemo(() => {
    const ys = new Set(payments.map((p) => String(new Date(p.created_at).getFullYear())));
    return Array.from(ys).sort((a, b) => b - a);
  }, [payments]);

  function getName(p) {
    if (p.member_id && members[p.member_id]) {
      return members[p.member_id].full_name;
    }
    if (p.group_id && groups[p.group_id]) {
      return `Group — ${groups[p.group_id].plan_name}`;
    }
    return p.plan_name || "—";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-lg animate-pulse">Loading sales data…</div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 animate-fadeIn">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-800">Sales Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Track every rupee, every transaction</p>
        </div>
        <button
          onClick={fetchAll}
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:scale-105 transition text-sm font-semibold shadow"
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard label="Today's Sales"      value={fmt(todayTotal)} icon="🌅" color="from-amber-400 to-orange-500" />
        <SummaryCard label="This Month's Sales" value={fmt(monthTotal)} icon="📅" color="from-indigo-500 to-blue-600" />
        <SummaryCard label="This Year's Sales"  value={fmt(yearTotal)}  icon="📈" color="from-emerald-500 to-teal-600" />
      </div>

      {/* ── FILTERS ── */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 mb-8">
        <div className="flex flex-wrap gap-3 items-center">

          {/* Mode Tabs */}
          {["day","month","year","custom"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                mode === m
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {m === "day" ? "Day" : m === "month" ? "Month" : m === "year" ? "Year" : "Custom Range"}
            </button>
          ))}

          <div className="w-px h-6 bg-slate-200 mx-1" />

          {/* Date pickers based on mode */}
          {mode === "day" && (
            <input
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          )}
          {mode === "month" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          )}
          {mode === "year" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          {mode === "custom" && (
            <>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                placeholder="From"
                className="border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-slate-400 text-sm">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                placeholder="To"
                className="border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </>
          )}

          <div className="w-px h-6 bg-slate-200 mx-1" />

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="all">All Types</option>
            {Object.entries(SOURCE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Payment Mode Filter */}
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="border px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="all">All Modes</option>
            <option value="cash">💵 Cash</option>
            <option value="upi">📱 UPI</option>
            <option value="card">💳 Card</option>
          </select>
        </div>
      </div>

      {/* ── PERIOD TOTAL + BREAKDOWN ── */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-1 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
          <div className="text-sm font-medium opacity-80 mb-2">Period Total</div>
          <div className="text-4xl font-extrabold">{fmt(total)}</div>
          <div className="text-xs opacity-70 mt-2">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</div>
        </div>

        <div className="md:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-lg p-6">
          <div className="text-sm font-semibold text-slate-500 mb-4">Breakdown by Type</div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(bySource).length === 0 && (
              <p className="text-slate-400 text-sm">No transactions in this period.</p>
            )}
            {Object.entries(bySource).map(([src, amt]) => {
              const meta = SOURCE_LABELS[src] || { label: src, color: "bg-slate-100 text-slate-600" };
              return (
                <div key={src} className={`px-4 py-2 rounded-xl text-sm font-semibold ${meta.color} flex items-center gap-2`}>
                  <span>{meta.label}</span>
                  <span className="font-bold">{fmt(amt)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TRANSACTIONS TABLE ── */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-700">Transactions</h2>
          <span className="text-xs text-slate-400 font-medium">{filtered.length} records</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No transactions found for this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Date & Time</th>
                  <th className="px-6 py-3 text-left">Member / Group</th>
                  <th className="px-6 py-3 text-left">Plan</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Mode</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p) => {
                  const meta = SOURCE_LABELS[p.source_type] || { label: p.source_type, color: "bg-slate-100 text-slate-600" };
                  return (
                    <tr key={p.id} className="hover:bg-indigo-50/40 transition">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700">{fmtDate(p.created_at)}</div>
                        <div className="text-xs text-slate-400">{fmtTime(p.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-medium">{getName(p)}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{p.plan_name || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {MODE_ICONS[p.payment_mode] || ""} {p.payment_mode?.toUpperCase() || "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">{fmt(p.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */
function SummaryCard({ label, value, icon, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-3xl p-6 text-white shadow-xl`}>
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-sm font-medium opacity-80 mb-1">{label}</div>
      <div className="text-3xl font-extrabold">{value}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Date utils
───────────────────────────────────────── */
function today() {
  return new Date().toLocaleDateString("en-CA");
}
function thisYM() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function toDateStr(d) {
  return d.toLocaleDateString("en-CA");
}
function toYM(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}