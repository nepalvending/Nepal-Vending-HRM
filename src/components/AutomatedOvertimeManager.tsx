import React, { useState } from 'react';
import {
  Zap,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Users,
  ShieldCheck,
  Search,
  Check,
  X,
  Clock,
  Building2,
  Info,
  ArrowRight,
} from 'lucide-react';
import { Employee, AutomatedOvertimeSettings } from '../types';

interface AutomatedOvertimeManagerProps {
  settings: AutomatedOvertimeSettings;
  onUpdateSettings: (newSettings: Partial<AutomatedOvertimeSettings>) => void;
  employees: Employee[];
  onSwitchToMobilePreview?: () => void;
}

export const AutomatedOvertimeManager: React.FC<AutomatedOvertimeManagerProps> = ({
  settings,
  onUpdateSettings,
  employees,
  onSwitchToMobilePreview,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const departments = ['all', ...Array.from(new Set(employees.map((e) => e.department)))];

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 3000);
  };

  const handleToggleGlobal = () => {
    const nextState = !settings.isMobileOvertimeEnabled;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    onUpdateSettings({
      isMobileOvertimeEnabled: nextState,
      updatedAt: `Today at ${timeStr}`,
      updatedBy: 'Sunita Adhikari (HR Manager)',
    });
    triggerToast(
      nextState
        ? 'Automated Overtime is now ON for Employee Mobile App.'
        : 'Automated Overtime has been turned OFF for Employee Mobile App.'
    );
  };

  const handleToggleEmployee = (employeeId: string) => {
    // If not set yet in overrides, defaults to current global state
    const currentVal =
      settings.employeeOverrides[employeeId] !== undefined
        ? settings.employeeOverrides[employeeId]
        : settings.isMobileOvertimeEnabled;

    const newOverrides = {
      ...settings.employeeOverrides,
      [employeeId]: !currentVal,
    };

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    onUpdateSettings({
      employeeOverrides: newOverrides,
      updatedAt: `Today at ${timeStr}`,
    });

    const emp = employees.find((e) => e.id === employeeId);
    triggerToast(
      `${emp?.name || 'Employee'} OT set to ${!currentVal ? 'ENABLED' : 'DISABLED'}.`
    );
  };

  const handleBulkSet = (filterType: 'all_on' | 'all_off' | 'field_only') => {
    const newOverrides: { [empId: string]: boolean } = {};
    employees.forEach((emp) => {
      if (filterType === 'all_on') {
        newOverrides[emp.id] = true;
      } else if (filterType === 'all_off') {
        newOverrides[emp.id] = false;
      } else if (filterType === 'field_only') {
        const isField =
          emp.department.toLowerCase().includes('technical') ||
          emp.department.toLowerCase().includes('logistics') ||
          emp.designation.toLowerCase().includes('technician');
        newOverrides[emp.id] = isField;
      }
    });

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    onUpdateSettings({
      employeeOverrides: newOverrides,
      updatedAt: `Today at ${timeStr}`,
    });

    triggerToast(
      filterType === 'all_on'
        ? 'All employees enabled for automated mobile OT.'
        : filterType === 'all_off'
        ? 'All employees disabled for automated mobile OT.'
        : 'Enabled mobile OT for Field Operations & Technical staff only.'
    );
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const totalEnabledCount = employees.filter((emp) => {
    return settings.employeeOverrides[emp.id] !== undefined
      ? settings.employeeOverrides[emp.id]
      : settings.isMobileOvertimeEnabled;
  }).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Zap className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                  <span>Automated Overtime Manager</span>
                  <span className="text-[10px] bg-white/10 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-white/10">
                    Mobile Control
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Control automated shift overtime calculation, accrual, and visibility on the Employee Mobile App
                </p>
              </div>
            </div>
          </div>

          {/* Quick Preview Switcher */}
          {onSwitchToMobilePreview && (
            <button
              type="button"
              onClick={onSwitchToMobilePreview}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all self-start md:self-auto"
            >
              <Smartphone className="w-4 h-4 text-rose-400" />
              <span>Preview Employee Mobile App</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* Save Toast Feedback */}
      {saveToast && (
        <div className="mx-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      <div className="p-6 pt-1 space-y-6">
        {/* MASTER SWITCH CARD */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            settings.isMobileOvertimeEnabled
              ? 'bg-gradient-to-r from-emerald-50/70 via-slate-50 to-white border-emerald-300 shadow-xs'
              : 'bg-gradient-to-r from-amber-50/70 via-slate-50 to-white border-amber-300 shadow-xs'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    settings.isMobileOvertimeEnabled
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Master Switch: Employee Mobile App Auto-Overtime
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    settings.isMobileOvertimeEnabled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {settings.isMobileOvertimeEnabled ? 'ACTIVE (ON)' : 'PAUSED (OFF)'}
                </span>
              </div>

              <h4 className="text-base font-black text-slate-900">
                {settings.isMobileOvertimeEnabled
                  ? 'Automated Mobile Overtime is currently TURNED ON'
                  : 'Automated Mobile Overtime is currently TURNED OFF'}
              </h4>

              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                {settings.isMobileOvertimeEnabled ? (
                  <span>
                    Employees can view real-time overtime accruals, earned NPR amounts, and automatic OT tags directly on their mobile app past the 18:00 shift schedule.
                  </span>
                ) : (
                  <span className="text-amber-900 font-medium">
                    Overtime auto-accrual is paused. The Employee Mobile App displays an official notice that automated mobile overtime is turned off by management. Unscheduled punches will require prior manager approval.
                  </span>
                )}
              </p>

              <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 font-mono">
                <span>Updated by: {settings.updatedBy}</span>
                <span>•</span>
                <span>{settings.updatedAt}</span>
              </div>
            </div>

            {/* Toggle Button */}
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <button
                id="toggle-master-mobile-overtime-btn"
                type="button"
                onClick={handleToggleGlobal}
                className={`relative inline-flex h-9 w-18 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.isMobileOvertimeEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={settings.isMobileOvertimeEnabled}
              >
                <span className="sr-only">Toggle Mobile Overtime</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center text-xs font-bold ${
                    settings.isMobileOvertimeEnabled
                      ? 'translate-x-9 text-emerald-600'
                      : 'translate-x-0 text-slate-400'
                  }`}
                >
                  {settings.isMobileOvertimeEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Click to {settings.isMobileOvertimeEnabled ? 'Turn OFF' : 'Turn ON'}
              </span>
            </div>
          </div>
        </div>

        {/* POLICY CONFIGURATION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Grace Period */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Shift Grace Period</span>
              </span>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {settings.gracePeriodMinutes} mins
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Checkout buffer past official 18:00 shift end before OT starts counting
            </p>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[0, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => onUpdateSettings({ gracePeriodMinutes: mins })}
                  className={`py-1 text-xs font-bold rounded-lg border transition-all ${
                    settings.gracePeriodMinutes === mins
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Rate Multiplier */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-600" />
                <span>Statutory Overtime Rate</span>
              </span>
              <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                {settings.overtimeRateMultiplier}x Regular Rate
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Under Nepal Labor Act 2074 (Section 30), overtime is compensated at 1.5× basic hourly wage
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 font-bold bg-white p-2 rounded-lg border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Nepal Labor Act 2074 Compliant</span>
            </div>
          </div>

          {/* Auto-Approval Threshold */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>Auto-Approve Daily OT</span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {settings.autoApprovalThresholdHours === 0
                  ? 'Require Review'
                  : `< ${settings.autoApprovalThresholdHours} hrs`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Hours below threshold skip pending queue and auto-sync into monthly payroll
            </p>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[0, 1, 2].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => onUpdateSettings({ autoApprovalThresholdHours: hrs })}
                  className={`py-1 text-xs font-bold rounded-lg border transition-all ${
                    settings.autoApprovalThresholdHours === hrs
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {hrs === 0 ? 'Review All' : `< ${hrs}h Auto`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* INDIVIDUAL EMPLOYEE ROSTER & ACCESS OVERRIDES */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden space-y-0">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" />
                <span>Employee-Specific Overtime Eligibility & Overrides</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-mono px-2 py-0.5 rounded-full font-bold">
                  {totalEnabledCount} / {employees.length} Staff Enabled
                </span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Grant or restrict mobile automated overtime tracking for individual personnel
              </p>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Bulk:</span>
              <button
                type="button"
                onClick={() => handleBulkSet('all_on')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-emerald-700 flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Enable All</span>
              </button>
              <button
                type="button"
                onClick={() => handleBulkSet('field_only')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-indigo-700 flex items-center gap-1 shadow-2xs"
              >
                <Zap className="w-3 h-3 text-indigo-600" />
                <span>Field & Tech Only</span>
              </button>
              <button
                type="button"
                onClick={() => handleBulkSet('all_off')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-rose-700 flex items-center gap-1 shadow-2xs"
              >
                <X className="w-3 h-3 text-rose-600" />
                <span>Disable All</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff name, designation or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium text-slate-700 w-full sm:w-auto"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Employee Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Staff Member</th>
                  <th className="px-4 py-2.5">Department & Role</th>
                  <th className="px-4 py-2.5">Hourly Rate</th>
                  <th className="px-4 py-2.5">Effective Mobile OT Status</th>
                  <th className="px-4 py-2.5 text-right">Mobile OT Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const isExplicit = settings.employeeOverrides[emp.id] !== undefined;
                  const isEnabled = isExplicit
                    ? settings.employeeOverrides[emp.id]
                    : settings.isMobileOvertimeEnabled;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{emp.name}</div>
                            <div className="font-mono text-[10px] text-slate-400">
                              {emp.employeeCode} • Card: {emp.cardNo}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{emp.designation}</div>
                        <div className="text-[10px] text-slate-500">{emp.department}</div>
                      </td>

                      <td className="px-4 py-3 font-mono">
                        <div className="font-bold text-slate-900">रू {emp.hourlyRateNPR}/h</div>
                        <div className="text-[10px] text-slate-400">
                          OT @ रू {Math.round(emp.hourlyRateNPR * settings.overtimeRateMultiplier)}/h
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {isEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active in Mobile</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            <X className="w-3 h-3 text-amber-600" />
                            <span>Disabled / Paused</span>
                          </span>
                        )}
                        {isExplicit && (
                          <span className="ml-1 text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1 rounded">
                            Custom
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          id={`toggle-emp-ot-${emp.id}`}
                          type="button"
                          onClick={() => handleToggleEmployee(emp.id)}
                          className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all ${
                            isEnabled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {isEnabled ? 'Turn OFF' : 'Turn ON'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
