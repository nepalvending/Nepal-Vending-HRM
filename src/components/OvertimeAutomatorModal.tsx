import React, { useState } from 'react';
import {
  Clock,
  Zap,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  X,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { ShiftConfig, Employee, AutomatedOvertimeSettings } from '../types';
import {
  DEFAULT_SHIFTS,
  calculateShiftAttendanceAndOvertime,
  formatMinutes,
} from '../utils/overtimeCalculator';

interface OvertimeAutomatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: ShiftConfig[];
  employees: Employee[];
  totalOtHours: number;
  totalOtCostNPR: number;
  settings?: AutomatedOvertimeSettings;
  onToggleMobileOvertime?: () => void;
}

export const OvertimeAutomatorModal: React.FC<OvertimeAutomatorModalProps> = ({
  isOpen,
  onClose,
  shifts,
  employees,
  totalOtHours,
  totalOtCostNPR,
  settings,
  onToggleMobileOvertime,
}) => {
  const [selectedShiftId, setSelectedShiftId] = useState<string>(shifts[0].id);
  const [simCheckIn, setSimCheckIn] = useState<string>('08:50');
  const [simCheckOut, setSimCheckOut] = useState<string>('20:30');
  const [simIsSaturday, setSimIsSaturday] = useState<boolean>(false);
  const [simHourlyRate, setSimHourlyRate] = useState<number>(265);

  if (!isOpen) return null;

  const currentShift = shifts.find((s) => s.id === selectedShiftId) || shifts[0];

  const simResult = calculateShiftAttendanceAndOvertime(
    simIsSaturday ? '2026-09-26' : '2026-09-24', // Saturday vs Wednesday
    simCheckIn,
    simCheckOut,
    currentShift,
    simHourlyRate
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-indigo-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">
                  Automated Shift Overtime Calculation Engine
                </h2>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Real-Time Biometric Sync
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Automatic calculation of extra hours, night restock differentials, and Saturday rates
              </p>
            </div>
          </div>
          <button
            id="close-overtime-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/60">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                Total Overtime Accrued
              </span>
              <div className="text-2xl font-black text-indigo-950 mt-1 font-mono">
                {totalOtHours.toFixed(1)}{' '}
                <span className="text-xs font-normal text-indigo-700">hours</span>
              </div>
              <p className="text-[11px] text-indigo-700 mt-1">
                Validated from Hikvision check-out stamps
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Total Overtime Payout (NPR)
              </span>
              <div className="text-2xl font-black text-emerald-950 mt-1 font-mono">
                रू {totalOtCostNPR.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                Auto-integrated into monthly payroll slips
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                Nepal Labor Standard
              </span>
              <div className="text-base font-bold text-slate-900 mt-1">
                1.5x Weekdays • 2.0x Rest Days
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Nepal Labor Act 2074 compliant overtime
              </p>
            </div>
          </div>

          {/* Mobile App Overtime Control Bar */}
          {settings && onToggleMobileOvertime && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                settings.isMobileOvertimeEnabled
                  ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                  : 'bg-amber-50/80 border-amber-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    settings.isMobileOvertimeEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Automated Overtime for Employee Mobile App
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        settings.isMobileOvertimeEnabled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {settings.isMobileOvertimeEnabled ? 'ACTIVE (ON)' : 'PAUSED (OFF)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {settings.isMobileOvertimeEnabled
                      ? 'Employees can view and automatically accumulate shift overtime on their mobile devices.'
                      : 'Overtime auto-accrual is paused on mobile devices; supervisor approval required.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleMobileOvertime}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
                  settings.isMobileOvertimeEnabled
                    ? 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                    : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
                }`}
              >
                {settings.isMobileOvertimeEnabled ? 'Turn OFF for Mobile' : 'Turn ON for Mobile'}
              </button>
            </div>
          )}

          {/* Configured Shifts Rules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Active Shift Schedules & Overtime Thresholds</span>
              </h3>
              <span className="text-[11px] text-slate-500">Auto-assigned per department</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {shifts.map((s) => (
                <div
                  key={s.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    selectedShiftId === s.id
                      ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">{s.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {s.startTime} - {s.endTime}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-600 mt-2">
                    <div className="flex justify-between">
                      <span>Expected Net Work:</span>
                      <span className="font-semibold text-slate-800">
                        {s.expectedWorkMinutes / 60} hrs (1h lunch)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grace Period:</span>
                      <span className="font-semibold text-slate-800">{s.gracePeriodMinutes} mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span>OT Minimum Trigger:</span>
                      <span className="font-semibold text-slate-800">
                        {s.overtimeThresholdMinutes} mins past shift
                      </span>
                    </div>
                    <div className="flex justify-between text-indigo-700 font-bold pt-1 border-t border-slate-100">
                      <span>Overtime Rate:</span>
                      <span>{s.otHourlyRateMultiplier}x Basic Hourly</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Live Calculation Simulator */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Live Interactive Shift & Overtime Simulator
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">
                  Selected Shift
                </label>
                <select
                  value={selectedShiftId}
                  onChange={(e) => setSelectedShiftId(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2"
                >
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">
                  Hikvision Check-In
                </label>
                <input
                  type="time"
                  value={simCheckIn}
                  onChange={(e) => setSimCheckIn(e.target.value)}
                  className="w-full text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">
                  Hikvision Check-Out
                </label>
                <input
                  type="time"
                  value={simCheckOut}
                  onChange={(e) => setSimCheckOut(e.target.value)}
                  className="w-full text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">
                  Employee Hourly Rate
                </label>
                <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1">
                  <span className="text-xs font-bold text-slate-500 mr-1">रू</span>
                  <input
                    type="number"
                    value={simHourlyRate}
                    onChange={(e) => setSimHourlyRate(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={simIsSaturday}
                  onChange={(e) => setSimIsSaturday(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Saturday / Gazetted Public Holiday (2.0x Double Overtime Rate)</span>
              </label>
            </div>

            {/* Live Result Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">
                  Regular Shift Hours
                </span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {formatMinutes(simResult.regularMinutes)}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-indigo-200 bg-indigo-50/20">
                <span className="text-[10px] font-bold text-indigo-600 block uppercase">
                  Calculated Overtime
                </span>
                <span className="text-base font-black text-indigo-700 font-mono">
                  {formatMinutes(simResult.overtimeMinutes)}
                </span>
                <span className="text-[10px] text-indigo-500 block">
                  ({(simResult.overtimeMinutes / 60).toFixed(2)} hrs)
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-200 bg-emerald-50/20">
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">
                  Calculated OT Wage
                </span>
                <span className="text-base font-black text-emerald-800 font-mono">
                  रू {simResult.overtimePayNPR.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 block">
                  @{simIsSaturday ? '2.0x weekend' : '1.5x regular'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">
                  Shift Compliance
                </span>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-0.5 ${
                    simResult.status === 'late'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {simResult.status === 'late'
                    ? `Late (${simResult.lateMinutes}m)`
                    : 'Punctual / On-Time'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            id="close-overtime-engine-done-btn"
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
          >
            Close & Apply Calculations
          </button>
        </div>
      </div>
    </div>
  );
};
