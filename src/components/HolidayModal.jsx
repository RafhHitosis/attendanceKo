import React, { useState } from "react";
import { X, Calendar, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function HolidayModal({
  isOpen,
  onClose,
  customHolidays,
  addHoliday,
  removeHoliday,
}) {
  const [date, setDate] = useState("");
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (date && name) {
      addHoliday(date, name);
      setDate("");
      setName("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold">Manage Custom Holidays</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 mb-6"
          >
            <input
              type="date"
              required
              className="h-10 border border-slate-300 rounded-md px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-40"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <input
              type="text"
              placeholder="Holiday Name (e.g. Holy Week)"
              required
              className="flex-1 h-10 w-0 border border-slate-300 rounded-md px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              type="submit"
              className="h-10 w-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase border-b border-slate-200 bg-slate-100">
              Custom Holidays List
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {customHolidays.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic text-sm">
                  No custom holidays added yet.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {customHolidays.map((holiday) => (
                    <li
                      key={holiday.id}
                      className="flex items-center justify-between p-3 hover:bg-white transition-colors group"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 text-sm">
                          {holiday.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(holiday.date), "MMMM d, yyyy")}
                        </span>
                      </div>
                      <button
                        onClick={() => removeHoliday(holiday.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                        title="Remove Holiday"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
