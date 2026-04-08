export interface Measurement {
  code: string;
  description: string;
  value: number;
  unit: string;
}

export interface ATDInfo {
  type: string;
  model: string;
  source: string;
}

export interface SeatInfo {
  track_total_mm?: number;
  position?: string;
  position_pct?: number;
  source?: string;
}

export interface Position {
  atd?: ATDInfo;
  seat?: SeatInfo;
  measurements?: Record<string, Measurement>;
}

export interface CrashTest {
  test_id: string;
  manufacturer: string;
  model: string;
  year: number | string;
  source_format: string;
  test_type: string;
  positions: Record<string, Position>;
}

export const MEASUREMENT_GROUPS: Record<string, string[]> = {
  "Head & Upper Body": ["hh_mm", "hw_mm", "nr_mm", "hhr_mm", "hr_mm", "hs_mm", "ha_mm", "hb_mm"],
  "Chest & Torso": ["cd_mm", "cs_hub_mm", "cs_seat_mm", "ra_mm", "nd_mm", "cdm_mm", "sch_mm", "scr_mm", "hcm_mm"],
  "Knee & Lower Body": ["kdl_mm", "kdr_mm", "ksl_mm", "ksr_mm", "kk_mm", "aa_mm"],
  "Angles": ["pa_degrees", "sa_degrees", "sk_degrees", "tra_degrees", "nba_degrees", "nas_degrees", "wa_degrees", "swa_degrees", "sca_degrees"],
  "Striker Distances": ["sk_mm", "st_mm", "sh_mm", "shh_mm", "shv_mm", "shl_mm", "cgh_mm", "cgl_mm", "cgv_mm"],
  "Door & Side": ["hd_mm", "ad_mm", "hr_side_mm", "shy_mm"],
};

export const KEY_MEASUREMENTS = [
  "hh_mm", "cd_mm", "kdl_mm", "kdr_mm", "hr_mm",
  "sk_mm", "kk_mm", "aa_mm", "hs_mm", "hd_mm", "ad_mm",
];
