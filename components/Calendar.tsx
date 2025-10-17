import React, { useMemo } from 'react';
import { CalendarDayData, Shift, EventData } from '../types';
import { MONTH_NAMES, DAY_NAMES_SUN_START, DAY_NAMES_MON_START } from '../constants';
import { getTextColorForBg } from '../utils';

interface CalendarProps {
  year: number;
  calendarData: CalendarDayData[];
  onDayClick: (date: Date, shift: Shift) => void;
  shiftColors: Record<Shift, { light: string; dark: string }>;
  isDarkMode: boolean;
  weekStartsOnMonday: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ year, calendarData, onDayClick, shiftColors, isDarkMode, weekStartsOnMonday }) => {
  const monthsData = useMemo(() => {
    const dataByMonth: CalendarDayData[][] = Array.from({ length: 12 }, () => []);
    if (!calendarData || calendarData.length === 0) {
      return dataByMonth;
    }
    
    for (const dayData of calendarData) {
      const month = dayData.date.getMonth();
      dataByMonth[month].push(dayData);
    }
    return dataByMonth;
  }, [calendarData]);

  const DAY_NAMES = weekStartsOnMonday ? DAY_NAMES_MON_START : DAY_NAMES_SUN_START;
  
  const getEntryAnimationClass = (eventData?: EventData, birthday?: { name: string }): string => {
    if (!eventData && !birthday) return '';
    const hasContent = (eventData?.note && eventData.note.trim() !== '') || eventData?.hasVacation || eventData?.isAfz || birthday;
    return hasContent ? 'has-entry-animation' : '';
  };

  if (!calendarData || calendarData.length === 0) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md h-full flex flex-col justify-center items-center">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Kalender ist leer</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Bitte erstellen Sie den Kalender über das Menü oben, um Ihre Schichten anzuzeigen.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
      {monthsData.map((monthData, monthIndex) => {
        if (monthData.length === 0) {
          return null;
        }
        
        const firstDayOfMonth = monthData[0].date.getDay();
        const emptyDaysCount = weekStartsOnMonday ? (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1) : firstDayOfMonth;
        const emptyDays = Array.from({ length: emptyDaysCount });

        return (
          <div key={monthIndex} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg break-inside-avoid">
            <h3 className="text-xl font-bold text-center mb-4">{MONTH_NAMES[monthIndex]} {year}</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-600 dark:text-gray-400 print:text-black">
              {DAY_NAMES.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-2">
              {emptyDays.map((_, index) => <div key={`empty-${index}`} className="h-24 print:h-24"></div>)}
              {monthData.map((dayData) => {
                const { date, shift, event, holiday, birthday } = dayData;
                const dateKey = date.toISOString().split('T')[0];
                const theme = isDarkMode ? 'dark' : 'light';
                const bgColor = shiftColors[shift][theme];
                const textColor = getTextColorForBg(bgColor);

                const isToday = new Date().toDateString() === date.toDateString();
                const entryAnimationClass = getEntryAnimationClass(event, birthday);

                const hasNote = event?.note && event.note.trim() !== '';
                const noteText = hasNote ? event.note.split(' ').slice(0, 5).join(' ') : '';


                return (
                  <div
                    key={dateKey}
                    onClick={() => onDayClick(date, shift)}
                    className={`relative p-1 h-24 flex flex-col rounded-md cursor-pointer transition-transform transform hover:scale-105 print:h-24 print:p-1 print:border print:border-gray-300 print:rounded-none print:shadow-none print:bg-white print:border-l-4 print-border-${shift} ${isToday ? 'ring-2 ring-blue-500' : ''} ${holiday ? 'border-2 border-red-500' : 'border-2 border-transparent'} ${entryAnimationClass}`}
                    style={{ backgroundColor: bgColor }}
                  >
                    {/* Top: Date Number */}
                    <div className={`text-center font-bold text-sm ${textColor} print:text-black z-10`}>
                      {date.getDate()}
                    </div>
                    
                    {/* Middle: Content (takes up remaining space) */}
                    <div className="flex-grow flex flex-col items-center justify-center text-center overflow-hidden z-10">
                       {hasNote ? (
                          <div className="w-full overflow-hidden">
                              <p className={`text-xs font-semibold leading-tight px-1 animate-note-marquee ${textColor} print:text-black`} title={event.note}>
                                {noteText}
                              </p>
                          </div>
                      ) : birthday ? (
                          <div className="w-full overflow-hidden">
                              <p className={`text-xs font-semibold leading-tight px-1 animate-note-marquee ${textColor} print:text-black`} title={birthday.name}>
                                  🎂 {birthday.name}
                              </p>
                          </div>
                      ) : holiday ? (
                        <p className={`text-xs font-semibold leading-tight px-1 truncate ${textColor} print:text-black`} title={holiday}>
                          {holiday}
                        </p>
                      ) : null}
                    </div>

                    {/* Bottom: Shift Name */}
                    <div className={`text-right text-xs font-medium pr-1 ${textColor} print:text-black z-10`}>
                      {event?.isAfz ? 'AFZ' : shift}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Calendar;