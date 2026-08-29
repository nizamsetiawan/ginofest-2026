export interface MonthlyTrendPoint {
  month: string;
  stuntingPrevalence: number; // percentage (e.g. 15.8)
  formattedRate: number; // integer for 21,580 format (like 21580 or 15.8)
  targetPrevalence: number;
  studentsServed: number;
}

export const MONTHLY_TRENDS: MonthlyTrendPoint[] = [
  { month: "Nov 2025", stuntingPrevalence: 15.8, formattedRate: 21580, targetPrevalence: 14.0, studentsServed: 110000 },
  { month: "Des 2025", stuntingPrevalence: 15.4, formattedRate: 21540, targetPrevalence: 13.8, studentsServed: 125000 },
  { month: "Jan 2026", stuntingPrevalence: 15.6, formattedRate: 21560, targetPrevalence: 13.5, studentsServed: 140000 },
  { month: "Feb 2026", stuntingPrevalence: 15.5, formattedRate: 21550, targetPrevalence: 13.2, studentsServed: 148000 },
  { month: "Mar 2026", stuntingPrevalence: 15.3, formattedRate: 21530, targetPrevalence: 13.0, studentsServed: 154000 },
  { month: "Apr 2026", stuntingPrevalence: 15.5, formattedRate: 21550, targetPrevalence: 12.8, studentsServed: 158000 },
  { month: "Mei 2026", stuntingPrevalence: 15.6, formattedRate: 21560, targetPrevalence: 12.5, studentsServed: 161000 },
  { month: "Jun 2026", stuntingPrevalence: 15.4, formattedRate: 21540, targetPrevalence: 12.2, studentsServed: 163000 },
  { month: "Jul 2026", stuntingPrevalence: 15.2, formattedRate: 21520, targetPrevalence: 12.0, studentsServed: 165000 },
  { month: "Agu 2026", stuntingPrevalence: 15.0, formattedRate: 21500, targetPrevalence: 11.8, studentsServed: 166000 },
  { month: "Sep 2026", stuntingPrevalence: 15.1, formattedRate: 21510, targetPrevalence: 11.5, studentsServed: 167000 },
  { month: "Okt 2026", stuntingPrevalence: 15.0, formattedRate: 21500, targetPrevalence: 11.2, studentsServed: 167500 },
  { month: "Nov 2026", stuntingPrevalence: 15.1, formattedRate: 21510, targetPrevalence: 11.0, studentsServed: 167850 },
];
