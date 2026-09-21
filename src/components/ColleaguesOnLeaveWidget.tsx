import React from 'react';
import { Employee, LeaveRequest } from '../types';
import { getEmployeesOnLeaveToday, ColleagueOnLeave } from '../utils/geoAndSocial';
import {
  UserMinus,
  CalendarCheck,
  Building,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ColleaguesOnLeaveWidgetProps {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  currentDateStr?: string;
}

export const ColleaguesOnLeaveWidget: React.FC<ColleaguesOnLeaveWidgetProps> = ({
  employees,
  leaveRequests,
  currentDateStr = '2026-09-19',
}) => {
  const onLeaveList: ColleagueOnLeave[] = getEmployeesOnLeaveToday(
    employees,
    leaveRequests,
    currentDateStr
  );

  return (
    <div id="colleagues-on-leave-widget" className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
            <UserMinus className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Colleagues on Leave Today
            </h4>
            <p className="text-[11px] text-slate-500">
              Approved out-of-office team notice visible to all staff
            </p>
          </div>
        </div>

        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
            onLeaveList.length > 0
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {onLeaveList.length > 0 ? `${onLeaveList.length} On Leave` : 'Full Attendance'}
        </span>
      </div>

      {onLeaveList.length === 0 ? (
        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Everyone is scheduled on duty today. No approved leaves active.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {onLeaveList.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-amber-200/90 bg-amber-50/40 hover:bg-amber-50 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.employee.avatar}
                  alt={item.employee.name}
                  className="w-10 h-10 rounded-full object-cover border border-amber-300 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                    {item.employee.name}
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                      {item.employee.employeeCode}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {item.employee.department}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                      {item.leaveRequest.leaveType}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({item.leaveRequest.daysCount} days)
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 justify-end">
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Back {item.returnDate}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Handover active
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
