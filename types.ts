
export interface ImageData {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
  lastModified: number;
  size: number;
}

export interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  sepia: number;
  blur: number;
  grayscale: number;
  hueRotate: number;
}

export interface ImageTransform {
  rotate: number;
  scaleX: number;
  scaleY: number;
}

export enum AppMode {
  LIBRARY = 'LIBRARY',
  EDITOR = 'EDITOR',
  BATCH = 'BATCH',
  SETTINGS = 'SETTINGS'
}

export interface ProcessingHistory {
  filters: ImageFilters;
  transform: ImageTransform;
}
