
import { ImageFilters, ImageTransform } from './types';

export const DEFAULT_FILTERS: ImageFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  exposure: 0,
  sepia: 0,
  blur: 0,
  grayscale: 0,
  hueRotate: 0,
};

export const DEFAULT_TRANSFORM: ImageTransform = {
  rotate: 0,
  scaleX: 1,
  scaleY: 1,
};

export const ASPECT_RATIOS = [
  { label: 'Original', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
];
