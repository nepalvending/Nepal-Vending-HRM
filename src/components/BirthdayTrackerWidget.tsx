import React, { useState } from 'react';
import { Employee } from '../types';
import { getUpcomingBirthdays, BirthdayItem } from '../utils/geoAndSocial';
import confetti from 'canvas-confetti';
import {
  Cake,
  Gift,
  Sparkles,
  Heart,
  PartyPopper,
  Calendar,
  Send,
  Check,
} from 'lucide-react';

interface BirthdayTrackerWidgetProps {
  employees: Employee[];
  currentEmployee?: Employee;
  referenceDateStr?: string;
  compact?: boolean;
}

export const BirthdayTrackerWidget: React.FC<BirthdayTrackerWidgetProps> = ({
  employees,
  currentEmployee,
  referenceDateStr = '2026-09-19',
  compact = false,
}) => {
  const [wishedEmployees, setWishedEmployees] = useState<{ [empId: string]: boolean }>({});
  const birthdayList: BirthdayItem[] = getUpcomingBirthdays(employees, referenceDateStr);

  const todaysBirthdays = birthdayList.filter((b) => b.isToday);
  const upcomingBirthdays = birthdayList.filter((b) => !b.isToday).slice(0, 4);

  const handleSendWish = (emp: Employee) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setWishedEmployees((prev) => ({ ...prev, [emp.id]: true }));
  };

  return (
    <div id="birthday-tracker-widget" className="space-y-3">
      {/* Today's Birthday Banner (Celebration Mode) */}
      {todaysBirthdays.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 p-4 text-white shadow-md">
          {/* Subtle decorative sparkles */}
          <div className="absolute -top-4 -right-4 opacity-20 pointer-events-none">
            <PartyPopper className="w-32 h-32" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md shrink-0 shadow-inner">
                <Cake className="w-6 h-6 text-yellow-200 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-white/30 text-white">
                    Today's Birthday! 🎂
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                </div>
                <h4 className="text-sm sm:text-base font-black tracking-tight mt-0.5">
                  {todaysBirthdays.map((b) => b.employee.name).join(', ')}
                </h4>
                <p className="text-xs text-rose-100">
                  {todaysBirthdays.map((b) => `${b.employee.designation} (${b.employee.department})`).join(' • ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {todaysBirthdays.map((b) => {
                const hasWished = wishedEmployees[b.employee.id];
                return (
                  <button
                    key={b.employee.id}
                    type="button"
                    onClick={() => handleSendWish(b.employee)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                      hasWished
                        ? 'bg-white text-emerald-800'
                        : 'bg-white text-rose-700 hover:bg-yellow-100 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {hasWished ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Wish Sent! 🎉
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Birthday Wish 🎈
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Birthdays List */}
      {!compact && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-rose-500" />
              Upcoming Team Birthdays (This Month)
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              {birthdayList.length} colleagues tracked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {upcomingBirthdays.map((b) => {
              const isCurrentUser = currentEmployee ? b.employee.id === currentEmployee.id : false;
              return (
                <div
                  key={b.employee.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                    isCurrentUser
                      ? 'bg-pink-50/70 border-pink-200'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={b.employee.avatar}
                      alt={b.employee.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        {b.employee.name}
                        {isCurrentUser && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-pink-200 text-pink-800">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {b.nepaliBirthMonth} • {b.employee.designation}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono">
                      In {b.daysUntil} days
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {b.nextBirthdayDateStr}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
