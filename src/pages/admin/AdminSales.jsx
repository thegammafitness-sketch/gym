import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export default function AdminSales() {
  const [todaySales, setTodaySales] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [yearSales, setYearSales] = useState(0);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    const now = new Date();

    const todayStr = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toISOString();

    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();

    const yearStart = new Date(
      now.getFullYear(),
      0,
      1
    ).toISOString();

    const { data: todayData } = await supabase
      .from("payments")
      .select("amount")
      .gte("created_at", todayStr);

    const { data: monthData } = await supabase
      .from("payments")
      .select("amount")
      .gte("created_at", monthStart);

    const { data: yearData } = await supabase
      .from("payments")
      .select("amount")
      .gte("created_at", yearStart);

    setTodaySales(
      todayData?.reduce((sum, p) => sum + p.amount, 0) || 0
    );
    setMonthSales(
      monthData?.reduce((sum, p) => sum + p.amount, 0) || 0
    );
    setYearSales(
      yearData?.reduce((sum, p) => sum + p.amount, 0) || 0
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Sales</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="border rounded p-6">
          <h2 className="font-semibold">Today</h2>
          <p className="text-2xl font-bold">₹ {todaySales}</p>
        </div>

        <div className="border rounded p-6">
          <h2 className="font-semibold">This Month</h2>
          <p className="text-2xl font-bold">₹ {monthSales}</p>
        </div>

        <div className="border rounded p-6">
          <h2 className="font-semibold">This Year</h2>
          <p className="text-2xl font-bold">₹ {yearSales}</p>
        </div>
      </div>
    </div>
  );
}
