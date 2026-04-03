// ─── Raw Batch Time-Series Data (from JNM_All-Batches-Data_v1.xlsx) ─────────
// Extracted into its own module to avoid circular dependencies between
// jnm-data.ts and chart-configs.ts.

export interface BatchDataPoint {
  time: number
  od600: number
  wcw: number
  po2: number | null
  feedRate: number | null
  feedUnit: string
  comment?: string
}

export interface BatchMeta {
  id: string
  equipment: string
  spectrophotometer: string
  scale: number
  duration: number
  plannedDuration: number
  finalOD: number
  finalWCW: number
  supplements: string
  closureReason: string
  color: string
  batchMediumVol: number    // mL — initial batch medium volume
  totalFeedVol: number      // mL — total glucose feed volume over entire run
  supplementVol: number     // mL — total supplement additions (tocopherol, IPM, AA+YNB)
}

const BATCH_COLORS: Record<string, string> = {
  B01: '#94a3b8',
  B02: '#a78bfa',
  B03: '#38bdf8',
  B04: '#f97316',
  B05: '#22c55e',
  B06: '#ec4899',
}

export const batchMeta: BatchMeta[] = [
  { id: 'B01', equipment: 'KLF2000', spectrophotometer: 'Hitachi 1900U', scale: 1.5, duration: 82, plannedDuration: 96, finalOD: 201, finalWCW: 585, supplements: 'None', closureReason: 'Cell death + white cells at 82h', color: BATCH_COLORS.B01, batchMediumVol: 1600, totalFeedVol: 780, supplementVol: 0 },
  { id: 'B02', equipment: 'KLF2000', spectrophotometer: 'Hitachi 1900U', scale: 1.5, duration: 96, plannedDuration: 96, finalOD: 195, finalWCW: 571.6, supplements: 'None', closureReason: 'Completed; white cells + partial cell death in late stages', color: BATCH_COLORS.B02, batchMediumVol: 1600, totalFeedVol: 900, supplementVol: 0 },
  { id: 'B03', equipment: 'KLF2000', spectrophotometer: 'Hitachi 1900U', scale: 1.5, duration: 84, plannedDuration: 96, finalOD: 231.6, finalWCW: 785.37, supplements: 'None', closureReason: 'Pigment loss (white cells) + cell death at 84h', color: BATCH_COLORS.B03, batchMediumVol: 1600, totalFeedVol: 810, supplementVol: 0 },
  { id: 'B04', equipment: 'Sartorius BIOSTAT B', spectrophotometer: 'LABMAN (LMSP-V325)', scale: 2, duration: 74, plannedDuration: 96, finalOD: 310, finalWCW: 1149, supplements: 'Amino acid+YNB (520mL), Tocopherol (9×50mL)', closureReason: 'White cells + cell death at 74h', color: BATCH_COLORS.B04, batchMediumVol: 1700, totalFeedVol: 1580.5, supplementVol: 970 },
  { id: 'B05', equipment: 'Sartorius BIOSTAT B', spectrophotometer: 'LABMAN (LMSP-V325)', scale: 1, duration: 120, plannedDuration: 120, finalOD: 296, finalWCW: 1021, supplements: 'Tocopherol (200mL), IPM (200mL at 24h)', closureReason: 'Late-phase decline after ~108h; pigment loss', color: BATCH_COLORS.B05, batchMediumVol: 1600, totalFeedVol: 2250, supplementVol: 400 },
  { id: 'B06', equipment: 'Sartorius BIOSTAT B', spectrophotometer: 'LABMAN (LMSP-V325)', scale: 1, duration: 120, plannedDuration: 120, finalOD: 282, finalWCW: 983, supplements: 'Tocopherol (200mL), IPM (200mL at 24h), glucose pulse 90mL', closureReason: 'Slight decline after ~114h; culture stability largely maintained', color: BATCH_COLORS.B06, batchMediumVol: 1600, totalFeedVol: 2500, supplementVol: 490 },
]

