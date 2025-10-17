
import { Holiday } from '../types';

export const fetchHolidays = async (year: number): Promise<Record<string, string>> => {
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/DE`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const holidays: Holiday[] = await response.json();
    const holidayMap: Record<string, string> = {};
    
    // Filter holidays for Saarland (DE-SL).
    // A holiday is valid if it is global or specifically includes 'DE-SL' in its counties list.
    const saarlandHolidays = holidays.filter(holiday => holiday.global || (holiday.counties && holiday.counties.includes('DE-SL')));

    saarlandHolidays.forEach(holiday => {
      holidayMap[holiday.date] = holiday.localName;
    });
    return holidayMap;
  } catch (error) {
    console.error("Could not fetch holidays:", error);
    return {};
  }
};