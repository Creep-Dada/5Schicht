import React, { useState } from 'react';
import { GROUP_REFERENCE_DATES } from '../constants';
import { SunIcon, MoonIcon, CogIcon } from './Icons';

interface HeaderProps {
    year: number;
    setYear: (year: number) => void;
    startMethod: 'group' | 'manual';
    setStartMethod: (method: 'group' | 'manual') => void;
    group: string;
    setGroup: (group: string) => void;
    manualDate: string;
    setManualDate: (date: string) => void;
    showHolidays: boolean;
    setShowHolidays: (show: boolean) => void;
    onGenerate: () => void;
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
    onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({
    year, setYear, startMethod, setStartMethod, group, setGroup, manualDate, setManualDate,
    showHolidays, setShowHolidays, onGenerate, isDarkMode, setIsDarkMode, onOpenSettings
}) => {
    const [isManualInputFocused, setIsManualInputFocused] = useState(false);

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 rounded-lg mb-6 print:hidden">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
                {/* Left Side: Configuration */}
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label htmlFor="year-select" className="mb-1 block font-medium text-sm text-gray-700 dark:text-gray-300">Jahr</label>
                        <input
                            id="year-select"
                            type="number"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
                            className="p-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <span className="mb-1 block font-medium text-sm text-gray-700 dark:text-gray-300">Startmethode</span>
                        <div className="flex space-x-4 h-10 items-center rounded-md bg-gray-100 dark:bg-gray-700 p-1">
                            <label className={`flex items-center px-3 py-1 rounded-md cursor-pointer ${startMethod === 'group' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>
                                <input type="radio" name="startMethod" value="group" checked={startMethod === 'group'} onChange={() => setStartMethod('group')} className="sr-only" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gruppe</span>
                            </label>
                            <label className={`flex items-center px-3 py-1 rounded-md cursor-pointer ${startMethod === 'manual' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>
                                <input type="radio" name="startMethod" value="manual" checked={startMethod === 'manual'} onChange={() => setStartMethod('manual')} className="sr-only" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manuell</span>
                            </label>
                        </div>
                    </div>
                     <div>
                        {startMethod === 'group' ? (
                             <>
                                <label htmlFor="group-select" className="mb-1 block font-medium text-sm text-gray-700 dark:text-gray-300">Gruppe</label>
                                <select
                                    id="group-select"
                                    value={group}
                                    onChange={(e) => setGroup(e.target.value)}
                                    className="p-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                >
                                    {Object.keys(GROUP_REFERENCE_DATES).map(g => (
                                        <option key={g} value={g}>Gruppe {g}</option>
                                    ))}
                                </select>
                             </>
                        ) : (
                             <>
                                <label htmlFor="manual-date" className="mb-1 block font-medium text-sm text-gray-700 dark:text-gray-300">Startdatum</label>
                                <input
                                    id="manual-date"
                                    type={isManualInputFocused || manualDate ? 'date' : 'text'}
                                    value={manualDate}
                                    placeholder="Erste Frühschicht von 4 eingeben"
                                    onFocus={() => setIsManualInputFocused(true)}
                                    onBlur={() => setIsManualInputFocused(false)}
                                    onChange={(e) => setManualDate(e.target.value)}
                                    className="p-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                />
                             </>
                        )}
                    </div>
                </div>

                {/* Right Side: Actions & Toggles */}
                <div className="flex flex-col items-stretch lg:items-end gap-4">
                    <button
                        onClick={onGenerate}
                        className="w-full lg:w-auto bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                        Kalender erstellen
                    </button>
                    <div className="flex items-center justify-between lg:justify-end gap-4 border-t dark:border-gray-700 lg:border-none pt-4 lg:pt-0">
                         <div className="flex items-center">
                            <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">Feiertage</span>
                            <button
                                onClick={() => setShowHolidays(!showHolidays)}
                                className={`${showHolidays ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                role="switch"
                                aria-checked={showHolidays}
                                aria-label="Feiertage anzeigen oder verbergen"
                            >
                                <span className={`${showHolidays ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                            </button>
                        </div>
                        <div className="flex items-center space-x-1">
                             <button onClick={() => window.print()} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" aria-label="Drucken">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" /></svg>
                            </button>
                            <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" aria-label="Einstellungen">
                                <CogIcon />
                            </button>
                             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" aria-label="Toggle Dark Mode">
                                {isDarkMode ? <SunIcon /> : <MoonIcon />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;