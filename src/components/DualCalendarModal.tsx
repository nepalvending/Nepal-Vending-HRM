import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  X,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Sun,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  adToBs,
  formatDualDate,
  toNepaliNumerals,
  NEP_MONTHS_NP,
  NEP_MONTHS_EN,
  NEP_DAYS_SHORT_NP,
} from '../utils/nepaliCalendar';

interface DualCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DualCalendarModal: React.FC<DualCalendarModalProps> = ({ isOpen, onClose }) => {
  const [selectedAdDate, setSelectedAdDate] = useState('2026-09-19');
  const todayDetail = adToBs(selectedAdDate);

  // Month view simulation for current BS month (Ashwin 2083)
  const currentBsYear = todayDetail.year;
  const currentBsMonth = todayDetail.month;
  const monthNameNp = todayDetail.monthNameNp;
  const monthNameEn = todayDetail.monthNameEn;

  // Days in this month (31 days)
  const totalDays = 31;
  // Starting day of week for 1 Ashwin 2083 (Thursday -> index 4)
  const startDayIndex = 4;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-rose-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">
                  नेपाली पात्रो (Bikram Sambat BS & AD Calendar)
                </h2>
              </div>
              <p className="text-xs text-rose-200">
                Official Nepal Vending dual Bikram Sambat (वि.सं.) and Gregorian (ई.सं.) calendar
              </p>
            </div>
          </div>
          <button
            id="close-calendar-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Today's Dual Spotlight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 border border-rose-200/80 text-center">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
              आजको मिति • Today's Date in BS & AD
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {todayDetail.formattedBSFullNp}
            </div>
            <div className="text-sm font-bold text-rose-700 font-mono mt-0.5">
              वि.सं. {todayDetail.formattedBS} BS
            </div>
            <div className="mt-2 pt-2 border-t border-rose-200/60 flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
              <span>ई.सं. (Gregorian AD):</span>
              <span className="font-mono font-bold text-slate-900">
                Saturday, September 19, 2026 AD
              </span>
            </div>
          </div>

          {/* Dual Date Converter Input */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-rose-600" />
              <span>Convert any AD Date to Bikram Sambat (BS)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedAdDate}
                onChange={(e) => setSelectedAdDate(e.target.value)}
                className="flex-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2"
              />
              <button
                type="button"
                onClick={() => setSelectedAdDate('2026-09-19')}
                className="px-3 py-2 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700"
              >
                Today
              </button>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between">
              <span className="text-slate-600 font-medium">Bikram Sambat Result:</span>
              <span className="font-bold text-rose-700">
                {todayDetail.formattedBSFullNp} ({todayDetail.formattedBS} BS)
              </span>
            </div>
          </div>

          {/* Month Calendar Grid (Ashwin 2083 / September-October 2026) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {monthNameNp} {toNepaliNumerals(currentBsYear)} वि.सं.
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  ({monthNameEn} {currentBsYear} BS • Sep/Oct 2026 AD)
                </span>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                शनिबार: सार्वजनिक विदा (Weekly Rest)
              </span>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs mb-1">
              {NEP_DAYS_SHORT_NP.map((d, i) => (
                <div
                  key={d}
                  className={`py-1 rounded text-[11px] ${
                    i === 6 ? 'text-rose-600 bg-rose-50 font-bold' : 'text-slate-600'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {/* Empty leading cells */}
              {Array.from({ length: startDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="p-1.5 h-10"></div>
              ))}

              {/* Days 1 to 31 */}
              {Array.from({ length: totalDays }).map((_, idx) => {
                const dayNum = idx + 1;
                const isSelected = dayNum === todayDetail.day;
                const isSaturday = (startDayIndex + idx) % 7 === 6;

                // Corresponding AD day in Sep/Oct
                const adDayNum = 16 + idx;
                const adLabel = adDayNum <= 30 ? `${adDayNum} Sep` : `${adDayNum - 30} Oct`;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => {
                      const adStr =
                        adDayNum <= 30
                          ? `2026-09-${adDayNum.toString().padStart(2, '0')}`
                          : `2026-10-${(adDayNum - 30).toString().padStart(2, '0')}`;
                      setSelectedAdDate(adStr);
                    }}
                    className={`h-11 p-0.5 rounded-lg border flex flex-col items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs'
                        : isSaturday
                        ? 'bg-rose-50/70 border-rose-200 text-rose-700 hover:bg-rose-100'
                        : 'bg-white border-slate-100 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold">{toNepaliNumerals(dayNum)}</span>
                    <span
                      className={`text-[8px] font-mono leading-none ${
                        isSelected ? 'text-rose-100' : 'text-slate-400'
                      }`}
                    >
                      {adLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>नेपाल सरकार राष्ट्रिय क्यालेण्डर प्रमाणीकरण</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-black"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
