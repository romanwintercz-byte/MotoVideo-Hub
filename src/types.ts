export type ProjectStatus = 'raw' | 'editing' | 'done';
export type CameraView = 'front' | 'rear' | 'dual';

export interface Highlight {
  id: string;
  sourceFile: string; // e.g., "REC20260418-143021-40.mp4"
  time: string; // e.g., "01:45"
  note: string;
  camera: CameraView;
}

export interface TelemetryData {
  hasDiablo: boolean;
  hasAmazfit: boolean;
  syncOffsetMs: number; // For future use (time difference between first video and telemetry)
}

export interface RideProject {
  id: string;
  title: string;
  date: string;
  folderPath: string; // Path to the folder containing dashcam files
  segmentLengthMinutes: 1 | 2 | 3;
  totalSegments: number; // e.g., 20 files
  status: ProjectStatus;
  tags: string[];
  highlights: Highlight[];
  notes: string;
  telemetry: TelemetryData;
  createdAt: number;
}

export const AVAILABLE_TAGS = [
  'Off-road',
  'Okruh',
  'Kochačka',
  'Město',
  'Skupinovka',
  'Krizovka',
  'Zatáčky',
  'Déšť',
  'Noc'
];
