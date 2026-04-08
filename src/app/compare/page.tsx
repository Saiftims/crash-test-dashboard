"use client";

import { useEffect, useState, useMemo } from "react";
import { CrashTest, KEY_MEASUREMENTS } from "@/lib/types";
import { loadData } from "@/lib/data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

export default function ComparePage() {
  const [data, setData] = useState<CrashTest[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CrashTest[]>([]);
  const [posType, setPosType] = useState("driver");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then((d) => { setData(d); setLoading(false); });
  }, []);

  const suggestions = useMemo(() => {
    if (!search.trim() || search.length < 2) return [];
    const q = search.toLowerCase();
    return data.filter((t) =>
      `${t.year} ${t.manufacturer} ${t.model} ${t.test_id}`.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [data, search]);

  const addVehicle = (test: CrashTest) => {
    if (selected.length < 4 && !selected.find((s) => s.test_id === test.test_id)) {
      setSelected([...selected, test]);
    }
    setSearch("");
  };

  const chartData = useMemo(() => {
    return KEY_MEASUREMENTS.map((key) => {
      const entry: Record<string, string | number> = { measurement: key.replace(/_mm|_degrees/, "").toUpperCase() };
      selected.forEach((t, i) => {
        const pos = t.positions[posType];
        const m = pos?.measurements?.[key];
        entry[`v${i}`] = m?.value ?? 0;
      });
      return entry;
    }).filter((e) => selected.some((_, i) => (e[`v${i}`] as number) > 0));
  }, [selected, posType]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Compare Vehicles</h1>
      <p className="text-gray-400 text-sm mb-6">Select up to 4 vehicles to compare side-by-side</p>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search to add a vehicle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {suggestions.map((t) => (
              <button
                key={t.test_id}
                onClick={() => addVehicle(t)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-700 transition border-b border-gray-700/50 last:border-0"
              >
                <span className="font-medium">{t.year} {t.manufacturer} {t.model}</span>
                <span className="text-gray-400 ml-2 text-xs">{t.test_type} | {t.test_id}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selected.map((t, i) => (
            <span key={t.test_id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: COLORS[i] + "20", color: COLORS[i] }}>
              {t.year} {t.manufacturer} {t.model}
              <button onClick={() => setSelected(selected.filter((s) => s.test_id !== t.test_id))} className="hover:text-white">x</button>
            </span>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex gap-2 mb-6">
          {["driver", "passenger", "rear_passenger"].map((p) => (
            <button
              key={p}
              onClick={() => setPosType(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                posType === p ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      )}

      {selected.length >= 2 && chartData.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Clearance Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="measurement" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1F2937", border: "1px solid #374151", borderRadius: 8 }} />
              <Legend />
              {selected.map((t, i) => (
                <Bar key={t.test_id} dataKey={`v${i}`} name={`${t.year} ${t.manufacturer} ${t.model}`} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {selected.length >= 2 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Measurement Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                <tr>
                  <th className="px-4 py-2 text-left">Measurement</th>
                  {selected.map((t) => (
                    <th key={t.test_id} className="px-4 py-2 text-right">{t.year} {t.manufacturer} {t.model}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {chartData.map((row) => (
                  <tr key={row.measurement as string} className="hover:bg-gray-800/30">
                    <td className="px-4 py-2 font-mono text-gray-300">{row.measurement as string}</td>
                    {selected.map((_, i) => (
                      <td key={i} className="px-4 py-2 text-right font-mono tabular-nums">
                        {(row[`v${i}`] as number) || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected.length < 2 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">Add at least 2 vehicles to compare</p>
          <p className="text-sm mt-1">Use the search bar above to find vehicles</p>
        </div>
      )}
    </div>
  );
}
