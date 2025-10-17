/**
 * Converts a Date object to a 'YYYY-MM-DD' string, ignoring timezone offsets.
 * This is crucial for correctly keying events and holidays.
 * @param date The date to convert.
 * @returns A string in 'YYYY-MM-DD' format.
 */
export const toISODateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Determines if text on a given background color should be black or white for best contrast.
 * @param bgColor The background color in hex format (e.g., '#RRGGBB').
 * @returns 'text-black' or 'text-white' as a CSS class name.
 */
export const getTextColorForBg = (bgColor: string): 'text-black' | 'text-white' => {
  const color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  // Formula for perceived brightness (luminance)
  const luminance = (r * 0.299 + g * 0.587 + b * 0.114);
  return luminance > 186 ? 'text-black' : 'text-white';
};
