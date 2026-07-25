export type ThemeMode = 'default' | 'light' | 'renaissance' | 'islamic' | 'sky' | 'atom' | 'dark' | 'cyberpunk' | 'nature' | 'monochrome' | 'sunset';

export type TabType = 'grid' | 'music' | 'ai' | 'assistant' | 'planner';

export interface GridPiece {
  id: number;
  dataUrl: string;
  row: number;
  col: number;
  uploadOrder: number; // Order to upload to Instagram (bottom-to-top)
}

export interface GridDimension {
  cols: number;
  rows: number;
  label: string;
}

export interface ApiStatus {
  hasKey: boolean;
  isCustomKeySet: boolean;
}
