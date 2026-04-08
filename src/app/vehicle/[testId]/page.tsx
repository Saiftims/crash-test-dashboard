"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CrashTest, MEASUREMENT_GROUPS } from "@/lib/types";
import { loadData, getRadarData } from "@/lib/data";
import Link from "next/link";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function VehicleDetailPage() {
  const params = useParams();
  const testId = decodeURIComponent(params.testId as string);
  const [test, setTest] = useState<CrashTest | null>(null);
  const [activeTab, setActiveTab] = useState("driver");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then((data) => {
      const found = data.find((t) => t.test_id === testId);
      setTest(found || null);
      if (found) setActiveTab(Object.keys(found.positions)[0] || "driver");
      setLoading(false);
    });
  }, [testId]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!test) return <div className="text-center py-20 text-gray-400">Test not found: {testId}</div>;

  const pos = test.positions[activeTab];
  const radarData = getRadarData(test.positions, activeTab);

  return (
    <div>
      <Link href="/" className="text-blue-400 text-sm hover:underline mb-4 inline-block">Back to Search</Link>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{test.year} {test.manufacturer} {test.model}</h1>
            <p className="text-gray-400 text-sm mt-1">Test ID: <span className="font-mono">{test.test_id}</span></p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              test.test_type.includes("Side") ? "bg-purple-500/20 text-purple-300" :
              test.test_type.includes("Small") ? "bg-green-500/20 text-green-300" :
              test.test_type.includes("Moderate") ? "bg-orange-500/20 text-orange-300" :
              test.test_type.includes("NCAP") ? "bg-blue-500/20 text-blue-300" :
              "bg-gray-500/20 text-gray-300"
            }`}>{test.test_type}</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">{test.source_format}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {Object.keys(test.positions).map((posName) => (
          <button
            key={posName}
            onClick={() => setActiveTab(posName)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === posName ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {posName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {pos?.atd?.type && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-1">ATD (Crash Dummy)</h3>
          <p className="font-medium">{pos.atd.type} <span className="text-gray-500 text-sm">({pos.atd.source})</span></p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {radarData.length > 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Clearance Profile</h3>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="measurement" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fill: "#6B7280", fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "#1F2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Radar name="Clearance (mm)" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Key Measurements</h3>
          {pos?.measurements && Object.keys(pos.measurements).length > 0 ? (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
              {Object.entries(pos.measurements).map(([key, m]) => (
                <div key={key} className="flex justify-between items-center py-1.5 border-b border-gray-800 last:border-0">
                  <div>
                    <span className="text-xs font-mono text-gray-500 mr-2">{m.code}</span>
                    <span className="text-sm">{m.description}</span>
                  </div>
                  <span className="font-mono text-sm font-medium tabular-nums">
                    {m.value} <span className="text-gray-500 text-xs">{m.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No measurements for this position.</p>
          )}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">All Measurements by Category</h3>
        {pos?.measurements && Object.entries(MEASUREMENT_GROUPS).map(([group, keys]) => {
          const groupMeasurements = keys.filter((k) => pos.measurements![k]);
          if (groupMeasurements.length === 0) return null;
          return (
            <div key={group} className="mb-4">
              <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">{group}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {groupMeasurements.map((k) => {
                  const m = pos.measurements![k];
                  return (
                    <div key={k} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400">{m.description}</div>
                      <div className="text-lg font-mono font-medium mt-1">
                        {m.value}<span className="text-xs text-gray-500 ml-1">{m.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
