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
  folderPath: string;
  segmentLengthMinutes: 1 | 2 | 3;
  totalSegments: number;
  status: ProjectStatus;
  tags: string[];
  highlights: Highlight[];
  notes: string;
  telemetry: TelemetryData;
  coverImage?: string; // base64 string pro lokální uložení
  motorcycle?: string; // Označení motorky (garáž)
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
