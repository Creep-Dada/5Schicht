import React, { useState, useEffect } from 'react';
import { Shift, EventData, Birthday } from '../types';
import { TrashIcon, PlusIcon } from './Icons';
import { toISODateString } from '../utils';

interface EventModalProps {
  date: Date;
  shift: Shift;
  event: EventData | undefined;
  existingBirthday: Birthday | undefined;
  onSave: (dateKey: string, eventData: EventData) => void;
  onDelete: (dateKey: string) => void;
  onSaveBirthday: (birthday: Birthday) => void;
  onDeleteBirthday: (date: Date) => void;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ date, shift, event, existingBirthday, onSave, onDelete, onSaveBirthday, onDeleteBirthday, onClose }) => {
  const [note, setNote] = useState('');
  const [hasVacation, setHasVacation] = useState(false);
  const [colleagues, setColleagues] = useState<string[]>(['']);
  const [isAfz, setIsAfz] = useState(false);
  const [isBirthday, setIsBirthday] = useState(false);
  const [birthdayName, setBirthdayName] = useState('');

  const dateKey = toISODateString(date);

  useEffect(() => {
    if (event) {
      setNote(event.note || '');
      setHasVacation(event.hasVacation || false);
      setColleagues(event.colleagues.length > 0 ? event.colleagues : ['']);
      setIsAfz(event.isAfz || false);
    } else {
      setNote('');
      setHasVacation(false);
      setColleagues(['']);
      setIsAfz(false);
    }
    
    if (existingBirthday) {
        setIsBirthday(true);
        setBirthdayName(existingBirthday.name);
    } else {
        setIsBirthday(false);
        setBirthdayName('');
    }
  }, [event, existingBirthday]);

  const handleSave = () => {
    const finalColleagues = colleagues.map(c => c.trim()).filter(c => c !== '');
    
    // On free days, 'colleague vacation' and 'AFZ' are not applicable.
    const isFreeDay = shift === Shift.Frei;

    // Save regular event data, preserving the personal vacation flag
    onSave(dateKey, { 
        note, 
        hasVacation: isFreeDay ? false : hasVacation, 
        colleagues: isFreeDay ? [] : finalColleagues, 
        isAfz: isFreeDay ? false : isAfz,
        isPersonalVacation: event?.isPersonalVacation 
    });
    
    // Save/delete birthday data
    if (isBirthday && birthdayName.trim()) {
      onSaveBirthday({
        month: date.getMonth(),
        day: date.getDate(),
        name: birthdayName.trim(),
      });
    } else if (!isBirthday && existingBirthday) {
      onDeleteBirthday(date);
    }
    
    onClose();
  };

  const handleDelete = () => {
    onDelete(dateKey);
    onClose();
  };

  const handleAddColleague = () => {
    setColleagues([...colleagues, '']);
  };

  const handleColleagueChange = (index: number, value: string) => {
    const newColleagues = [...colleagues];
    newColleagues[index] = value;
    setColleagues(newColleagues);
  };
  
  const handleRemoveColleague = (index: number) => {
    const newColleagues = colleagues.filter((_, i) => i !== index);
    if (newColleagues.length === 0) {
        setColleagues(['']);
    } else {
        setColleagues(newColleagues);
    }
  };
  
  const hasContent = event && (event.note.trim() || event.hasVacation || event.isAfz || event.isPersonalVacation);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 print:hidden" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-2">Eintrag für {date.toLocaleDateString('de-DE')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Schicht: {shift}</p>
        
        {event?.isPersonalVacation && (
          <div className="p-3 mb-4 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 rounded-md text-sm text-center">
            Dieser Tag ist als <strong>persönlicher Urlaub</strong> markiert.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notizen</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>
          
           {shift !== Shift.Frei && (
              <>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        id="vacation"
                        type="checkbox"
                        checked={hasVacation}
                        onChange={(e) => setHasVacation(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="vacation" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">Kollege hat Urlaub</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="afz"
                        type="checkbox"
                        checked={isAfz}
                        onChange={(e) => setIsAfz(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <label htmlFor="afz" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">AFZ</label>
                    </div>
                </div>

                {hasVacation && (
                  <div className="border-t pt-4 mt-4 border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Namen der Kollegen:</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {colleagues.map((colleague, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={colleague}
                            onChange={(e) => handleColleagueChange(index, e.target.value)}
                            placeholder={`Kollege ${index + 1}`}
                            className="flex-grow block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500 text-sm"
                          />
                          <button onClick={() => handleRemoveColleague(index)} className="p-1 text-red-500 hover:text-red-700">
                              <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleAddColleague} className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 dark:hover:text-blue-400">
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Weiteren hinzufügen
                    </button>
                  </div>
                )}
              </>
           )}

          <div className="border-t pt-4 mt-4 border-gray-200 dark:border-gray-700 space-y-3">
             <div className="flex items-center">
                <input
                  id="birthday"
                  type="checkbox"
                  checked={isBirthday}
                  onChange={(e) => setIsBirthday(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <label htmlFor="birthday" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">Jährlicher Geburtstag</label>
              </div>
              {isBirthday && (
                <div>
                     <label htmlFor="birthdayName" className="sr-only">Name des Geburtstagskindes</label>
                     <input
                      id="birthdayName"
                      type="text"
                      value={birthdayName}
                      onChange={(e) => setBirthdayName(e.target.value)}
                      placeholder="Name des Geburtstagskindes"
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                </div>
              )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-between space-x-2">
            <div>
                 {hasContent && <button onClick={handleDelete} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition">Eintrag löschen</button>}
            </div>
            <div className="flex space-x-2">
                <button onClick={onClose} className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition">Abbrechen</button>
                <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition">Speichern</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;