export const batchData: Record<string, BatchDataPoint[]> = {
  B01: [
    { time: 0, od600: 0.8, wcw: 13.1, po2: 100, feedRate: 0, feedUnit: 'mL/L/h', comment: 'Inoculation' },
    { time: 6, od600: 3.2, wcw: 33.9, po2: 85, feedRate: 0, feedUnit: 'mL/L/h' },
    { time: 12, od600: 10.8, wcw: 59.3, po2: 65, feedRate: 5, feedUnit: 'mL/L/h', comment: 'Fed-batch started' },
    { time: 18, od600: 21.1, wcw: 82.9, po2: 68.13, feedRate: 5, feedUnit: 'mL/L/h' },
    { time: 24, od600: 42.3, wcw: 133.2, po2: 81.32, feedRate: 8, feedUnit: 'mL/L/h' },
    { time: 30, od600: 65, wcw: 190.3, po2: 63.19, feedRate: 8, feedUnit: 'mL/L/h' },
    { time: 36, od600: 74, wcw: 265.8, po2: 65, feedRate: 8, feedUnit: 'mL/L/h' },
    { time: 42, od600: 89, wcw: 310.4, po2: 76.92, feedRate: 10, feedUnit: 'mL/L/h' },
    { time: 48, od600: 123, wcw: 353.9, po2: 62.64, feedRate: 10, feedUnit: 'mL/L/h' },
    { time: 54, od600: 135, wcw: 404.7, po2: 58.79, feedRate: 10, feedUnit: 'mL/L/h' },
    { time: 60, od600: 151, wcw: 422.3, po2: 65, feedRate: 12, feedUnit: 'mL/L/h' },
    { time: 66, od600: 185, wcw: 479, po2: 65, feedRate: 12, feedUnit: 'mL/L/h' },
    { time: 72, od600: 207, wcw: 583, po2: 65, feedRate: 12, feedUnit: 'mL/L/h' },
    { time: 78, od600: 199, wcw: 566.3, po2: 89.56, feedRate: 15, feedUnit: 'mL/L/h', comment: 'OD decline (cell death onset)' },
    { time: 82, od600: 201, wcw: 585, po2: 70.33, feedRate: 15, feedUnit: 'mL/L/h', comment: 'TERMINATED — white cells' },
  ],
  B02: [
    { time: 0, od600: 1.02, wcw: 12.3, po2: 100, feedRate: 0, feedUnit: 'mL/L/h', comment: 'Inoculation' },
    { time: 6, od600: 4.13, wcw: 41, po2: 85, feedRate: 0, feedUnit: 'mL/L/h' },
    { time: 12, od600: 14, wcw: 57.7, po2: 77.3, feedRate: 5, feedUnit: 'mL/L/h' },
    { time: 18, od600: 24, wcw: 91.5, po2: 90.5, feedRate: 5, feedUnit: 'mL/L/h' },
    { time: 24, od600: 50, wcw: 137.8, po2: 89.2, feedRate: 8, feedUnit: 'mL/L/h' },
    { time: 30, od600: 82, wcw: 228.4, po2: 49.2, feedRate: 8, feedUnit: 'mL/L/h' },
    { time: 36, od600: 94, wcw: 228.4, po2: 77.3, feedRate: 8, feedUnit: 'mL/L/h' },
    { time: 42, od600: 113, wcw: 270.4, po2: 86.7, feedRate: 10, feedUnit: 'mL/L/h' },
    { time: 48, od600: 123, wcw: 303, po2: 88.7, feedRate: 10, feedUnit: 'mL/L/h' },
    { time: 54, od600: 112, wcw: 309.3, po2: 68.4, feedRate: 10, feedUnit: 'mL/L/h', comment: 'Growth stall begins' },
    { time: 60, od600: 125, wcw: 307.7, po2: 66.9, feedRate: 12, feedUnit: 'mL/L/h' },
    { time: 66, od600: 115, wcw: 307.5, po2: 98.9, feedRate: 12, feedUnit: 'mL/L/h' },
    { time: 72, od600: 116, wcw: 309, po2: 68.6, feedRate: 12, feedUnit: 'mL/L/h' },
    { time: 78, od600: 122, wcw: 351.3, po2: 20, feedRate: 15, feedUnit: 'mL/L/h', comment: 'pO₂ drops to 20% — O₂ limitation' },
    { time: 84, od600: 145, wcw: 407.7, po2: 20, feedRate: 15, feedUnit: 'mL/L/h' },
    { time: 90, od600: 168, wcw: 471.5, po2: 57.9, feedRate: 15, feedUnit: 'mL/L/h' },
    { time: 96, od600: 195, wcw: 571.6, po2: 52.9, feedRate: 15, feedUnit: 'mL/L/h', comment: 'Completed — white cells observed' },
  ],
  B03: [
    { time: 0, od600: 1.23, wcw: 7.2, po2: 99.7, feedRate: 0, feedUnit: 'mL/L/h', comment: 'Inoculation' },
    { time: 6, od600: 5.42, wcw: 23.6, po2: 90.9, feedRate: 0, feedUnit: 'mL/L/h' },
    { time: 12, od600: 14.9, wcw: 50.6, po2: 80.5, feedRate: 5, feedUnit: 'mL/L/h' },
    { time: 18, od600: 24.3, wcw: 82.3, po2: 79.6, feedRate: 5, feedUnit: 'mL/L/h' },
    { time: 24, od600: 46.8, wcw: 124.6, po2: 75.4, feedRate: 8, feedUnit: 'mL/L/h' },
    { time: 30, od600: 79.2, wcw: 178.5, po2: 63.7, feedRate: 8, feedUnit: 'mL/L/h' },
    { time: 36, od600: 98.9, wcw: 218.19, po2: 52.5, feedRate: 8, feedUnit: 'mL/L/h' },
    { time: 42, od600: 127.6, wcw: 292.3, po2: 49.5, feedRate: 10, feedUnit: 'mL/L/h' },
    { time: 48, od600: 148.1, wcw: 350.7, po2: 43.5, feedRate: 10, feedUnit: 'mL/L/h' },
    { time: 54, od600: 163.7, wcw: 441.6, po2: 41.4, feedRate: 10, feedUnit: 'mL/L/h' },
    { time: 60, od600: 174.8, wcw: 448.6, po2: 39.5, feedRate: 12, feedUnit: 'mL/L/h' },
    { time: 66, od600: 187.3, wcw: 587.8, po2: 33.6, feedRate: 12, feedUnit: 'mL/L/h' },
    { time: 72, od600: 195.3, wcw: 610.7, po2: 31.3, feedRate: 12, feedUnit: 'mL/L/h' },
    { time: 78, od600: 218.4, wcw: 764.9, po2: 33.4, feedRate: 15, feedUnit: 'mL/L/h' },
    { time: 84, od600: 231.6, wcw: 785.37, po2: 31.4, feedRate: 15, feedUnit: 'mL/L/h', comment: 'TERMINATED — pigment loss + cell death' },
  ],
  B04: [
    { time: 0, od600: 1.3, wcw: 104, po2: 100, feedRate: null, feedUnit: 'mL/h', comment: 'Inoculation (8.64 g/L inoculum)' },
    { time: 6, od600: 5.5, wcw: 138, po2: 85, feedRate: null, feedUnit: 'mL/h' },
    { time: 12, od600: 17.8, wcw: 162, po2: 77.3, feedRate: null, feedUnit: 'mL/h', comment: 'Amino acid + YNB addition' },
    { time: 18, od600: 27.1, wcw: 214, po2: 90.5, feedRate: 13.5, feedUnit: 'mL/h', comment: 'Fed-batch started' },
    { time: 24, od600: 48.5, wcw: 274, po2: 99.2, feedRate: 9, feedUnit: 'mL/h' },
    { time: 30, od600: 77.6, wcw: 349, po2: 99.2, feedRate: 9, feedUnit: 'mL/h' },
    { time: 36, od600: 151, wcw: 517, po2: 77.3, feedRate: 13.5, feedUnit: 'mL/h' },
    { time: 42, od600: 195, wcw: 653, po2: 86.7, feedRate: 13.5, feedUnit: 'mL/h' },
    { time: 48, od600: 230, wcw: 796, po2: 88.7, feedRate: 5.5, feedUnit: 'mL/h' },
    { time: 54, od600: 257, wcw: 909, po2: 68.4, feedRate: 5.5, feedUnit: 'mL/h' },
    { time: 60, od600: 308, wcw: 1072, po2: 66.9, feedRate: 10.5, feedUnit: 'mL/h' },
    { time: 66, od600: 318, wcw: 1115, po2: 98.9, feedRate: 10.5, feedUnit: 'mL/h' },
    { time: 72, od600: 308, wcw: 1123, po2: 68.6, feedRate: 10.5, feedUnit: 'mL/h', comment: 'OD decline — white cells' },
    { time: 74, od600: 310, wcw: 1149, po2: 64.7, feedRate: 5, feedUnit: 'mL/h', comment: 'TERMINATED — cell death + toxicity' },
  ],
  B05: [
    { time: 0, od600: 1.1, wcw: 49, po2: 95.1, feedRate: null, feedUnit: 'mL/h', comment: 'Inoculation (4.01 g/L inoculum)' },
    { time: 6, od600: 3.6, wcw: 51, po2: 85, feedRate: null, feedUnit: 'mL/h' },
    { time: 12, od600: 19.2, wcw: 81, po2: 70.5, feedRate: null, feedUnit: 'mL/h' },
    { time: 18, od600: 30.2, wcw: 83, po2: 69.8, feedRate: 4.5, feedUnit: 'mL/h' },
    { time: 24, od600: 51.3, wcw: 309, po2: 68.1, feedRate: 9, feedUnit: 'mL/h', comment: 'Tocopherol + IPM added' },
    { time: 30, od600: 73, wcw: 338, po2: 36.6, feedRate: 9, feedUnit: 'mL/h' },
    { time: 36, od600: 120, wcw: 406, po2: 48.9, feedRate: 13.5, feedUnit: 'mL/h' },
    { time: 42, od600: 140, wcw: 505, po2: 35.7, feedRate: 18, feedUnit: 'mL/h' },
    { time: 48, od600: 180, wcw: 635, po2: 38.9, feedRate: 18, feedUnit: 'mL/h' },
    { time: 54, od600: 220, wcw: 788, po2: 35.6, feedRate: 18, feedUnit: 'mL/h' },
    { time: 60, od600: 250, wcw: 902, po2: 30.8, feedRate: 18, feedUnit: 'mL/h' },
    { time: 66, od600: 260, wcw: 911, po2: 39.9, feedRate: 18, feedUnit: 'mL/h' },
    { time: 72, od600: 280, wcw: 943, po2: 31.8, feedRate: 18, feedUnit: 'mL/h' },
    { time: 78, od600: 240, wcw: 874, po2: 39.6, feedRate: 22.5, feedUnit: 'mL/h', comment: 'OD decline — cell stress' },
    { time: 84, od600: 246, wcw: 897, po2: 29.4, feedRate: 27, feedUnit: 'mL/h' },
    { time: 90, od600: 265, wcw: 921, po2: 30.8, feedRate: 31.5, feedUnit: 'mL/h' },
    { time: 96, od600: 293, wcw: 1011, po2: 27.9, feedRate: 36, feedUnit: 'mL/h' },
    { time: 102, od600: 296, wcw: 1020, po2: 26.3, feedRate: 40.5, feedUnit: 'mL/h' },
    { time: 108, od600: 304, wcw: 1082, po2: 25.5, feedRate: 40.5, feedUnit: 'mL/h', comment: 'OD peak ~304' },
    { time: 114, od600: 302, wcw: 1067, po2: 26.8, feedRate: 40.5, feedUnit: 'mL/h' },
    { time: 120, od600: 296, wcw: 1021, po2: 95.1, feedRate: 40.5, feedUnit: 'mL/h', comment: 'Batch ended — pO₂ spike' },
  ],
  B06: [
    { time: 0, od600: 1.96, wcw: 17.9, po2: null, feedRate: null, feedUnit: 'mL/h', comment: 'Inoculation (1.5 g/L inoculum)' },
    { time: 6, od600: 5.16, wcw: 35.7, po2: null, feedRate: null, feedUnit: 'mL/h' },
    { time: 12, od600: 17.6, wcw: 65.9, po2: null, feedRate: 4.5, feedUnit: 'mL/h' },
    { time: 18, od600: 30.6, wcw: 93.4, po2: null, feedRate: 4.5, feedUnit: 'mL/h' },
    { time: 24, od600: 55.7, wcw: 184, po2: null, feedRate: 4.5, feedUnit: 'mL/h', comment: 'Tocopherol + IPM added' },
    { time: 30, od600: 60, wcw: 220, po2: null, feedRate: 9, feedUnit: 'mL/h' },
    { time: 36, od600: 65, wcw: 308, po2: null, feedRate: 13.5, feedUnit: 'mL/h' },
    { time: 42, od600: 98, wcw: 356, po2: null, feedRate: 18, feedUnit: 'mL/h' },
    { time: 48, od600: 120, wcw: 496, po2: null, feedRate: 18, feedUnit: 'mL/h' },
    { time: 54, od600: 140, wcw: 511, po2: null, feedRate: 18, feedUnit: 'mL/h' },
    { time: 60, od600: 165, wcw: 570, po2: null, feedRate: 18, feedUnit: 'mL/h' },
    { time: 66, od600: 178, wcw: 596, po2: null, feedRate: 18, feedUnit: 'mL/h' },
    { time: 72, od600: 209, wcw: 700, po2: null, feedRate: 18, feedUnit: 'mL/h' },
    { time: 78, od600: 220, wcw: 729, po2: null, feedRate: 18, feedUnit: 'mL/h' },
    { time: 84, od600: 240, wcw: 792, po2: null, feedRate: 22.5, feedUnit: 'mL/h' },
    { time: 90, od600: 256, wcw: 906, po2: null, feedRate: 27, feedUnit: 'mL/h', comment: 'Glucose pulse 90mL added' },
    { time: 96, od600: 264, wcw: 937, po2: null, feedRate: 31.5, feedUnit: 'mL/h' },
    { time: 102, od600: 276, wcw: 963, po2: null, feedRate: 36, feedUnit: 'mL/h' },
    { time: 108, od600: 285, wcw: 995, po2: null, feedRate: 40.5, feedUnit: 'mL/h' },
    { time: 114, od600: 283, wcw: 986, po2: null, feedRate: 40.5, feedUnit: 'mL/h', comment: 'Slight decline begins' },
    { time: 120, od600: 282, wcw: 983, po2: null, feedRate: 40.5, feedUnit: 'mL/h', comment: 'Batch ended — stability maintained' },
  ],
}
