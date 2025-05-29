import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

const supabase = createClient(
  "https://ijrnwpgsqsxzqdemtknz.supabase.co",
  "public-anon-key",
);

type KpiType = {
  id: number;
  name: string;
  value: number;
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KpiType[]>([]);

  useEffect(() => {
    const fetchKPIs = async () => {
      const { data, error } = await supabase
        .from("kpi_metrics")
        .select("*")
        .limit(5);
      if (!error) setKpis(data ?? []);
    };
    fetchKPIs();
  }, []);

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-6">KPI Dashboard</h1>
      {kpis.length === 0 ? (
        <p>No KPIs available yet.</p>
      ) : (
        <ul className="space-y-2">
          {kpis.map((kpi: any) => (
            <li key={kpi.id} className="bg-zinc-800 p-4 rounded">
              <strong>{kpi.name}</strong>: {kpi.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
