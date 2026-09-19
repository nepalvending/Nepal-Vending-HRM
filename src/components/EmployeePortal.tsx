import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  FileText,
  User,
  PlusCircle,
  Download,
  Eye,
  CheckCircle2,
  Clock4,
  AlertCircle,
  XCircle,
  MapPin,
  Camera,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Send,
  Smartphone,
  Maximize2,
  Minimize2,
  QrCode,
  Zap,
  Calculator,
  CalendarDays,
  Coins,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollSlip,
  TaxReport,
  LeaveType,
  AutomatedOvertimeSettings,
} from '../types';
import { formatMinutes } from '../utils/overtimeCalculator';
import {
  adToBs,
  formatDualDate,
  formatShortDualDate,
  toNepaliNumerals,
} from '../utils/nepaliCalendar';
import { calculateEmployeeLeaveAccrual } from '../utils/payrollCalculator';

interface EmployeePortalProps {
  employee: Employee;
  attendanceHistory: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  payrollSlips: PayrollSlip[];
  taxReports: TaxReport[];
  overtimeSettings?: AutomatedOvertimeSettings;
  onSubmitLeaveRequest: (newLeave: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>) => void;
  onPunchAttendance: (empId: string, punchType: 'Check-In' | 'Check-Out') => void;
  onViewDocument: (type: 'payslip' | 'tax', payroll?: PayrollSlip, taxReport?: TaxReport) => void;
  onOpenOvertimeModal: () => void;
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({
  employee,
  attendanceHistory,
  leaveRequests,
  payrollSlips,
  taxReports,
  overtimeSettings,
  onSubmitLeaveRequest,
  onPunchAttendance,
  onViewDocument,
  onOpenOvertimeModal,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'payroll'>('attendance');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [phoneFrameMode, setPhoneFrameMode] = useState(false);

  // Leave Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('Casual Leave');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [emergencyContact, setEmergencyContact] = useState(employee.phone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  // Punch state
  const todayStr = '2026-09-19';
  const todayRecord = attendanceHistory.find(
    (a) => a.employeeId === employee.id && a.date === todayStr
  );
  const isCheckedInToday = !!todayRecord?.checkIn;
  const isCheckedOutToday = !!todayRecord?.checkOut;

  // Accrual schedule toggle state
  const [showAccrualSchedule, setShowAccrualSchedule] = useState(false);

  // Filter leaves for this employee & calculate dynamic 1st & 18th accrual
  const myLeaves = leaveRequests.filter((l) => l.employeeId === employee.id);
  const leaveAccrual = calculateEmployeeLeaveAccrual(employee, leaveRequests, todayStr);

  // Filter history for this employee
  const myAttendance = attendanceHistory
    .filter((a) => a.employeeId === employee.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Calculate Overtime total this month for this employee
  const myTotalOtMinutes = myAttendance.reduce((acc, curr) => acc + (curr.overtimeMinutes || 0), 0);
  const myTotalOtPayNPR = myAttendance.reduce((acc, curr) => acc + (curr.overtimePayNPR || 0), 0);

  // Check if automated overtime is enabled for this employee in the mobile app
  const isMyOvertimeEnabled = overtimeSettings
    ? (overtimeSettings.employeeOverrides[employee.id] !== undefined
        ? overtimeSettings.employeeOverrides[employee.id]
        : overtimeSettings.isMobileOvertimeEnabled)
    : true;

  const calculateDaysCount = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason for the leave request.');
      return;
    }

    setIsSubmitting(true);
    const days = calculateDaysCount(startDate, endDate);

    setTimeout(() => {
      onSubmitLeaveRequest({
        employeeId: employee.id,
        employeeCode: employee.employeeCode,
        employeeName: employee.name,
        department: employee.department,
        leaveType,
        startDate,
        endDate,
        daysCount: days,
        reason,
        emergencyContact,
      });

      setIsSubmitting(false);
      setShowApplyModal(false);
      setReason('');
      setSubmitFeedback('Leave request submitted successfully! Awaiting manager approval.');

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });

      setTimeout(() => setSubmitFeedback(null), 4000);
    }, 400);
  };

  const handleQuickPunch = () => {
    if (!isCheckedInToday) {
      onPunchAttendance(employee.id, 'Check-In');
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } else if (!isCheckedOutToday) {
      onPunchAttendance(employee.id, 'Check-Out');
    }
  };

  return (
    <div className={`transition-all ${phoneFrameMode ? 'max-w-md mx-auto py-4' : 'w-full'}`}>
      {/* Phone frame container when toggled */}
      <div
        className={`bg-white rounded-3xl overflow-hidden transition-all duration-300 ${
          phoneFrameMode
            ? 'shadow-2xl border-8 border-slate-800 ring-1 ring-slate-900/10 min-h-[820px]'
            : 'border border-slate-200/90 shadow-xs'
        }`}
      >
        {/* Phone Frame Status Bar (Only in phone mode) */}
        {phoneFrameMode && (
          <div className="bg-slate-900 text-white px-6 py-2 flex items-center justify-between text-[11px] font-mono">
            <span>09:41</span>
            <div className="w-18 h-3.5 bg-black rounded-full mx-auto"></div>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <span className="w-4 h-2.5 border border-white rounded-xs p-0.5 inline-block">
                <span className="bg-white block h-full w-full"></span>
              </span>
            </div>
          </div>
        )}

        {/* Mobile Header & Digital ID Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 text-white p-5 sm:p-6 relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-rose-500/10 blur-xl pointer-events-none"></div>

          {/* Toggle Phone Frame button in header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-400/30">
                <Smartphone className="w-3 h-3" />
                <span>Nepal Vending Staff App</span>
              </span>
              {/* Top tag in header */}
              {isMyOvertimeEnabled && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                  <Zap className="w-2.5 h-2.5" />
                  <span>Auto-OT Active</span>
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">v2.4 (Bhadra 2081)</span>
            </div>
            <button
              type="button"
              onClick={() => setPhoneFrameMode(!phoneFrameMode)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1"
              title="Toggle mobile device frame"
            >
              {phoneFrameMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="text-[10px] hidden sm:inline">
                {phoneFrameMode ? 'Expand View' : 'Phone Frame Mode'}
              </span>
            </button>
          </div>

          {/* Employee ID Card Badge */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover ring-2 ring-rose-400/60 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                  {employee.name}
                </h1>
                <span className="text-xs text-rose-300 font-medium hidden sm:inline">
                  ({employee.nameNepali})
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                {employee.designation}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                <span className="bg-white/10 px-2 py-0.5 rounded text-white font-bold">
                  {employee.employeeCode}
                </span>
                <span>•</span>
                <span>Card: {employee.cardNo}</span>
              </div>
            </div>
          </div>

          {/* Quick Punch / Today's Shift Status Box */}
          <div className="mt-5 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left w-full sm:w-auto">
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-rose-400" />
                <span>Today's Shift: 09:00 - 18:00</span>
                <span className="text-white/40">•</span>
                <span className="text-amber-300 font-medium">
                  {adToBs(todayStr).formattedBSFullNp} (वि.सं.)
                </span>
              </div>
              <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-2">
                {isCheckedInToday ? (
                  <span>
                    Checked In at{' '}
                    <span className="text-emerald-400 font-mono font-bold">
                      {todayRecord?.checkIn}
                    </span>
                    {isCheckedOutToday && (
                      <span>
                        {' '}
                        • Out at{' '}
                        <span className="text-amber-400 font-mono font-bold">
                          {todayRecord?.checkOut}
                        </span>
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-amber-300">Not checked in yet today</span>
                )}
              </div>
            </div>

            <button
              id="employee-quick-punch-btn"
              type="button"
              onClick={handleQuickPunch}
              disabled={isCheckedOutToday}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                !isCheckedInToday
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-600/30'
                  : !isCheckedOutToday
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-600/30'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>
                {!isCheckedInToday
                  ? 'Biometric Face Punch'
                  : !isCheckedOutToday
                  ? 'Punch Check-Out (End Shift)'
                  : 'Shift Completed Today'}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Selector (App-style navigation) */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50/80 p-1">
          <button
            id="tab-emp-history-btn"
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'attendance'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Check-in History</span>
          </button>
          <button
            id="tab-emp-leaves-btn"
            type="button"
            onClick={() => setActiveTab('leaves')}
            className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all relative ${
              activeTab === 'leaves'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Request Leave</span>
            {myLeaves.filter((l) => l.status === 'pending').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>
          <button
            id="tab-emp-payroll-btn"
            type="button"
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'payroll'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Payslip & Tax (PDF)</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {submitFeedback && (
          <div className="m-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{submitFeedback}</span>
          </div>
        )}

        {/* TAB 1: Attendance & Check-in History */}
        {activeTab === 'attendance' && (
          <div className="p-4 sm:p-6 space-y-5">
            {/* Monthly Overtime Summary Banner (Only shown if Auto OT is enabled for employee) */}
            {isMyOvertimeEnabled && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-slate-50 to-rose-50 border border-indigo-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3 text-indigo-600" />
                      <span>Automated Shift Overtime Accrued</span>
                    </span>
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">
                      Active
                    </span>
                  </div>
                  <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                    {(myTotalOtMinutes / 60).toFixed(1)} hrs{' '}
                    <span className="text-xs font-bold text-emerald-700">
                      (+ रू {myTotalOtPayNPR.toLocaleString()})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Calculated automatically past 18:00 shift end @ 1.5x hourly rate
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenOvertimeModal}
                  className="px-3 py-1.5 text-xs font-bold bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-xl shadow-xs transition-colors shrink-0"
                >
                  View Policy
                </button>
              </div>
            )}

            {/* List of Daily Attendance Records */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Check-in Logs from Hikvision Biometric Terminal
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {myAttendance.length} records found
                </span>
              </div>

              <div className="space-y-3">
                {myAttendance.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            {adToBs(rec.date).day} {adToBs(rec.date).monthNameNp} {adToBs(rec.date).year} BS
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-semibold">
                            {rec.date} AD
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              rec.status === 'present'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : rec.status === 'late'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {rec.status === 'late' ? `Late by ${rec.lateMinutes}m` : 'Present'}
                          </span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                            {rec.verifyMode} Scan
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{rec.terminalName}</span>
                        </p>
                      </div>

                      {/* Overtime Tag if earned and enabled */}
                      {rec.overtimeMinutes > 0 && isMyOvertimeEnabled && (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-mono">
                            <Zap className="w-2.5 h-2.5" />
                            +{(rec.overtimeMinutes / 60).toFixed(1)}h OT
                          </span>
                          <span className="block text-[11px] font-mono font-bold text-emerald-700 mt-0.5">
                            +रू {rec.overtimePayNPR.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Check In & Out stamps */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-600 font-bold block uppercase">
                          Check-In
                        </span>
                        <span className="font-mono font-bold text-slate-900">{rec.checkIn}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-600 font-bold block uppercase">
                          Check-Out
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {rec.checkOut || (
                            <span className="text-emerald-700 animate-pulse font-sans text-[11px]">
                              Active Shift...
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-600 font-bold block uppercase">
                          Total Hours
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {rec.checkOut
                            ? formatMinutes(rec.regularMinutes + rec.overtimeMinutes)
                            : '--'}
                        </span>
                      </div>
                    </div>

                    {rec.notes && (
                      <p className="text-[10px] text-slate-600 mt-2 italic bg-slate-50 p-1.5 rounded">
                        Note: {rec.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Request Leave & Status */}
        {activeTab === 'leaves' && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Bi-Monthly Leave Accrual Tracker (1st & 18th Rule) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md border border-indigo-800/60">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      Automated Leave Quota Engine
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Nepal FY {leaveAccrual.fiscalYear} • Bi-Monthly Accrual (1st & 18th Rule)
                    </p>
                  </div>
                </div>
                <button
                  id="open-apply-leave-modal-btn"
                  type="button"
                  onClick={() => setShowApplyModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Apply for Leave</span>
                </button>
              </div>

              {/* Accrual Rule Explainer Box */}
              <div className="bg-indigo-950/60 rounded-xl p-2.5 border border-indigo-700/50 text-[11px] text-indigo-200 mb-3 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Company Leave Accrual & Loss of Pay (LOP) Rule:</span>
                </p>
                <p className="text-slate-300 text-[10.5px] leading-relaxed">
                  • <strong>1st Month of FY (साउन):</strong> 2 days accrued opening quota.
                  <br />
                  • <strong>Subsequent Months:</strong> 1 day accrued on the <strong>1st</strong> and 1 day on the <strong>18th</strong> of every Nepali month, accumulated continuously.
                  <br />
                  • Leaves taken deduct from accumulated balance. <strong>Any leave taken exceeding accumulated balance is deducted from monthly salary as Loss of Pay (LOP).</strong>
                </p>
              </div>

              {/* Accrual Metrics Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-300 font-bold block uppercase">
                    Accumulated Quota
                  </span>
                  <div className="text-xl font-black text-white font-mono mt-0.5">
                    {leaveAccrual.totalAccruedToDate} <span className="text-xs font-normal text-slate-400">days</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">To date</span>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-300 font-bold block uppercase">
                    Leaves Taken
                  </span>
                  <div className="text-xl font-black text-amber-300 font-mono mt-0.5">
                    {leaveAccrual.approvedLeavesTaken} <span className="text-xs font-normal text-slate-400">days</span>
                  </div>
                  <span className="text-[10px] text-amber-200 font-medium">Approved by HR</span>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-300 font-bold block uppercase">
                    Remaining Balance
                  </span>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                    {leaveAccrual.remainingLeaveBalance} <span className="text-xs font-normal text-slate-400">days</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-medium">Paid quota</span>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-300 font-bold block uppercase">
                    Next Accrual Cycle
                  </span>
                  <div className="text-xs font-bold text-rose-300 font-mono mt-1">
                    {leaveAccrual.nextAccrualDateBs}
                  </div>
                  <span className="text-[10px] text-slate-400">+1 day quota</span>
                </div>
              </div>

              {/* Excess Leave / Loss of Pay Alert if employee takes more leave than accumulated quota */}
              {leaveAccrual.excessLeaveDays > 0 ? (
                <div className="mt-3 bg-rose-500/20 border border-rose-500/60 p-3 rounded-xl flex items-start gap-2 text-rose-200">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-rose-300 block">
                      ⚠️ Loss of Pay (LOP) Salary Deduction Alert:
                    </span>
                    <span>
                      You have taken <strong>{leaveAccrual.excessLeaveDays} days</strong> of leave beyond your accumulated paid quota of {leaveAccrual.totalAccruedToDate} days.
                      Salary for these {leaveAccrual.excessLeaveDays} days (
                      <strong className="text-white">रू {leaveAccrual.unpaidLeaveSalaryDeduction.toLocaleString()}</strong>
                      ) will be automatically deducted from your monthly salary slip.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-[10.5px] text-emerald-400 flex items-center justify-between">
                  <span>✓ All taken leaves are fully covered under your accumulated paid leave quota.</span>
                  <button
                    type="button"
                    onClick={() => setShowAccrualSchedule(!showAccrualSchedule)}
                    className="text-xs text-rose-300 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <span>{showAccrualSchedule ? 'Hide Accrual Timeline' : 'View Accrual Timeline'}</span>
                    {showAccrualSchedule ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              {/* Accrual Cycles Timeline Dropdown */}
              {showAccrualSchedule && (
                <div className="mt-3 pt-3 border-t border-indigo-800/80 space-y-2 max-h-56 overflow-y-auto pr-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Fiscal Year 2081/82 Bi-Monthly Accrual Cycles (1st & 18th)
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    {leaveAccrual.cycles.map((cycle, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg flex items-center justify-between text-[11px] ${
                          cycle.isAccrued
                            ? 'bg-emerald-950/40 border border-emerald-700/40 text-emerald-200'
                            : 'bg-slate-800/50 border border-slate-700/50 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              cycle.isAccrued ? 'bg-emerald-400' : 'bg-slate-600'
                            }`}
                          />
                          <div>
                            <span className="font-semibold text-white">
                              {cycle.accrualDateBs} ({cycle.accrualDateAd})
                            </span>
                            <span className="text-[10px] text-slate-300 block">
                              {cycle.description}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-mono font-bold ${
                              cycle.isAccrued ? 'text-emerald-300' : 'text-slate-400'
                            }`}
                          >
                            +{cycle.accrualAmount} day (Total: {cycle.cumulativeQuota})
                          </span>
                          <span className="text-[10px] block">
                            {cycle.isAccrued ? '✓ Accrued' : 'Upcoming'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Leave Balance Counters (Traditional breakdown) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Traditional Leave Type Categories
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    Casual Leave
                  </span>
                  <div className="text-xl font-black text-slate-900 mt-0.5 font-mono">
                    {employee.leaveBalance.casual}{' '}
                    <span className="text-xs font-normal text-slate-500">/ 10</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Full pay</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    Sick Leave
                  </span>
                  <div className="text-xl font-black text-slate-900 mt-0.5 font-mono">
                    {employee.leaveBalance.sick}{' '}
                    <span className="text-xs font-normal text-slate-500">/ 12</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Medical</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    Annual Leave
                  </span>
                  <div className="text-xl font-black text-slate-900 mt-0.5 font-mono">
                    {employee.leaveBalance.annual}{' '}
                    <span className="text-xs font-normal text-slate-500">/ 18</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Earned</span>
                </div>
              </div>
            </div>

            {/* Application Form Modal / Inline */}
            {showApplyModal && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-rose-600" />
                    <span>Apply for Leave (Requires Manager Approval)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleApplyLeaveSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">
                      Leave Type
                    </label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium"
                    >
                      <option value="Casual Leave">Casual Leave (आकस्मिक विदा)</option>
                      <option value="Sick Leave">Sick Leave (बिरामी विदा)</option>
                      <option value="Annual Leave">Annual Earned Leave (घर विदा)</option>
                      <option value="Festive Leave">Festive / Dashain-Tihar Leave (चाडपर्व विदा)</option>
                      <option value="Unpaid Leave">Unpaid Leave (अवैतनिक विदा)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">
                        Start Date (AD)
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-medium"
                      />
                      <span className="text-[10px] text-rose-700 font-bold block mt-0.5">
                        {adToBs(startDate).day} {adToBs(startDate).monthNameNp} {adToBs(startDate).year} BS
                      </span>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">
                        End Date (AD)
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-medium"
                      />
                      <span className="text-[10px] text-rose-700 font-bold block mt-0.5">
                        {adToBs(endDate).day} {adToBs(endDate).monthNameNp} {adToBs(endDate).year} BS
                      </span>
                    </div>
                  </div>

                  {/* Real-time Dual Calendar Summary */}
                  <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-amber-950">
                    <span className="font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      <span>नेपाली क्यालेण्डर अवधि (BS Range):</span>
                    </span>
                    <span className="font-bold text-amber-900">
                      {adToBs(startDate).day} {adToBs(startDate).monthNameNp} देखि {adToBs(endDate).day} {adToBs(endDate).monthNameNp} {adToBs(endDate).year} वि.सं. ({calculateDaysCount(startDate, endDate)} दिन)
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
                    <span>Duration:</span>
                    <span className="font-bold text-slate-900">
                      {calculateDaysCount(startDate, endDate)} working days
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">
                      Reason for Absence
                    </label>
                    <textarea
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Specify reason (e.g. Vending route handover arranged with Bibek...)"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">
                      Emergency Contact Number
                    </label>
                    <input
                      type="tel"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-3 py-1.5 text-slate-600 font-bold hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      id="submit-leave-application-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting to Manager...' : 'Submit Leave Request'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* My Submitted Leave Requests List */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Submitted Leave Requests & Approval Tracker
              </h3>

              {myLeaves.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">No leave requests submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myLeaves.map((lev) => (
                    <div
                      key={lev.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{lev.leaveType}</span>
                            <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              {adToBs(lev.startDate).day} {adToBs(lev.startDate).monthNameNp} - {adToBs(lev.endDate).day} {adToBs(lev.endDate).monthNameNp} {adToBs(lev.endDate).year} BS
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                lev.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : lev.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}
                            >
                              {lev.status === 'approved'
                                ? 'Approved by Manager'
                                : lev.status === 'rejected'
                                ? 'Rejected'
                                : 'Pending Manager Approval'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            AD Window: {lev.startDate} to {lev.endDate} ({lev.daysCount} working days)
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-600 font-mono">{lev.appliedAt}</span>
                      </div>

                      <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">
                        <strong>Reason:</strong> {lev.reason}
                      </p>

                      {lev.managerRemarks && (
                        <div className="text-[11px] bg-indigo-50 border border-indigo-100 p-2 rounded-lg text-indigo-900">
                          <span className="font-bold">Manager Remarks:</span> {lev.managerRemarks}
                          {lev.reviewedBy && (
                            <span className="text-[10px] text-indigo-700 block font-medium mt-0.5">
                              — Reviewed by {lev.reviewedBy}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Profile, Payroll Slips & Tax Reports (with PDF download) */}
        {activeTab === 'payroll' && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Profile Credentials Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Nepal Statutory & Banking Profile</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  SSF & IRD Verified
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block uppercase">
                    PAN Number
                  </span>
                  <span className="font-mono font-bold text-slate-900">{employee.panNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block uppercase">
                    SSF ID (Nepal)
                  </span>
                  <span className="font-mono font-bold text-slate-900">{employee.ssfNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block uppercase">
                    Base Salary
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    रू {employee.baseSalaryNPR.toLocaleString()} / mo
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block uppercase">
                    Disbursement Bank
                  </span>
                  <span className="font-semibold text-slate-800 line-clamp-1">
                    {employee.bankName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {employee.bankAccount}
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Payroll Slips Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-rose-600" />
                    <span>Automated Monthly Payroll & Attendance Calculation</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Automatically calculated from attendance, shift overtime & bi-monthly leave quota (1st & 18th rule)
                  </p>
                </div>
              </div>

              {/* Featured Latest Automated Payroll Breakdown Card */}
              {payrollSlips.filter((s) => s.employeeId === employee.id)[0] && (() => {
                const latest = payrollSlips.filter((s) => s.employeeId === employee.id)[0];
                return (
                  <div className="mb-5 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                          Current Pay Period • Automated Calculation
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {latest.month}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Period: {latest.payPeriod}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onViewDocument('payslip', latest, undefined)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onViewDocument('payslip', latest, undefined)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* Attendance & Leave Quota Verification Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-600 font-bold block uppercase">
                          Working Days
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {latest.totalWorkingDays ?? 26} days
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-600 font-bold block uppercase">
                          Present (Biometric)
                        </span>
                        <span className="font-mono font-bold text-emerald-800">
                          {latest.presentDays ?? 24} days
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-600 font-bold block uppercase">
                          Paid Leave Allowed
                        </span>
                        <span className="font-mono font-bold text-teal-800">
                          {latest.paidLeaveDays ?? 2} days
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-600 font-bold block uppercase">
                          Excess Leave (LOP)
                        </span>
                        <span className={`font-mono font-bold ${(latest.unpaidLeaveDays ?? 0) > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                          {(latest.unpaidLeaveDays ?? 0) > 0 ? `${latest.unpaidLeaveDays} days` : '0 days (None)'}
                        </span>
                      </div>
                    </div>

                    {/* Earnings & Deductions Quick Tally */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-600 uppercase block">
                          Earnings Breakdown
                        </span>
                        <div className="flex justify-between text-slate-600">
                          <span>Basic Salary:</span>
                          <span className="font-mono font-semibold">रू {latest.basicSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Allowances (DA + HRA + Conveyance):</span>
                          <span className="font-mono font-semibold">
                            रू {(latest.dearnessAllowance + latest.houseRentAllowance + latest.conveyanceAllowance).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-rose-700 font-medium">
                          <span>Automated Overtime ({latest.overtimeHours.toFixed(1)} hrs):</span>
                          <span className="font-mono font-bold">रू {latest.overtimePay.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                          <span>Gross Earnings:</span>
                          <span className="font-mono">रू {latest.grossEarnings.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-600 uppercase block">
                          Deductions Breakdown
                        </span>
                        {(latest.lossOfPayDeduction ?? 0) > 0 && (
                          <div className="flex justify-between text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                            <span>Loss of Pay (Excess Leave):</span>
                            <span className="font-mono">-रू {(latest.lossOfPayDeduction ?? 0).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-600">
                          <span>SSF Contribution (11%):</span>
                          <span className="font-mono font-semibold">-रू {latest.ssfEmployee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Nepal IRD Income Tax TDS:</span>
                          <span className="font-mono font-semibold">-रू {latest.incomeTaxTDS.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                          <span>Total Deductions:</span>
                          <span className="font-mono">-रू {latest.totalDeductions.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Net Pay Callout */}
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Net Take-Home Salary
                        </span>
                        <span className="text-[11px] text-emerald-600">
                          Deposited to {employee.bankName}
                        </span>
                      </div>
                      <div className="text-xl font-black text-emerald-950 font-mono">
                        रू {latest.netPay.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-3">
                {payrollSlips.filter((s) => s.employeeId === employee.id).map((slip) => (
                  <div
                    key={slip.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{slip.month}</span>
                        <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded border border-rose-200">
                          Overtime: {slip.overtimeHours.toFixed(1)} hrs
                        </span>
                        {(slip.unpaidLeaveDays ?? 0) > 0 && (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded">
                            LOP: {slip.unpaidLeaveDays} days (-रू {(slip.lossOfPayDeduction ?? 0).toLocaleString()})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                        <span>
                          Gross: <strong>रू {slip.grossEarnings.toLocaleString()}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          SSF (11%): <strong>रू {slip.ssfEmployee.toLocaleString()}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          TDS Tax: <strong>रू {slip.incomeTaxTDS.toLocaleString()}</strong>
                        </span>
                      </div>
                      <div className="text-sm font-black text-emerald-800 font-mono mt-1">
                        Net Take-Home: रू {slip.netPay.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        id={`view-payslip-${slip.id}`}
                        type="button"
                        onClick={() => onViewDocument('payslip', slip, undefined)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Details</span>
                      </button>
                      <button
                        id={`download-payslip-pdf-${slip.id}`}
                        type="button"
                        onClick={() => onViewDocument('payslip', slip, undefined)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Annual Tax Assessment Reports (IRD Nepal) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Annual Tax Reports (Inland Revenue Department TDS Form)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Nepal FY tax slab assessments, SSF deductions & tax deposit certificates
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {taxReports.map((tax) => (
                  <div
                    key={tax.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Fiscal Year {tax.fiscalYear}
                        </span>
                        <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200">
                          e-TDS Verified
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                        <span>
                          Taxable Income: रू {tax.netTaxableIncome.toLocaleString()}
                        </span>
                        <span>•</span>
                        <span>
                          TDS Paid to IRD: <strong>रू {tax.taxPaidToDate.toLocaleString()}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        id={`view-tax-${tax.id}`}
                        type="button"
                        onClick={() => onViewDocument('tax', undefined, tax)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Statement</span>
                      </button>
                      <button
                        id={`download-tax-pdf-${tax.id}`}
                        type="button"
                        onClick={() => onViewDocument('tax', undefined, tax)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Tax PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
