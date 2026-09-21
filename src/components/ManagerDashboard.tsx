import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Users,
  HardDrive,
  Filter,
  Search,
  MessageSquare,
  AlertTriangle,
  Zap,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Eye,
  EyeOff,
  Power,
  Smartphone,
  Calculator,
  Download,
  CalendarDays,
  RefreshCw,
  Coins,
  ShieldAlert,
  Percent,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  HikvisionDevice,
  ShiftConfig,
  AutomatedOvertimeSettings,
  PayrollSlip,
  TaxReport,
  CompanyLeavePolicy,
  CompanyAnnouncement,
  EmployeeTask,
} from '../types';
import { formatMinutes } from '../utils/overtimeCalculator';
import { adToBs, toNepaliNumerals } from '../utils/nepaliCalendar';
import { AttendanceTrendChart } from './AttendanceTrendChart';
import { AutomatedOvertimeManager } from './AutomatedOvertimeManager';
import { CompanyLeavePolicyManager } from './CompanyLeavePolicyManager';
import { BirthdayTrackerWidget } from './BirthdayTrackerWidget';
import { ColleaguesOnLeaveWidget } from './ColleaguesOnLeaveWidget';
import {
  calculateEmployeeLeaveAccrual,
  exportPayrollsToCSV,
  generateFiscalYearAccrualSchedule,
} from '../utils/payrollCalculator';

