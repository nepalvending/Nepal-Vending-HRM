import React from 'react';
import {
  Employee,
  AttendanceRecord,
  CompanyAnnouncement,
  EmployeeTask,
  PayrollSlip,
  LeaveRequest,
  CompanyLeavePolicy,
} from '../types';
import { BirthdayTrackerWidget } from './BirthdayTrackerWidget';
import { ColleaguesOnLeaveWidget } from './ColleaguesOnLeaveWidget';
import { EmployeeTasksWidget } from './EmployeeTasksWidget';
import { CompanyAnnouncementsWidget } from './CompanyAnnouncementsWidget';
import {
  Clock,
  MapPin,
  Calendar,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Navigation,
  ShieldAlert,
  Edit,
  LogIn,
  ArrowRight,
  Sparkles,
  Wallet,
  Building,
  UserCheck,
} from 'lucide-react';

interface EmployeeDashboardSummaryProps {
  currentEmployee: Employee;
  allEmployees: Employee[];
  attendanceRecords: AttendanceRecord[];
  todayRecord?: AttendanceRecord;
  announcements: CompanyAnnouncement[];
  tasks: EmployeeTask[];
  latestPayslip?: PayrollSlip;
  leaveRequests: LeaveRequest[];
  leavePolicies: CompanyLeavePolicy[];
  onOpenGPSModal: () => void;
  onOpenProfileEditModal: () => void;
  onOpenSelfLoginModal: () => void;
  onOpenSosDrawer: () => void;
  onNavigateTab: (tab: 'dashboard' | 'attendance' | 'leave' | 'payroll' | 'tax') => void;
  onUpdateTaskStatus: (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => void;
  onAddTask: (newTask: Omit<EmployeeTask, 'id' | 'assignedAt'>) => void;
}

export const EmployeeDashboardSummary: React.FC<EmployeeDashboardSummaryProps> = ({
  currentEmployee,
  allEmployees,
  attendanceRecords,
  todayRecord,
  announcements,
  tasks,
  latestPayslip,
  leaveRequests,
  leavePolicies,
  onOpenGPSModal,
  onOpenProfileEditModal,
  onOpenSelfLoginModal,
  onOpenSosDrawer,
  onNavigateTab,
  onUpdateTaskStatus,
  onAddTask,
}) => {
  const isCheckedIn = Boolean(todayRecord?.checkIn);
  const isCheckedOut = Boolean(todayRecord?.checkOut);

  // Total available paid leave days
  const totalPaidLeaveAvailable =
    currentEmployee.leaveBalance.casual +
    currentEmployee.leaveBalance.sick +
    currentEmployee.leaveBalance.annual;

  // Monthly present days count
  const presentDaysCount = attendanceRecords.filter(
    (r) => r.employeeId === currentEmployee.id && r.status !== 'absent' && r.status !== 'on_leave'
  ).length;

  // Total overtime hours
  const totalOtMinutes = attendanceRecords
    .filter((r) => r.employeeId === currentEmployee.id)
    .reduce((acc, curr) => acc + (curr.overtimeMinutes || 0), 0);
  const otHours = (totalOtMinutes / 60).toFixed(1);

  return (
    <div id="employee-dashboard-summary" className="space-y-6">
      {/* Top Welcome & Identity Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative group cursor-pointer" onClick={onOpenProfileEditModal}>
            <img
              src={currentEmployee.avatar}
              alt={currentEmployee.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-300 shadow-md transition-transform group-hover:scale-105"
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white shadow-xs">
              <Edit className="w-3 h-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                Namaste, {currentEmployee.name.split(' ')[0]}! 🙏
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                {currentEmployee.employeeCode}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white capitalize">
                {currentEmployee.role}
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-0.5">
              {currentEmployee.designation} • {currentEmployee.department}
            </p>
            <p className="text-[11px] text-emerald-200/80 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              <span>शनिबार, ३ असोज २०८१ (Saturday, 19 Sep 2026)</span>
            </p>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={onOpenProfileEditModal}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Profile
          </button>

          <button
            type="button"
            onClick={onOpenSosDrawer}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md animate-pulse"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Emergency SOS
          </button>

          <button
            type="button"
            onClick={onOpenSelfLoginModal}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-300 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            Switch Staff
          </button>
        </div>
      </div>

      {/* Live Check-In / Check-Out Status & GPS Geofence Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`p-3 rounded-2xl ${
              isCheckedIn && !isCheckedOut
                ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                : isCheckedOut
                ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            <Navigation className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isCheckedIn && !isCheckedOut
                    ? 'bg-emerald-100 text-emerald-800'
                    : isCheckedOut
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isCheckedIn && !isCheckedOut
                  ? 'Active Shift (Checked In)'
                  : isCheckedOut
                  ? 'Shift Completed (Checked Out)'
                  : 'Awaiting Check-In'}
              </span>

              <span className="text-[11px] text-slate-500 font-mono">
                Office Geofence: Putalisadak HQ
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-slate-700">
              <span className="font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Punch In: <b className="font-mono text-slate-900">{todayRecord?.checkIn || '--:--'}</b>
              </span>
              <span>•</span>
              <span className="font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Punch Out: <b className="font-mono text-slate-900">{todayRecord?.checkOut || '--:--'}</b>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={onOpenGPSModal}
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <MapPin className="w-3.5 h-3.5" />
            {isCheckedIn && !isCheckedOut ? 'GPS Check-Out / Field Punch' : 'GPS Check-In Punch'}
          </button>
        </div>
      </div>

      {/* 4 Essential KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Available Paid Leave */}
        <div
          onClick={() => onNavigateTab('leave')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-xs cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Remaining Paid Leave</span>
            <Calendar className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {totalPaidLeaveAvailable} <span className="text-xs font-medium text-slate-500">days</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            Casual {currentEmployee.leaveBalance.casual}d • Sick {currentEmployee.leaveBalance.sick}d • Annual {currentEmployee.leaveBalance.annual}d
          </p>
        </div>

        {/* Present Days */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-xs cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Present Days (Month)</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {presentDaysCount} <span className="text-xs font-medium text-slate-500">/ 20 days</span>
          </p>
          <p className="text-[11px] text-blue-700 font-semibold mt-1">
            Regular Shift: 09:00 - 17:00
          </p>
        </div>

        {/* Overtime Earned */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 shadow-xs cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Overtime Recorded</span>
            <TrendingUp className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {otHours} <span className="text-xs font-medium text-slate-500">hours</span>
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">
            1.5x Hourly Rate Multiplier
          </p>
        </div>

        {/* Latest Payslip Net Take-Home */}
        <div
          onClick={() => onNavigateTab('payroll')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 shadow-xs cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Latest Net Take-Home</span>
            <Wallet className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            NPR {latestPayslip ? (latestPayslip.netPay / 1000).toFixed(1) + 'k' : '55.0k'}
          </p>
          <p className="text-[11px] text-teal-700 font-semibold mt-1 flex items-center gap-1">
            <span>Bhadra 2081 Disbursed</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Birthday Celebration Tracker Banner */}
      <BirthdayTrackerWidget
        employees={allEmployees}
        currentEmployee={currentEmployee}
        referenceDateStr="2026-09-19"
      />

      {/* Colleagues on Leave Today Notice (Visible to all employees) */}
      <ColleaguesOnLeaveWidget
        employees={allEmployees}
        leaveRequests={leaveRequests}
        currentDateStr="2026-09-19"
      />

      {/* Assigned Tasks & Announcements Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Assigned to Employee */}
        <EmployeeTasksWidget
          tasks={tasks}
          currentEmployee={currentEmployee}
          onUpdateTaskStatus={onUpdateTaskStatus}
          onAddTask={onAddTask}
        />

        {/* Company Announcements Feed */}
        <CompanyAnnouncementsWidget
          announcements={announcements}
          canPublish={currentEmployee.role === 'manager' || currentEmployee.role === 'admin'}
        />
      </div>

      {/* Latest Payslip Breakdown Snapshot Card */}
      {latestPayslip && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Latest Salary Slip Snapshot ({latestPayslip.month})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Pay Period: {latestPayslip.payPeriod} • PAN: {latestPayslip.panNumber}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('payroll')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              View Full Slip & PDF <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-[11px] text-slate-500">Gross Earnings</p>
              <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                NPR {latestPayslip.grossEarnings.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">SSF Employee (11%)</p>
              <p className="text-sm font-bold text-rose-700 font-mono mt-0.5">
                -NPR {latestPayslip.ssfEmployee.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Income Tax TDS</p>
              <p className="text-sm font-bold text-rose-700 font-mono mt-0.5">
                -NPR {latestPayslip.incomeTaxTDS.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Net Take-Home Pay</p>
              <p className="text-base font-black text-emerald-800 font-mono mt-0.5">
                NPR {latestPayslip.netPay.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
