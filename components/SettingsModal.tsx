import React, { useState } from 'react';
import { Shift } from '../types';
import { DEFAULT_SHIFT_COLORS } from '../constants';
import { ChevronDownIcon } from './Icons';

type ShiftColors = Record<Shift, {light: string, dark: string}>;

interface SettingsModalProps {
  currentColors: ShiftColors;
  onSave: (newColors: ShiftColors) => void;
  onClose: () => void;
  weekStartsOnMonday: boolean;
  setWeekStartsOnMonday: (value: boolean) => void;
  isLargeText: boolean;
  setIsLargeText: (value: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ currentColors, onSave, onClose, weekStartsOnMonday, setWeekStartsOnMonday, isLargeText, setIsLargeText }) => {
  const [colors, setColors] = useState<ShiftColors>(currentColors);

  const handleColorChange = (shift: Shift, theme: 'light' | 'dark', value: string) => {
    setColors(prev => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        [theme]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(colors);
    onClose();
  };
  
  const handleReset = () => {
      setColors(DEFAULT_SHIFT_COLORS);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 print:hidden" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-6">Einstellungen</h2>
        
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <label htmlFor="week-start-toggle" className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Woche beginnt am Montag
                </label>
                <button
                    id="week-start-toggle"
                    onClick={() => setWeekStartsOnMonday(!weekStartsOnMonday)}
                    className={`${weekStartsOnMonday ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    role="switch"
                    aria-checked={weekStartsOnMonday}
                >
                    <span className={`${weekStartsOnMonday ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </button>
            </div>

            <div className="flex items-center justify-between">
                <label htmlFor="large-text-toggle" className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Schrift vergrößern
                </label>
                <button
                    id="large-text-toggle"
                    onClick={() => setIsLargeText(!isLargeText)}
                    className={`${isLargeText ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    role="switch"
                    aria-checked={isLargeText}
                >
                    <span className={`${isLargeText ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </button>
            </div>
            
            <details className="group border-t border-gray-200 dark:border-gray-700 pt-4">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-700 dark:text-gray-300">
                    <span>Farbeinstellungen</span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                        <ChevronDownIcon />
                    </span>
                </summary>
                <div className="mt-4 space-y-4">
                    {(Object.keys(colors) as Shift[]).map(shift => (
                        <div key={shift} className="grid grid-cols-[1fr,auto,auto] items-center gap-4">
                        <span className="font-medium">{shift}</span>
                        <div className="flex items-center gap-2">
                            <label htmlFor={`${shift}-light`} className="text-sm text-gray-500 dark:text-gray-400">Hell:</label>
                            <input
                                id={`${shift}-light`}
                                type="color"
                                value={colors[shift].light}
                                onChange={(e) => handleColorChange(shift, 'light', e.target.value)}
                                className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor={`${shift}-dark`} className="text-sm text-gray-500 dark:text-gray-400">Dunkel:</label>
                            <input
                                id={`${shift}-dark`}
                                type="color"
                                value={colors[shift].dark}
                                onChange={(e) => handleColorChange(shift, 'dark', e.target.value)}
                                className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent"
                            />
                        </div>
                        </div>
                    ))}
                </div>
            </details>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button onClick={handleReset} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition">Zurücksetzen</button>
          <div className="flex space-x-2">
            <button onClick={onClose} className="bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition">Schließen</button>
            <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition">Speichern</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;