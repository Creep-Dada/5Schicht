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
}

type EventListItem = {
  date: Date;
  eventData: EventData;
  isBirthday: boolean;
};

const EventList: React.FC<EventListProps> = ({ events, birthdays, year, getShiftForDate, onEdit, onDelete }) => {
  const [showBirthdays, setShowBirthdays] = useState(false);

  const groupedEvents = useMemo(() => {
    const regularEvents: EventListItem[] = Object.keys(events)
      .map((dateKey) => {
          const [y, m, d] = dateKey.split('-').map(Number);
          const date = new Date(y, m - 1, d);
          if (date.getFullYear() !== year) return null; // Nur Einträge des ausgewählten Jahres anzeigen
          return { date, eventData: events[dateKey], isBirthday: false };
      })
      .filter((item): item is EventListItem => {
          if (!item) return false;
          const { eventData } = item;
          const hasContent = (eventData.note && eventData.note.trim() !== '') || eventData.hasVacation || eventData.isAfz;
          return hasContent;
      });
      
    let allEvents = [...regularEvents];

    if (showBirthdays) {
      const birthdayEvents = birthdays.map(b => {
        const date = new Date(year, b.month, b.day);
        return {
          date,
          eventData: { note: `Geburtstag von ${b.name}`, hasVacation: false, colleagues: [], isBirthday: true },
          isBirthday: true,
        };
      });
      allEvents = [...allEvents, ...birthdayEvents];
    }
    
    allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    const groups: Record<string, EventListItem[]> = {};
    for (const eventItem of allEvents) {
      const monthKey = `${eventItem.date.getFullYear()}-${String(eventItem.date.getMonth()).padStart(2, '0')}`;
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(eventItem);
    }
    
    return groups;
  }, [events, birthdays, showBirthdays, year]);
    
  const sortedMonthKeys = Object.keys(groupedEvents).sort();
    
  if (sortedMonthKeys.length === 0) {
    const emptyMessage = showBirthdays 
      ? `Keine Einträge oder Geburtstage für ${year} gefunden.` 
      : 'Keine Einträge vorhanden.';
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                    <input
                        id="show-birthdays"
                        type="checkbox"
                        checked={showBirthdays}
                        onChange={(e) => setShowBirthdays(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <label htmlFor="show-birthdays" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">Geburtstage anzeigen</label>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="space-y-2 max-h-[68vh] overflow-y-auto pr-2">
           {sortedMonthKeys.map(monthKey => {
             const monthEvents = groupedEvents[monthKey];
             const firstEventDate = monthEvents[0].date;
             const monthName = MONTH_NAMES[firstEventDate.getMonth()];
             const yearNum = firstEventDate.getFullYear();

             return (
                <details key={monthKey} className="group" open>
                    <summary className="flex justify-between items-center p-2 rounded-md cursor-pointer list-none bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{monthName} {yearNum} ({monthEvents.length})</span>
                        <span className="transition-transform duration-300 group-open:rotate-180 text-gray-600 dark:text-gray-400">
                            <ChevronDownIcon />
                        </span>
                    </summary>
                    <div className="pt-2 pl-2 space-y-3">
                        {monthEvents.map(({ date, eventData, isBirthday }) => {
                            const dateKey = toISODateString(date);
                            const shift = getShiftForDate(date);
                            const borderColor = isBirthday ? 'border-pink-500' : 'border-blue-500';
                            
                            return (
                                <div key={`${dateKey}-${isBirthday}`} className={`border-l-4 ${borderColor} pl-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-r-md`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                    <p className="font-bold">{date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })} - <span className="font-normal">{eventData.isAfz ? "AFZ" : shift}</span></p>
                                    {isBirthday && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">🎂 {eventData.note}</p>}
                                    {eventData.note && !isBirthday && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">Notiz: "{eventData.note}"</p>}
                                    {eventData.hasVacation && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        Urlaub (Kollegen): {eventData.colleagues.length > 0 ? eventData.colleagues.join(', ') : 'Ja'}
                                        </p>
                                    )}
                                    </div>
                                    <div className="flex space-x-1 flex-shrink-0 ml-2">
                                    <button onClick={() => onEdit(date, shift)} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-600 rounded-full transition"><EditIcon className="h-4 w-4" /></button>
                                    {!isBirthday && <button onClick={() => onDelete(dateKey)} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-gray-600 rounded-full transition"><TrashIcon className="h-4 w-4" /></button>}
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
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
             <div className="flex items-center">
                <input
                    id="show-birthdays"
                    type="checkbox"
                    checked={showBirthdays}
                    onChange={(e) => setShowBirthdays(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <label htmlFor="show-birthdays" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">Geburtstage anzeigen</label>
            </div>
        </div>
    </div>
  );
};

export default EventList;