interface ManagerDashboardProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  devices: HikvisionDevice[];
  shifts: ShiftConfig[];
  overtimeSettings: AutomatedOvertimeSettings;
  payrollSlips?: PayrollSlip[];
  leavePolicies?: CompanyLeavePolicy[];
  announcements?: CompanyAnnouncement[];
  tasks?: EmployeeTask[];
  onUpdatePolicy?: (policy: CompanyLeavePolicy) => void;
  onUpdateEmployeeLeaveBalance?: (empId: string, balances: Employee['leaveBalance']) => void;
  onUpdateOvertimeSettings: (newSettings: Partial<AutomatedOvertimeSettings>) => void;
  onApproveLeave: (leaveId: string, managerRemark: string) => void;
  onRejectLeave: (leaveId: string, managerRemark: string) => void;
  onApproveOvertime: (recordId: string) => void;
  onOpenHikvisionModal: () => void;
  onOpenOvertimeModal: () => void;
  onSwitchToMobilePreview?: () => void;
  onViewDocument?: (type: 'payslip' | 'tax', payroll?: PayrollSlip, taxReport?: TaxReport) => void;
  onRecalculatePayroll?: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  employees,
  attendanceRecords,
  leaveRequests,
  devices,
  shifts,
  overtimeSettings,
  payrollSlips = [],
  leavePolicies = [],
  announcements = [],
  tasks = [],
  onUpdatePolicy,
  onUpdateEmployeeLeaveBalance,
  onUpdateOvertimeSettings,
  onApproveLeave,
  onRejectLeave,
  onApproveOvertime,
  onOpenHikvisionModal,
  onOpenOvertimeModal,
  onSwitchToMobilePreview,
  onViewDocument,
  onRecalculatePayroll,
}) => {
  const [activeTab, setActiveTab] = useState<'leaves' | 'attendance' | 'trends' | 'overtime' | 'payroll' | 'policies'>('leaves');
  const [leaveFilter, setLeaveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [payrollSearch, setPayrollSearch] = useState('');
  const [showAccrualScheduleManager, setShowAccrualScheduleManager] = useState(false);
  const [showChartInAttendance, setShowChartInAttendance] = useState(false);
  const [reviewRemarks, setReviewRemarks] = useState<{ [key: string]: string }>({});

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');
  const approvedLeaves = leaveRequests.filter((l) => l.status === 'approved');
  const rejectedLeaves = leaveRequests.filter((l) => l.status === 'rejected');

  const filteredLeaves = leaveRequests.filter((l) => {
    if (leaveFilter === 'all') return true;
    return l.status === leaveFilter;
  });

  // Calculate stats for today
  const todayStr = '2026-09-19';
  const todayAttendances = attendanceRecords.filter((a) => a.date === todayStr);
  const presentCount = todayAttendances.length;
  const lateCount = todayAttendances.filter((a) => a.status === 'late').length;

  // Overtime calculations
  const totalOtMinutes = attendanceRecords.reduce((acc, curr) => acc + (curr.overtimeMinutes || 0), 0);
  const totalOtNPR = attendanceRecords.reduce((acc, curr) => acc + (curr.overtimePayNPR || 0), 0);
  const pendingOtRecords = attendanceRecords.filter((a) => a.overtimeMinutes > 0);

  const handleApprove = (leaveId: string) => {
    const remark = reviewRemarks[leaveId] || 'Approved by HR & Operations Management.';
    onApproveLeave(leaveId, remark);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleReject = (leaveId: string) => {
    const remark = reviewRemarks[leaveId] || 'Leave request could not be approved due to critical staffing schedule.';
    onRejectLeave(leaveId, remark);
  };

  const [otToggleFeedback, setOtToggleFeedback] = useState<string | null>(null);

  const handleToggleAutoOT = () => {
    const nextState = !overtimeSettings.isMobileOvertimeEnabled;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    onUpdateOvertimeSettings({
      isMobileOvertimeEnabled: nextState,
      updatedAt: `Today at ${timeStr}`,
    });
    setOtToggleFeedback(
      nextState
        ? 'Auto OT is now SHOWN in Employee Mobile App (staff can view shift OT & earnings).'
        : 'Auto OT is now TURNED OFF. Employee app will NOT show OT manager or OT tracking.'
    );
    setTimeout(() => {
      setOtToggleFeedback(null);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Show Auto OT Control Bar */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
          overtimeSettings.isMobileOvertimeEnabled
            ? 'bg-gradient-to-r from-emerald-50/80 via-white to-indigo-50/50 border-emerald-200'
            : 'bg-gradient-to-r from-slate-50 via-white to-amber-50/60 border-slate-300'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                overtimeSettings.isMobileOvertimeEnabled
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Show Auto OT in Employee App
                </h2>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    overtimeSettings.isMobileOvertimeEnabled
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  {overtimeSettings.isMobileOvertimeEnabled ? 'VISIBLE (ON)' : 'HIDDEN (OFF)'}
                </span>
                {overtimeSettings.updatedAt && (
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    Updated {overtimeSettings.updatedAt}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                {overtimeSettings.isMobileOvertimeEnabled
                  ? 'Active: Staff can view their automated shift overtime accruals, hours, and extra pay on their mobile app.'
                  : 'Turned OFF: Employee app does NOT show OT manager, OT accrued hours, or overtime tags. Staff view clean attendance only.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* The Main Requested Toggle Button */}
            <button
              id="dashboard-show-auto-ot-toggle-btn"
              type="button"
              onClick={handleToggleAutoOT}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                overtimeSettings.isMobileOvertimeEnabled
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              {overtimeSettings.isMobileOvertimeEnabled ? (
                <>
                  <EyeOff className="w-4 h-4 text-rose-300" />
                  <span>Turn OFF (Hide OT in Employee App)</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-emerald-200" />
                  <span>Turn ON (Show Auto OT in Employee App)</span>
                </>
              )}
            </button>

            {onSwitchToMobilePreview && (
              <button
                id="dashboard-preview-employee-app-btn"
                type="button"
                onClick={onSwitchToMobilePreview}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                title="Verify how the employee mobile app looks"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                <span>Preview Employee App</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Feedback Notification Banner when toggled */}
        {otToggleFeedback && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center gap-2 text-xs font-medium text-slate-700 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{otToggleFeedback}</span>
          </div>
        )}
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Leaves Card */}
        <div
          onClick={() => setActiveTab('leaves')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Pending Leave Approvals
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {pendingLeaves.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Requires manager review & sign-off
          </p>
        </div>

        {/* Staff Present Today */}
        <div
          onClick={() => setActiveTab('trends')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Present Today (Hikvision)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono flex items-baseline gap-1.5">
            <span>{presentCount}</span>
            <span className="text-xs font-normal text-slate-500">/ {employees.length} staff</span>
            <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {Math.round((presentCount / (employees.length || 1)) * 100)}% Today
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>{lateCount > 0 ? `${lateCount} checked in late` : 'All check-ins on schedule'}</span>
            <span className="text-[10px] text-rose-600 font-bold group-hover:underline">View 30-Day Trends →</span>
          </p>
        </div>

        {/* Automated Overtime Accrued */}
        <div
          onClick={() => setActiveTab('overtime')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-400 cursor-pointer transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                Automated Overtime
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleAutoOT();
                  }}
                  title="Click to toggle Auto OT on/off for employee mobile app"
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                    overtimeSettings.isMobileOvertimeEnabled
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  OT: {overtimeSettings.isMobileOvertimeEnabled ? 'ON' : 'OFF'}
                </button>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
              {(totalOtMinutes / 60).toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-500">hrs</span>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-indigo-700 font-medium">रू {totalOtNPR.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 font-semibold group-hover:underline">
              {overtimeSettings.isMobileOvertimeEnabled ? 'Shown in App →' : 'Hidden in App →'}
            </span>
          </div>
        </div>

        {/* Hikvision Biometric Terminals Status */}
        <div
          onClick={onOpenHikvisionModal}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-rose-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Hikvision Terminals
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {devices.filter((d) => d.status === 'online').length} / {devices.length}{' '}
            <span className="text-xs font-semibold text-emerald-600">Online</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ISAPI Direct & CSV sync ready
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 pt-3 gap-2">
          <button
            id="tab-manager-leaves"
            type="button"
            onClick={() => setActiveTab('leaves')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-colors relative ${
              activeTab === 'leaves'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Leave Requests Approval</span>
            {pendingLeaves.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {pendingLeaves.length}
              </span>
            )}
          </button>

          <button
            id="tab-manager-attendance"
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'attendance'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Attendance & Terminal Logs</span>
          </button>

          <button
            id="tab-manager-trends"
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'trends'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>30-Day Trends (Ratio)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">
              Recharts
            </span>
          </button>

          <button
            id="tab-manager-overtime"
            type="button"
            onClick={() => setActiveTab('overtime')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'overtime'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Automated Overtime Manager</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                overtimeSettings.isMobileOvertimeEnabled
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Mobile: {overtimeSettings.isMobileOvertimeEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            id="tab-manager-payroll"
            type="button"
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'payroll'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Automated Payroll & Leave Engine</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded font-mono bg-rose-100 text-rose-800">
              1st & 18th Rule
            </span>
          </button>

          <button
            id="tab-manager-policies"
            type="button"
            onClick={() => setActiveTab('policies')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'policies'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Leave Policy & Quota Manager</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded font-mono bg-emerald-100 text-emerald-800">
              Company Policy
            </span>
          </button>
        </div>

        {/* TAB 1: Leave Requests Approval Queue */}
        {activeTab === 'leaves' && (
          <div className="p-6 space-y-6">
            {/* Real-time Workforce Availability & Celebrations Overview */}
            <div className="space-y-4">
              <ColleaguesOnLeaveWidget
                employees={employees}
                leaveRequests={leaveRequests}
                currentDateStr="2026-09-19"
              />
              <BirthdayTrackerWidget
                employees={employees}
                referenceDateStr="2026-09-19"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Employee Leave Approval Workflow
                </h3>
                <p className="text-[11px] text-slate-500">
                  Review staff applications, check leave balance, and approve or decline with remarks
                </p>
              </div>

              {/* Filter pills */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLeaveFilter('pending')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    leaveFilter === 'pending'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending ({pendingLeaves.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLeaveFilter('approved')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    leaveFilter === 'approved'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Approved ({approvedLeaves.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLeaveFilter('rejected')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    leaveFilter === 'rejected'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rejected ({rejectedLeaves.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLeaveFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    leaveFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({leaveRequests.length})
                </button>
              </div>
            </div>

            {filteredLeaves.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No leave requests in this category.</p>
                <p className="text-xs text-slate-400">All submissions are up to date!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLeaves.map((lev) => {
                  const emp = employees.find((e) => e.id === lev.employeeId);
                  const isPending = lev.status === 'pending';

                  return (
                    <div
                      key={lev.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isPending
                          ? 'border-amber-200 bg-amber-50/20 shadow-sm'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        {/* Employee Details */}
                        <div className="flex items-start gap-3">
                          <img
                            src={emp?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={lev.employeeName}
                            className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {lev.employeeName}
                              </span>
                              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-semibold">
                                {lev.employeeCode}
                              </span>
                              <span className="text-xs text-slate-500">• {lev.department}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="font-bold text-xs text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md">
                                {lev.leaveType}
                              </span>
                              <span className="text-xs font-bold text-slate-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                {adToBs(lev.startDate).day} {adToBs(lev.startDate).monthNameNp} - {adToBs(lev.endDate).day} {adToBs(lev.endDate).monthNameNp} {adToBs(lev.endDate).year} BS
                              </span>
                              <span className="text-xs font-medium text-slate-500 font-mono">
                                ({lev.startDate} to {lev.endDate} AD • {lev.daysCount} working days)
                              </span>
                            </div>

                            {/* 1st & 18th Accrual Rule Quota Status */}
                            {emp && (() => {
                              const accrual = calculateEmployeeLeaveAccrual(emp, leaveRequests, '2026-09-19');
                              const willExceed = isPending && lev.daysCount > accrual.remainingLeaveBalance;
                              const excessDays = willExceed ? lev.daysCount - accrual.remainingLeaveBalance : 0;
                              const dailyRate = Math.round(emp.baseSalaryNPR / 26);
                              const lopDeduction = excessDays * dailyRate;

                              return (
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                                  <span className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                    <CalendarDays className="w-3 h-3 text-indigo-600" />
                                    <span>Accumulated Quota: <strong>{accrual.totalAccruedToDate} days</strong></span>
                                  </span>
                                  <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                                    Paid Balance Available: <strong className={willExceed ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>{accrual.remainingLeaveBalance} days</strong>
                                  </span>
                                  {willExceed ? (
                                    <span className="bg-rose-100 border border-rose-300 text-rose-800 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                      <span>⚠️ Exceeds Quota by {excessDays} day(s) → Triggers रू {lopDeduction.toLocaleString()} LOP Deduction in Payroll</span>
                                    </span>
                                  ) : (
                                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                                      ✓ Covered by Accumulated Paid Leave Quota
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="text-right">
                          <span
                            className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                              lev.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : lev.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800 animate-pulse'
                            }`}
                          >
                            {lev.status === 'approved'
                              ? 'Approved'
                              : lev.status === 'rejected'
                              ? 'Rejected'
                              : 'Awaiting Manager Decision'}
                          </span>
                          <span className="block text-[11px] text-slate-600 mt-1 font-medium">
                            Applied: {lev.appliedAt}
                          </span>
                        </div>
                      </div>

                      {/* Reason text */}
                      <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-700">
                        <span className="font-bold text-slate-900">Reason: </span>
                        <span>{lev.reason}</span>
                        <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            Emergency Contact During Leave:{' '}
                            <span className="font-mono text-slate-800 font-semibold">
                              {lev.emergencyContact}
                            </span>
                          </span>
                          {emp && (
                            <span>
                              Available Casual Balance: <strong>{emp.leaveBalance.casual} days</strong> | Sick:{' '}
                              <strong>{emp.leaveBalance.sick} days</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Existing Remarks if reviewed */}
                      {lev.managerRemarks && (
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-200">
                          <span className="font-bold text-slate-800">Manager Remarks: </span>
                          <span>{lev.managerRemarks}</span>
                          {lev.reviewedBy && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Decision by {lev.reviewedBy} at {lev.reviewedAt}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Approval Actions (if pending) */}
                      {isPending && (
                        <div className="mt-4 pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Add manager remarks or hand-off notes (optional)..."
                              value={reviewRemarks[lev.id] || ''}
                              onChange={(e) =>
                                setReviewRemarks({
                                  ...reviewRemarks,
                                  [lev.id]: e.target.value,
                                })
                              }
                              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                            />
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              id={`reject-leave-btn-${lev.id}`}
                              type="button"
                              onClick={() => handleReject(lev.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
                            >
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span>Decline</span>
                            </button>
                            <button
                              id={`approve-leave-btn-${lev.id}`}
                              type="button"
                              onClick={() => handleApprove(lev.id)}
                              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve Leave Request</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Attendance & Terminal Logs */}
        {activeTab === 'attendance' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Hikvision Biometric Attendance Roster
                </h3>
                <p className="text-[11px] text-slate-500">
                  Real-time face recognition and fingerprint scan events
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search staff name or code..."
                    value={attendanceSearch}
                    onChange={(e) => setAttendanceSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowChartInAttendance(!showChartInAttendance)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-xs transition-colors ${
                    showChartInAttendance
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                  <span>{showChartInAttendance ? 'Hide 30D Trends' : 'Show 30D Trends'}</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenHikvisionModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Sync Terminal Logs</span>
                </button>
              </div>
            </div>

            {/* Embedded 30-Day Trend Chart when toggled */}
            {showChartInAttendance && (
              <AttendanceTrendChart
                employees={employees}
                attendanceRecords={attendanceRecords}
              />
            )}

            {/* Attendance Table */}
            <div className="border border-slate-200 rounded-2xl overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Date (BS & AD)</th>
                    <th className="px-4 py-3">Shift</th>
                    <th className="px-4 py-3">Check-In</th>
                    <th className="px-4 py-3">Check-Out</th>
                    <th className="px-4 py-3">Terminal / Mode</th>
                    <th className="px-4 py-3">Overtime</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceRecords
                    .filter((rec) => {
                      if (!attendanceSearch) return true;
                      const q = attendanceSearch.toLowerCase();
                      return (
                        rec.employeeName.toLowerCase().includes(q) ||
                        rec.employeeCode.toLowerCase().includes(q)
                      );
                    })
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          <div>{rec.employeeName}</div>
                          <span className="font-mono text-[10px] text-slate-400">
                            {rec.employeeCode}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 text-xs">
                            {adToBs(rec.date).day} {adToBs(rec.date).monthNameNp} BS
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">
                            {rec.date} AD
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{rec.shiftName.split('(')[0]}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800">
                          {rec.checkIn}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800">
                          {rec.checkOut || (
                            <span className="text-emerald-600 font-sans text-[11px] animate-pulse">
                              On Duty
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          <span className="font-medium text-slate-700 block">{rec.verifyMode}</span>
                          <span className="text-[10px] text-slate-400 line-clamp-1">
                            {rec.terminalName.split(' ')[0]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {rec.overtimeMinutes > 0 ? (
                            <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 inline-flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" />
                              +{(rec.overtimeMinutes / 60).toFixed(1)}h
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">0h</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.status === 'late'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {rec.status === 'late' ? `Late (${rec.lateMinutes}m)` : 'Present'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: 30-Day Attendance Trends & Ratio Analytics */}
        {activeTab === 'trends' && (
          <div className="p-6 space-y-6">
            <AttendanceTrendChart
              employees={employees}
              attendanceRecords={attendanceRecords}
            />

            {/* Department Breakdown & Statutory Regulations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-rose-600" />
                    <span>Departmental Attendance Ratios (30-Day)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Operational Roster
                  </span>
                </div>

                <div className="space-y-2.5">
                  {Array.from(new Set(employees.map((e) => e.department))).map((dept) => {
                    const deptEmployees = employees.filter((e) => e.department === dept);
                    const isField = dept.toLowerCase().includes('technical') || dept.toLowerCase().includes('support');
                    const ratio = isField ? 96 : 94;
                    return (
                      <div
                        key={dept}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{dept}</div>
                          <div className="text-[11px] text-slate-500">
                            {deptEmployees.length} staff enrolled • Standard 09:00 - 18:00
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-emerald-700 font-mono">{ratio}% ratio</div>
                          <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Nepal Statutory Attendance Regulations</span>
                  </h4>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Labor Act 2074
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
                    <span className="font-bold text-amber-950 block mb-0.5">
                      Standard Work Hours & Saturday (शनिबार) Off
                    </span>
                    Under Section 28, standard work is capped at 8 hours/day (48 hrs/week). Saturdays are legal weekly holidays. Standby technical staff deployed on Saturdays earn overtime rates.
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                    <span className="font-bold text-emerald-950 block mb-0.5">
                      1.5× Overtime Calculation Engine
                    </span>
                    Any punch-out logged beyond the 18:00 shift limit (with 15m grace period) is calculated as overtime at 150% of the employee's basic hourly rate automatically.
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/80">
                    <span className="font-bold text-blue-950 block mb-0.5">
                      Bikram Sambat (वि.सं.) Roster Mapping
                    </span>
                    Every attendance log is linked to both Gregorian and Bikram Sambat calendars, ensuring accurate public holiday leave allowances (Dashain, Tihar, Constitution Day).
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Automated Overtime Manager & Review */}
        {activeTab === 'overtime' && (
          <div className="p-6 space-y-6">
            {/* Dedicated Automated Overtime Manager Panel */}
            <AutomatedOvertimeManager
              settings={overtimeSettings}
              onUpdateSettings={onUpdateOvertimeSettings}
              employees={employees}
              onSwitchToMobilePreview={onSwitchToMobilePreview}
            />

            {/* Shift-Based Overtime Approval Queue */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span>Shift-Based Overtime Approval Queue</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-mono px-2 py-0.5 rounded-full font-bold">
                      {pendingOtRecords.length} Records
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Extra hours calculated from Hikvision biometric checkout stamps past 18:00
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onOpenOvertimeModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                >
                  <span>Interactive Shift Simulator</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Check-In / Out</th>
                      <th className="px-4 py-3">Shift Window</th>
                      <th className="px-4 py-3">Overtime Hours</th>
                      <th className="px-4 py-3">Hourly Rate</th>
                      <th className="px-4 py-3">Calculated OT Pay</th>
                      <th className="px-4 py-3">Status / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingOtRecords.map((rec) => {
                      const emp = employees.find((e) => e.id === rec.employeeId);
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {rec.employeeName}
                            <span className="font-mono text-[10px] text-slate-400 block">
                              {rec.employeeCode}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 text-xs">
                              {adToBs(rec.date).day} {adToBs(rec.date).monthNameNp} BS
                            </div>
                            <div className="font-mono text-[10px] text-slate-400">
                              {rec.date} AD
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-800 font-medium">
                            {rec.checkIn} - {rec.checkOut}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-[11px]">
                            09:00 - 18:00 (1h break)
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-rose-700">
                            +{(rec.overtimeMinutes / 60).toFixed(2)} hrs
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">
                            रू {emp?.hourlyRateNPR || 265}/h
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                            रू {rec.overtimePayNPR.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            {rec.isOvertimeApproved ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approved for Payroll</span>
                              </span>
                            ) : (
                              <button
                                id={`approve-ot-${rec.id}`}
                                type="button"
                                onClick={() => onApproveOvertime(rec.id)}
                                className="px-2.5 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                              >
                                Approve OT
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Automated Payroll & Leave Engine (1st & 18th Accrual Rule) */}
        {activeTab === 'payroll' && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Header & Controls Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Automated Payroll & Leave Accrual Engine
                    </h3>
                    <p className="text-xs text-slate-500">
                      Biometric Attendance • Bi-Monthly Leave Quota (1st & 18th Rule) • Loss of Pay (LOP) Deductions
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAccrualScheduleManager(!showAccrualScheduleManager)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{showAccrualScheduleManager ? 'Hide Accrual Schedule' : 'View 1st & 18th Schedule'}</span>
                </button>

                {onRecalculatePayroll && (
                  <button
                    type="button"
                    onClick={() => {
                      onRecalculatePayroll();
                      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                    <span>Recalculate All</span>
                  </button>
                )}

                <button
                  id="export-payroll-csv-btn"
                  type="button"
                  onClick={() => {
                    exportPayrollsToCSV(payrollSlips, employees);
                    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Payroll (CSV)</span>
                </button>
              </div>
            </div>

            {/* Policy Explainer Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white border border-indigo-800/80 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Fiscal Year 2081/82 Leave Accrual & Loss of Pay (LOP) Rule:
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-200">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <span className="font-bold text-amber-300 block mb-0.5">1. Month 1 (साउन): 2 Days</span>
                  <p className="text-[11px] text-slate-300">
                    Opening paid leave quota for the first month of the Fiscal Year is fixed at 2.0 days.
                  </p>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <span className="font-bold text-emerald-300 block mb-0.5">2. 1st & 18th Accrual Rule</span>
                  <p className="text-[11px] text-slate-300">
                    Subsequent months accrue 1 day on the <strong>1st</strong> and 1 day on the <strong>18th</strong> of every Nepali month, accumulating continuously.
                  </p>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <span className="font-bold text-rose-300 block mb-0.5">3. Automated LOP Deduction</span>
                  <p className="text-[11px] text-slate-300">
                    If an employee takes leave exceeding accumulated quota, salary for excess days is automatically deducted from payroll as Loss of Pay.
                  </p>
                </div>
              </div>
            </div>

            {/* Accrual Cycles Timeline (Expandable) */}
            {showAccrualScheduleManager && (() => {
              const schedule = generateFiscalYearAccrualSchedule('2026-09-19', 2081);
              return (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        FY 2081/82 Bi-Monthly Accrual Timeline (1st & 18th Schedule)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Shows how paid leave accumulates over all 23 cycles across the 12 Nepali months
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Current: Ashwin 2081 ({schedule.totalAccruedToDate.toFixed(1)} Days Accrued)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {schedule.cycles.map((cycle, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs ${
                          cycle.isAccrued
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{cycle.accrualDateBs}</span>
                          <span className={cycle.isAccrued ? 'text-emerald-700 font-mono' : 'text-slate-400 font-mono'}>
                            +{cycle.accrualAmount} day
                          </span>
                        </div>
                        <div className="text-[10px] mt-0.5 flex items-center justify-between">
                          <span>{cycle.description}</span>
                          <span className="font-mono font-bold">Total: {cycle.cumulativeQuota}</span>
                        </div>
                        <div className="text-[9px] mt-1 pt-1 border-t border-slate-200/60 text-right">
                          {cycle.isAccrued ? '✓ Accrued to Date' : 'Upcoming'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* KPI Metric Tiles */}
            {(() => {
              const totalGross = payrollSlips.reduce((acc, s) => acc + s.grossEarnings, 0);
              const totalNet = payrollSlips.reduce((acc, s) => acc + s.netPay, 0);
              const totalLOP = payrollSlips.reduce((acc, s) => acc + (s.lossOfPayDeduction || 0), 0);
              const totalLOPDays = payrollSlips.reduce((acc, s) => acc + (s.unpaidLeaveDays || 0), 0);
              const totalPaidLeaves = payrollSlips.reduce((acc, s) => acc + (s.paidLeaveDays || 0), 0);
              const totalOTPay = payrollSlips.reduce((acc, s) => acc + s.overtimePay, 0);

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-600 uppercase block">
                      Total Gross Pay
                    </span>
                    <div className="text-base font-black text-slate-900 mt-0.5 font-mono">
                      रू {Math.round(totalGross).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-500">Earnings</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                      Total Net Disbursed
                    </span>
                    <div className="text-base font-black text-emerald-950 mt-0.5 font-mono">
                      रू {Math.round(totalNet).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-medium">Bank Transfer</span>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                    <span className="text-[10px] font-bold text-teal-800 uppercase block">
                      Allowed Paid Leaves
                    </span>
                    <div className="text-base font-black text-teal-950 mt-0.5 font-mono">
                      {totalPaidLeaves} days
                    </div>
                    <span className="text-[10px] text-teal-700 font-medium">Within Quota</span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="text-[10px] font-bold text-rose-800 uppercase block">
                      Excess Leave (LOP)
                    </span>
                    <div className="text-base font-black text-rose-950 mt-0.5 font-mono">
                      {totalLOPDays} days
                    </div>
                    <span className="text-[10px] text-rose-700 font-medium">Unpaid Absences</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">
                      LOP Salary Deductions
                    </span>
                    <div className="text-base font-black text-amber-950 mt-0.5 font-mono">
                      -रू {Math.round(totalLOP).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-amber-700 font-medium">Saved via Quota</span>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase block">
                      Automated OT Pay
                    </span>
                    <div className="text-base font-black text-indigo-950 mt-0.5 font-mono">
                      +रू {Math.round(totalOTPay).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-indigo-700 font-medium">Approved Overtime</span>
                  </div>
                </div>
              );
            })()}

            {/* Search and Table */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by employee name or code..."
                    value={payrollSearch}
                    onChange={(e) => setPayrollSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Showing {payrollSlips.filter((s) => s.employeeName.toLowerCase().includes(payrollSearch.toLowerCase()) || s.employeeCode.toLowerCase().includes(payrollSearch.toLowerCase())).length} automated payroll calculations
                </div>
              </div>

              {/* Automated Payroll Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-3 py-3">Employee</th>
                      <th className="px-3 py-3">Basic Salary</th>
                      <th className="px-3 py-3">Attendance & Quota</th>
                      <th className="px-3 py-3">LOP (Excess Leave)</th>
                      <th className="px-3 py-3">Overtime</th>
                      <th className="px-3 py-3">Gross Earnings</th>
                      <th className="px-3 py-3">SSF (11%) & TDS</th>
                      <th className="px-3 py-3">Net Pay</th>
                      <th className="px-3 py-3 text-right">Payslip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {payrollSlips
                      .filter(
                        (s) =>
                          s.employeeName.toLowerCase().includes(payrollSearch.toLowerCase()) ||
                          s.employeeCode.toLowerCase().includes(payrollSearch.toLowerCase())
                      )
                      .map((slip) => {
                        const emp = employees.find((e) => e.id === slip.employeeId);
                        const hasLOP = (slip.lossOfPayDeduction ?? 0) > 0;

                        return (
                          <tr key={slip.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Employee */}
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={emp?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                  alt={slip.employeeName}
                                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                                />
                                <div>
                                  <div className="font-bold text-slate-900">{slip.employeeName}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    {slip.employeeCode} • {slip.department.split('&')[0]}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Basic Salary */}
                            <td className="px-3 py-3 font-mono">
                              <div className="font-bold text-slate-900">
                                रू {slip.basicSalary.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                रू {Math.round(slip.basicSalary / (slip.totalWorkingDays || 26))}/day
                              </div>
                            </td>

                            {/* Attendance & Quota */}
                            <td className="px-3 py-3">
                              <div className="space-y-0.5 text-[11px]">
                                <div className="flex items-center gap-1 font-semibold text-slate-800">
                                  <span>Present: <strong>{slip.presentDays ?? 24}</strong> / {slip.totalWorkingDays ?? 26} d</span>
                                </div>
                                <div className="text-[10px] text-teal-700 font-medium">
                                  Paid Leave: {slip.paidLeaveDays ?? 2} d (Quota: {slip.accumulatedLeaveQuota ?? 5} d)
                                </div>
                              </div>
                            </td>

                            {/* LOP (Excess Leave) */}
                            <td className="px-3 py-3">
                              {hasLOP ? (
                                <div className="text-[11px]">
                                  <span className="font-bold text-rose-700 font-mono block">
                                    -रू {(slip.lossOfPayDeduction ?? 0).toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-rose-600 bg-rose-50 px-1 py-0.2 rounded font-semibold border border-rose-200">
                                    {slip.unpaidLeaveDays} d excess leave
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  0 d (Full Quota)
                                </span>
                              )}
                            </td>

                            {/* Overtime */}
                            <td className="px-3 py-3 font-mono">
                              <div className="font-bold text-indigo-700">
                                +रू {slip.overtimePay.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {slip.overtimeHours.toFixed(1)} hrs
                              </div>
                            </td>

                            {/* Gross Earnings */}
                            <td className="px-3 py-3 font-mono">
                              <div className="font-bold text-slate-900">
                                रू {slip.grossEarnings.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                DA+HRA: रू {(slip.dearnessAllowance + slip.houseRentAllowance).toLocaleString()}
                              </div>
                            </td>

                            {/* Deductions (SSF & TDS) */}
                            <td className="px-3 py-3 font-mono text-[11px]">
                              <div className="text-slate-700">
                                SSF: -रू {slip.ssfEmployee.toLocaleString()}
                              </div>
                              <div className="text-slate-500 text-[10px]">
                                TDS: -रू {slip.incomeTaxTDS.toLocaleString()}
                              </div>
                            </td>

                            {/* Net Take-Home Pay */}
                            <td className="px-3 py-3 font-mono">
                              <div className="text-sm font-black text-emerald-800">
                                रू {slip.netPay.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                SSF Co: रू {slip.ssfEmployer.toLocaleString()} (20%)
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-3 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {onViewDocument && (
                                  <button
                                    type="button"
                                    onClick={() => onViewDocument('payslip', slip, undefined)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                    title="View Detailed Payslip Modal"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {onViewDocument && (
                                  <button
                                    type="button"
                                    onClick={() => onViewDocument('payslip', slip, undefined)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                                    title="Download PDF"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span className="hidden sm:inline">PDF</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Company Leave Policy & Quota Manager */}
        {activeTab === 'policies' && (
          <div className="p-6">
            <CompanyLeavePolicyManager
              policies={leavePolicies}
              employees={employees}
              onUpdatePolicy={onUpdatePolicy || (() => {})}
              onUpdateEmployeeLeaveBalance={onUpdateEmployeeLeaveBalance || (() => {})}
            />
          </div>
        )}
      </div>
    </div>
  );
};
