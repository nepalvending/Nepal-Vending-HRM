import React from 'react';
import {
  Building2,
  Smartphone,
  LayoutDashboard,
  HardDrive,
  Clock,
  Calendar,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { Employee } from '../types';

interface NavbarProps {
  viewMode: 'mobile' | 'manager';
  setViewMode: (mode: 'mobile' | 'manager') => void;
  selectedEmployee: Employee;
  setSelectedEmployee: (emp: Employee) => void;
  employees: Employee[];
  onOpenHikvisionModal: () => void;
  onOpenOvertimeModal: () => void;
  onOpenCalendarModal: () => void;
  onOpenSelfLoginModal?: () => void;
  onOpenSosDrawer?: () => void;
  onOpenGPSModal?: () => void;
  hikvisionOnlineCount: number;
  pendingLeavesCount: number;
  totalOtHoursThisMonth: number;
  isMobileOvertimeEnabled?: boolean;
  onToggleMobileOvertime?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  selectedEmployee,
  setSelectedEmployee,
  employees,
  onOpenHikvisionModal,
  onOpenOvertimeModal,
  onOpenCalendarModal,
  onOpenSelfLoginModal,
  onOpenSosDrawer,
  onOpenGPSModal,
  hikvisionOnlineCount,
  pendingLeavesCount,
  totalOtHoursThisMonth,
  isMobileOvertimeEnabled = true,
  onToggleMobileOvertime,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  Nepal Vending
                </span>
                <span className="text-[11px] font-semibold tracking-wide bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200/60 hidden sm:inline-block">
                  HRM & Smart Attendance
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight font-medium">
                नेपाल भेन्डिङ प्रा. लि. • Lalitpur & Kathmandu
              </p>
            </div>
          </div>

          {/* Center: View Switcher (Employee Mobile App vs Manager Dashboard) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              id="view-mode-mobile-btn"
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                viewMode === 'mobile'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Employee Mobile App</span>
            </button>
            <button
              id="view-mode-manager-btn"
              type="button"
              onClick={() => setViewMode('manager')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 relative ${
                viewMode === 'manager'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Manager Dashboard</span>
              {pendingLeavesCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-amber-500 rounded-full animate-pulse">
                  {pendingLeavesCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {/* Dual BS & AD Calendar Pill Button */}
            <button
              id="nav-dual-calendar-btn"
              type="button"
              onClick={onOpenCalendarModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-colors"
              title="View Nepali Bikram Sambat (BS) & Gregorian (AD) Calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <div className="text-left leading-tight hidden sm:block">
                <div className="text-[11px] font-bold text-amber-950">३ असोज २०८३ BS</div>
                <div className="text-[9px] text-amber-700 font-mono">19 Sep 2026 AD</div>
              </div>
              <span className="sm:hidden text-[11px]">BS / AD</span>
            </button>

            {/* Overtime Engine Shortcut & Quick Mobile App Toggle */}
            <div className="hidden lg:flex items-center rounded-lg border border-indigo-200/80 bg-indigo-50/70 p-0.5 shadow-2xs">
              <button
                id="nav-overtime-engine-btn"
                type="button"
                onClick={onOpenOvertimeModal}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
                title="Automated Shift Overtime Calculation Engine"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Auto-OT</span>
                <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.2 rounded font-mono">
                  {totalOtHoursThisMonth.toFixed(1)}h
                </span>
              </button>
              {onToggleMobileOvertime && (
                <button
                  id="nav-toggle-mobile-ot-btn"
                  type="button"
                  onClick={onToggleMobileOvertime}
                  title="Click to toggle Auto OT on/off for employee app"
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    isMobileOvertimeEnabled
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  App: {isMobileOvertimeEnabled ? 'ON' : 'OFF'}
                </button>
              )}
            </div>

            {/* Hikvision Sync Button */}
            <button
              id="nav-hikvision-sync-btn"
              type="button"
              onClick={onOpenHikvisionModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Hikvision Terminal / CSV</span>
            </button>

            {/* GPS Punch Shortcut */}
            {onOpenGPSModal && (
              <button
                id="nav-gps-punch-btn"
                type="button"
                onClick={onOpenGPSModal}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                title="GPS Mobile Punch & Geofencing"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>GPS Punch</span>
              </button>
            )}

            {/* SOS Emergency Hotline & Chat */}
            {onOpenSosDrawer && (
              <button
                id="nav-sos-btn"
                type="button"
                onClick={onOpenSosDrawer}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
                title="Emergency Hotline, One-Tap Dial & Support Chat"
              >
                <span className="text-[11px] font-black">SOS</span>
              </button>
            )}

            {/* Employee Avatar Selector (Quick Role switch) */}
            <div className="flex items-center pl-1 border-l border-slate-200 ml-1">
              {onOpenSelfLoginModal && (
                <button
                  type="button"
                  onClick={onOpenSelfLoginModal}
                  className="mr-2 text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 hidden md:block"
                  title="Employee Self-Login Portal"
                >
                  Self Login
                </button>
              )}
              <label htmlFor="active-employee-select" className="sr-only">
                Switch Active Employee
              </label>
              <div className="flex items-center gap-2">
                <img
                  src={selectedEmployee.avatar}
                  alt={selectedEmployee.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
                />
                <div className="hidden md:block text-left">
                  <select
                    id="active-employee-select"
                    value={selectedEmployee.id}
                    onChange={(e) => {
                      const found = employees.find((emp) => emp.id === e.target.value);
                      if (found) setSelectedEmployee(found);
                    }}
                    className="text-xs font-bold text-slate-800 bg-transparent border-0 focus:ring-0 cursor-pointer p-0 pr-4"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeCode} - {emp.designation.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 leading-none">
                    {selectedEmployee.department}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
