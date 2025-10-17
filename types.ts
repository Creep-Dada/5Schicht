
export enum Shift {
  Früh = 'Früh',
  Mittag = 'Mittag',
  Nacht = 'Nacht',
  Frei = 'Frei',
}

export interface EventData {
  note: string;
  hasVacation: boolean;
  colleagues: string[];
  isAfz?: boolean;
  isBirthday?: boolean;
  birthdayName?: string;
}

export interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  global: boolean;
  counties: string[] | null;
}

export interface Birthday {
    month: number; // 0-11
    day: number; // 1-31
    name: string;
}

export interface CalendarDayData {
  date: Date;
  shift: Shift;
  event?: EventData;
  holiday?: string;
  birthday?: { name: string };
}