"use client";

import { useEffect, useState, useMemo } from "react";
import { CrashTest } from "@/lib/types";
import { loadData, searchTests, getUniqueValues } from "@/lib/data";
import Link from "next/link";

export default function HomePage() {
  const [data, setData] = useState<CrashTest[]>([]);
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [testType, setTestType] = useState("");
  const [format, setFormat] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then((d) => { setData(d); setLoading(false); });
  }, []);

  const results = useMemo(
    () => searchTests(data, query, { year, make, testType, format }).slice(0, 100),
    [data, query, year, make, testType, format]
  );

  const years = useMemo(() => getUniqueValues(data, "year"), [data]);
  const makes = useMemo(() => getUniqueValues(data, "manufacturer"), [data]);
  const testTypes = useMemo(() => getUniqueValues(data, "test_type"), [data]);
  const formats = useMemo(() => getUniqueValues(data, "source_format"), [data]);

  if (loading) return <div className="text-center py-20 text-gray-400 text-lg">Loading data...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Vehicle Crash Test Data</h1>
        <p className="text-gray-400 text-sm">{data.length} tests across {makes.length} manufacturers ({years[0]}–{years[years.length - 1]})</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <input
          type="text"
          placeholder="Search vehicle or test ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="col-span-1 md:col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />
        <select value={make} onChange={(e) => setMake(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm">
          <option value="">All Makes</option>
          {makes.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={testType} onChange={(e) => setTestType(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm">
          <option value="">All Test Types</option>
          {testTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm">
          <option value="">All Years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="text-sm text-gray-400 mb-3">{results.length}{results.length === 100 ? "+" : ""} results</div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Test ID</th>
              <th className="px-4 py-3 text-left">Year</th>
              <th className="px-4 py-3 text-left">Manufacturer</th>
              <th className="px-4 py-3 text-left">Model</th>
              <th className="px-4 py-3 text-left">Test Type</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Positions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {results.map((t) => (
              <tr key={t.test_id + t.source_format} className="hover:bg-gray-900/50 transition">
                <td className="px-4 py-3">
                  <Link href={`/vehicle/${encodeURIComponent(t.test_id)}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">
                    {t.test_id}
                  </Link>
                </td>
                <td className="px-4 py-3">{t.year}</td>
                <td className="px-4 py-3 font-medium">{t.manufacturer}</td>
                <td className="px-4 py-3">{t.model}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    t.test_type.includes("Side") ? "bg-purple-500/20 text-purple-300" :
                    t.test_type.includes("Small") ? "bg-green-500/20 text-green-300" :
                    t.test_type.includes("Moderate") ? "bg-orange-500/20 text-orange-300" :
                    t.test_type.includes("NCAP") ? "bg-blue-500/20 text-blue-300" :
                    "bg-gray-500/20 text-gray-300"
                  }`}>
                    {t.test_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{t.source_format}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{Object.keys(t.positions).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
