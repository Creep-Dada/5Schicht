import React, { useState, useMemo } from 'react';
import { EventData, Shift, Birthday } from '../types';
import { EditIcon, TrashIcon, ChevronDownIcon } from './Icons';
import { toISODateString } from '../utils';
import { MONTH_NAMES } from '../constants';

interface EventListProps {
  events: Record<string, EventData>;
  birthdays: Birthday[];
  year: number;
  getShiftForDate: (date: Date) => Shift;
  onEdit: (date: Date, shift: Shift) => void;
  onDelete: (dateKey: string) => void;
  onDeleteVacationBlock: (from: Date, to: Date) => void;
}

type EventListItem =
  | { type: 'event'; date: Date; eventData: EventData }
  | { type: 'vacation'; startDate: Date; endDate: Date };

const EventList: React.FC<EventListProps> = ({ events, birthdays, year, getShiftForDate, onEdit, onDelete, onDeleteVacationBlock }) => {
  const [showBirthdays, setShowBirthdays] = useState(false);

  const itemsByMonth = useMemo(() => {
    // Create a combined map of all event data, merging birthdays if selected
    const combinedEvents: Record<string, EventData> = JSON.parse(JSON.stringify(events));

    if (showBirthdays) {
      birthdays.forEach(b => {
        const date = new Date(year, b.month, b.day);
        const dateKey = toISODateString(date);
        
        const existingEvent = combinedEvents[dateKey] || { note: '', hasVacation: false, colleagues: [] };
        combinedEvents[dateKey] = {
          ...existingEvent,
          isBirthday: true,
          birthdayName: b.name,
        };
      });
    }

    const allEventEntries = Object.entries(combinedEvents)
      .map(([dateKey, eventData]: [string, EventData]) => {
          const [y, m, d] = dateKey.split('-').map(Number);
          return { date: new Date(y, m - 1, d), eventData };
      })
      .filter(item => item.date.getFullYear() === year)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
      
    const vacationDays = allEventEntries.filter(e => e.eventData.isPersonalVacation);
    const otherEvents = allEventEntries.filter(e => {
        const { eventData } = e;
        // Include events that are now just birthdays from the combined map
        const hasContent = (eventData.note && eventData.note.trim() !== '') || eventData.hasVacation || eventData.isAfz || (eventData.isBirthday && showBirthdays);
        return !eventData.isPersonalVacation && hasContent;
    });

    const vacationBlocks: EventListItem[] = [];
    if (vacationDays.length > 0) {
        let currentBlockStart = vacationDays[0].date;

        for (let i = 0; i < vacationDays.length; i++) {
            const currentDay = vacationDays[i];
            const nextDay = vacationDays[i + 1];
            
            if (!nextDay || nextDay.date.getTime() - currentDay.date.getTime() > 24 * 60 * 60 * 1000 + 3600 * 1000) {
                vacationBlocks.push({
                    type: 'vacation',
                    startDate: currentBlockStart,
                    endDate: currentDay.date,
                });
                if (nextDay) {
                    currentBlockStart = nextDay.date;
                }
            }
        }
    }
    
    const otherEventItems: EventListItem[] = otherEvents.map(({date, eventData}) => ({
        type: 'event',
        date,
        eventData,
    }));
    
    const allItems: EventListItem[] = [...vacationBlocks, ...otherEventItems];
    
    allItems.sort((a, b) => (a.type === 'vacation' ? a.startDate : a.date).getTime() - (b.type === 'vacation' ? b.startDate : b.date).getTime());

    const groups: Record<string, EventListItem[]> = {};
    for (const item of allItems) {
      const dateForMonth = item.type === 'vacation' ? item.startDate : item.date;
      const monthKey = `${dateForMonth.getFullYear()}-${String(dateForMonth.getMonth()).padStart(2, '0')}`;
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(item);
    }
    
    return groups;
  }, [events, birthdays, showBirthdays, year]);
    
  const sortedMonthKeys = Object.keys(itemsByMonth).sort();
  const hasEvents = sortedMonthKeys.length > 0;
    
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <details className="group" open={hasEvents}>
            <summary className="flex justify-between items-center p-4 font-medium cursor-pointer list-none">
                <h2 className="text-2xl font-bold">Meine Einträge</h2>
                <span className="transition-transform duration-300 group-open:rotate-180 text-gray-600 dark:text-gray-400">
                    <ChevronDownIcon className="h-6 w-6" />
                </span>
            </summary>
            
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 pt-4 pb-4">
                {hasEvents ? (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {sortedMonthKeys.map(monthKey => {
                            const monthItems = itemsByMonth[monthKey];
                            const firstItemDate = monthItems[0].type === 'vacation' ? monthItems[0].startDate : monthItems[0].date;
                            const monthName = MONTH_NAMES[firstItemDate.getMonth()];
                            const yearNum = firstItemDate.getFullYear();

                            return (
                                <details key={monthKey} className="group" open>
                                    <summary className="flex justify-between items-center p-2 rounded-md cursor-pointer list-none bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                        <span className="font-bold text-gray-800 dark:text-gray-200">{monthName} {yearNum} ({monthItems.length})</span>
                                        <span className="transition-transform duration-300 group-open:rotate-180 text-gray-600 dark:text-gray-400">
                                            <ChevronDownIcon />
                                        </span>
                                    </summary>
                                    <div className="pt-2 pl-2 space-y-3">
                                        {monthItems.map((item, index) => {
                                            if (item.type === 'vacation') {
                                                const { startDate, endDate } = item;
                                                const dateKey = `${toISODateString(startDate)}-${toISODateString(endDate)}`;
                                                
                                                const dateRangeString = startDate.getTime() === endDate.getTime() 
                                                    ? startDate.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
                                                    : `${startDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} bis ${endDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
                                        
                                                return (
                                                    <div key={dateKey} className={`border-l-4 border-teal-500 pl-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-r-md`}>
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-bold">🌴 Persönlicher Urlaub</p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{dateRangeString}</p>
                                                            </div>
                                                            <div className="flex space-x-1 flex-shrink-0 ml-2">
                                                                <button onClick={() => onDeleteVacationBlock(startDate, endDate)} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-gray-600 rounded-full transition" aria-label="Urlaubsblock löschen">
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            
                                            // Regular event
                                            const { date, eventData } = item;
                                            const dateKey = toISODateString(date);
                                            const shift = getShiftForDate(date);
                                            
                                            let borderColor = 'border-blue-500';
                                            if (eventData.isBirthday) borderColor = 'border-pink-500';
                                            else if (eventData.isAfz) borderColor = 'border-purple-500';
                                            else if (eventData.hasVacation) borderColor = 'border-orange-500';

                                            const isDeletable = eventData.note || eventData.hasVacation || eventData.isAfz;

                                            return (
                                                <div key={dateKey} className={`border-l-4 ${borderColor} pl-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-r-md`}>
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <p className="font-bold">{date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })} - <span className="font-normal">{eventData.isAfz ? "AFZ" : shift}</span></p>
                                                            {eventData.isBirthday && <p className="text-sm text-gray-800 dark:text-gray-200">🎂 Geburtstag: {eventData.birthdayName}</p>}
                                                            {eventData.note && <p className="text-sm text-gray-600 dark:text-gray-300 italic">📝 Notiz: "{eventData.note}"</p>}
                                                            {eventData.hasVacation && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                🤝 Kollege im Urlaub: {eventData.colleagues.length > 0 ? eventData.colleagues.join(', ') : 'Ja'}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex space-x-1 flex-shrink-0 ml-2">
                                                            <button onClick={() => onEdit(date, shift)} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-600 rounded-full transition"><EditIcon className="h-4 w-4" /></button>
                                                            {isDeletable && <button onClick={() => onDelete(dateKey)} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-gray-600 rounded-full transition"><TrashIcon className="h-4 w-4" /></button>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </details>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-gray-500 dark:text-gray-400">Keine Einträge für {year} vorhanden.</p>
                    </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <input
                            id="show-birthdays"
                            type="checkbox"
                            checked={showBirthdays}
                            onChange={(e) => setShowBirthdays(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        <label htmlFor="show-birthdays" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">Geburtstage in Liste anzeigen</label>
                    </div>
                </div>
            </div>
        </details>
    </div>
  );
};

export default EventList;