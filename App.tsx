import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import EventList from './components/EventList';
import SettingsModal from './components/SettingsModal';
import { fetchHolidays } from './services/holidayService';
import { Shift, EventData, CalendarDayData, Birthday } from './types';
import { SHIFT_CYCLE, GROUP_REFERENCE_DATES, DEFAULT_SHIFT_COLORS } from './constants';
import { toISODateString } from './utils';

const App: React.FC = () => {
    // --- State Management ---
    const [year, setYear] = useLocalStorage('sc-year', new Date().getFullYear());
    const [startMethod, setStartMethod] = useLocalStorage<'group' | 'manual'>('sc-startMethod', 'group');
    const [group, setGroup] = useLocalStorage('sc-group', '1');
    const [manualDate, setManualDate] = useLocalStorage('sc-manualDate', '');
    const [showHolidays, setShowHolidays] = useLocalStorage('sc-showHolidays', false);
    const [isDarkMode, setIsDarkMode] = useLocalStorage('sc-darkMode', false);
    const [weekStartsOnMonday, setWeekStartsOnMonday] = useLocalStorage('sc-weekStartsOnMonday', true);
    
    const [events, setEvents] = useLocalStorage<Record<string, EventData>>('sc-events', {});
    const [birthdays, setBirthdays] = useLocalStorage<Birthday[]>('sc-birthdays', []);
    const [holidays, setHolidays] = useState<Record<string, string>>({});
    const [calendarData, setCalendarData] = useState<CalendarDayData[]>([]);

    const [shiftColors, setShiftColors] = useLocalStorage('sc-shiftColors', DEFAULT_SHIFT_COLORS);
    
    const [modalInfo, setModalInfo] = useState<{ date: Date; shift: Shift } | null>(null);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

    // --- Effects ---
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const loadHolidays = async () => {
            if (showHolidays) {
                const holidayData = await fetchHolidays(year);
                setHolidays(holidayData);
            } else {
                setHolidays({});
            }
        };
        loadHolidays();
    }, [showHolidays, year]);
    
    // Effect to inject print styles for custom colors
    useEffect(() => {
        const styleId = 'custom-shift-print-styles';
        let styleElement = document.getElementById(styleId);
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        
        const printCss = `
            @media print {
              ${(Object.keys(shiftColors) as Shift[]).map(shift => `
                .print-border-${shift} {
                  border-left-color: ${shiftColors[shift].light} !important;
                }
              `).join('')}
            }
        `;
        
        styleElement.innerHTML = printCss;
    }, [shiftColors]);

    useEffect(() => {
        // Automatically generate calendar on first load if settings are present
        const hasSettings = localStorage.getItem('sc-year') && (localStorage.getItem('sc-manualDate') || localStorage.getItem('sc-group'));
        if (hasSettings) {
           generateCalendar();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Core Logic ---
    const getStartDate = useCallback(() => {
        if (startMethod === 'manual' && manualDate) {
            // Treat date as local to avoid timezone shifts
            const [year, month, day] = manualDate.split('-').map(Number);
            return new Date(year, month - 1, day);
        }
        if (startMethod === 'group') {
            return new Date(GROUP_REFERENCE_DATES[group]);
        }
        return null;
    }, [startMethod, manualDate, group]);
    
    const calculateShiftForDate = useCallback((date: Date, cycleStartDate: Date): Shift => {
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const localCycleStart = new Date(cycleStartDate.getFullYear(), cycleStartDate.getMonth(), cycleStartDate.getDate());
        const timeDiff = localDate.getTime() - localCycleStart.getTime();
        const dayDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
        const cycleIndex = (dayDiff % 35 + 35) % 35; // Handles negative differences
        return SHIFT_CYCLE[cycleIndex];
    }, []);


    const generateCalendar = useCallback(() => {
        const cycleStartDate = getStartDate();
        if (!cycleStartDate) {
            alert('Bitte geben Sie ein gültiges Startdatum an.');
            return;
        }
        
        const newCalendarData: CalendarDayData[] = [];
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        
        const birthdaysMap: Record<string, {name: string}> = {};
        birthdays.forEach(b => {
            const key = `${b.month}-${b.day}`;
            birthdaysMap[key] = { name: b.name };
        });

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);
            const dateKey = toISODateString(currentDate);
            const birthdayKey = `${currentDate.getMonth()}-${currentDate.getDate()}`;
            
            newCalendarData.push({
                date: currentDate,
                shift: calculateShiftForDate(currentDate, cycleStartDate),
                event: events[dateKey],
                holiday: holidays[dateKey],
                birthday: birthdaysMap[birthdayKey],
            });
        }
        setCalendarData(newCalendarData);
    }, [getStartDate, year, events, holidays, calculateShiftForDate, birthdays]);

     // Re-generate calendar if dependencies change
    useEffect(() => {
        if (calendarData.length > 0) { // Only regenerate if calendar was already generated
            generateCalendar();
        }
    }, [year, events, holidays, birthdays, generateCalendar, calendarData.length]);

    // --- Event Handlers ---
    const handleDayClick = (date: Date, shift: Shift) => {
        setModalInfo({ date, shift });
    };

    const handleSaveEvent = (dateKey: string, eventData: EventData) => {
        setEvents(prevEvents => {
            const newEvents = { ...prevEvents };
             // An event is valid if it has a note, vacation, or AFZ.
            if (!eventData.note.trim() && !eventData.hasVacation && !eventData.isAfz) {
                delete newEvents[dateKey];
            } else {
                newEvents[dateKey] = eventData;
            }
            return newEvents;
        });
    };

    const handleDeleteEvent = (dateKey: string) => {
        const newEvents = { ...events };
        delete newEvents[dateKey];
        setEvents(newEvents);
    };

    const handleSaveBirthday = (birthday: Birthday) => {
        setBirthdays(prev => {
            const existingIndex = prev.findIndex(b => b.month === birthday.month && b.day === birthday.day);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = birthday;
                return updated;
            }
            return [...prev, birthday];
        });
    };
    
    const handleDeleteBirthday = (date: Date) => {
        const month = date.getMonth();
        const day = date.getDate();
        setBirthdays(prev => prev.filter(b => b.month !== month || b.day !== day));
    };

    
    const handleEditFromList = (date: Date, shift: Shift) => {
       setModalInfo({ date, shift });
    };

    const getShiftForDateForList = useCallback((date: Date): Shift => {
        const cycleStartDate = getStartDate();
        if(!cycleStartDate) return Shift.Frei; // fallback
        return calculateShiftForDate(date, cycleStartDate);
    }, [getStartDate, calculateShiftForDate]);


    return (
        <div className="bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 min-h-screen">
            <div className="container mx-auto p-4 md:p-6 lg:p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 print:hidden">5-Schicht</h1>
                <Header
                    year={year} setYear={setYear}
                    startMethod={startMethod} setStartMethod={setStartMethod}
                    group={group} setGroup={setGroup}
                    manualDate={manualDate} setManualDate={setManualDate}
                    showHolidays={showHolidays} setShowHolidays={setShowHolidays}
                    onGenerate={generateCalendar}
                    isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
                    onOpenSettings={() => setSettingsModalOpen(true)}
                />

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <main className="lg:col-span-2">
                        <Calendar 
                            year={year} 
                            calendarData={calendarData} 
                            onDayClick={handleDayClick}
                            shiftColors={shiftColors}
                            isDarkMode={isDarkMode}
                            weekStartsOnMonday={weekStartsOnMonday}
                        />
                    </main>
                    <aside className="lg:col-span-1 print:hidden">
                        <div className="sticky top-8">
                             <h2 className="text-2xl font-bold mb-4">Meine Einträge</h2>
                            <EventList 
                                events={events} 
                                birthdays={birthdays}
                                year={year}
                                getShiftForDate={getShiftForDateForList} 
                                onEdit={handleEditFromList} 
                                onDelete={handleDeleteEvent}
                            />
                        </div>
                    </aside>
                </div>


                {modalInfo && (
                    <EventModal
                        date={modalInfo.date}
                        shift={modalInfo.shift}
                        event={events[toISODateString(modalInfo.date)]}
                        existingBirthday={birthdays.find(b => b.month === modalInfo.date.getMonth() && b.day === modalInfo.date.getDate())}
                        onSave={handleSaveEvent}
                        onDelete={handleDeleteEvent}
                        onSaveBirthday={handleSaveBirthday}
                        onDeleteBirthday={handleDeleteBirthday}
                        onClose={() => setModalInfo(null)}
                    />
                )}

                {isSettingsModalOpen && (
                    <SettingsModal 
                        currentColors={shiftColors}
                        onSave={setShiftColors}
                        onClose={() => setSettingsModalOpen(false)}
                        weekStartsOnMonday={weekStartsOnMonday}
                        setWeekStartsOnMonday={setWeekStartsOnMonday}
                    />
                )}
            </div>
        </div>
    );
};

export default App;