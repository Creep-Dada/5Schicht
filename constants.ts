import { Shift } from './types';

export const SHIFT_CYCLE: Shift[] = [
  ...Array(4).fill(Shift.Früh),
  Shift.Frei,
  ...Array(3).fill(Shift.Mittag),
  Shift.Frei,
  ...Array(4).fill(Shift.Nacht),
  ...Array(5).fill(Shift.Frei),
  ...Array(3).fill(Shift.Früh),
  Shift.Frei,
  ...Array(4).fill(Shift.Mittag),
  Shift.Frei,
  ...Array(3).fill(Shift.Nacht),
  ...Array(5).fill(Shift.Frei),
];

export const DEFAULT_SHIFT_COLORS: Record<Shift, {light: string, dark: string}> = {
  [Shift.Früh]:   { light: '#fecaca', dark: '#7f1d1d' }, // red-200, red-900
  [Shift.Mittag]: { light: '#bfdbfe', dark: '#1e3a8a' }, // blue-200, blue-900
  [Shift.Nacht]:  { light: '#e9d5ff', dark: '#581c87' }, // purple-200, purple-900
  [Shift.Frei]:   { light: '#dcfce7', dark: '#14532d' }, // green-200, green-800
};

export const GROUP_REFERENCE_DATES: Record<string, string> = {
  '1': '2025-01-30',
  '2': '2025-01-23',
  '3': '2025-01-16',
  '4': '2025-01-09',
  '5': '2025-01-02',
};

export const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

export const DAY_NAMES_SUN_START = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
export const DAY_NAMES_MON_START = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
