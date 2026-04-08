import { CrashTest } from "./types";

let cachedData: CrashTest[] | null = null;

export async function loadData(): Promise<CrashTest[]> {
  if (cachedData) return cachedData;
  const res = await fetch("/data/measurements.json");
  cachedData = await res.json();
  return cachedData!;
}

export function getUniqueValues(data: CrashTest[], field: keyof CrashTest): string[] {
  const vals = new Set<string>();
  data.forEach((t) => {
    const v = String(t[field] || "");
    if (v && v !== "Unknown") vals.add(v);
  });
  return Array.from(vals).sort();
}

export function searchTests(
  data: CrashTest[],
  query: string,
  filters: { year?: string; make?: string; testType?: string; format?: string }
): CrashTest[] {
  const q = query.toLowerCase().trim();
  return data.filter((t) => {
    if (q) {
      const searchable = `${t.year} ${t.manufacturer} ${t.model} ${t.test_id}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    if (filters.year && String(t.year) !== filters.year) return false;
    if (filters.make && t.manufacturer !== filters.make) return false;
    if (filters.testType && t.test_type !== filters.testType) return false;
    if (filters.format && t.source_format !== filters.format) return false;
    return true;
  });
}

export function getRadarData(positions: Record<string, { measurements?: Record<string, { value: number; description: string }> }>, posType: string) {
  const pos = positions[posType];
  if (!pos?.measurements) return [];
  const keys = ["hh_mm", "cd_mm", "kdl_mm", "kdr_mm", "hr_mm", "sk_mm", "kk_mm", "aa_mm", "hs_mm"];
  return keys
    .filter((k) => pos.measurements![k])
    .map((k) => ({
      measurement: pos.measurements![k].description,
      value: pos.measurements![k].value,
    }));
}
