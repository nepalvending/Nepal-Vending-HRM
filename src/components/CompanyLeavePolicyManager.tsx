import React, { useState } from 'react';
import { CompanyLeavePolicy, LeaveType, Employee } from '../types';
import {
  ShieldCheck,
  Edit2,
  Check,
  Plus,
  RotateCcw,
  Sliders,
  Users,
  Calendar,
  DollarSign,
  FileCheck,
  Sparkles,
  Info,
} from 'lucide-react';

interface CompanyLeavePolicyManagerProps {
  policies: CompanyLeavePolicy[];
  employees: Employee[];
  onUpdatePolicy: (updatedPolicy: CompanyLeavePolicy) => void;
  onUpdateEmployeeLeaveBalance: (
    employeeId: string,
    leaveBalances: Employee['leaveBalance']
  ) => void;
}

export const CompanyLeavePolicyManager: React.FC<CompanyLeavePolicyManagerProps> = ({
  policies,
  employees,
  onUpdatePolicy,
  onUpdateEmployeeLeaveBalance,
}) => {
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [editDaysAllowed, setEditDaysAllowed] = useState<number>(0);
  const [editAccrualRule, setEditAccrualRule] = useState<CompanyLeavePolicy['accrualRule']>('bi_monthly_1st_18th');
  const [editMaxCarryForward, setEditMaxCarryForward] = useState<number>(0);
  const [editIsPaid, setEditIsPaid] = useState<boolean>(true);
  const [editEncashable, setEditEncashable] = useState<boolean>(false);
  const [editRequiresProofDays, setEditRequiresProofDays] = useState<number>(0);

  // Employee-specific allocation state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');
  const [customCasual, setCustomCasual] = useState<number>(6);
  const [customSick, setCustomSick] = useState<number>(12);
  const [customAnnual, setCustomAnnual] = useState<number>(18);
  const [customFestive, setCustomFestive] = useState<number>(6);
  const [customMaternity, setCustomMaternity] = useState<number>(98);
  const [customMourning, setCustomMourning] = useState<number>(13);
  const [balanceSavedFeedback, setBalanceSavedFeedback] = useState(false);

  const selectedEmp = employees.find((e) => e.id === selectedEmployeeId) || employees[0];

  const startEditPolicy = (policy: CompanyLeavePolicy) => {
    setEditingPolicyId(policy.id);
    setEditDaysAllowed(policy.daysAllowedPerYear);
    setEditAccrualRule(policy.accrualRule);
    setEditMaxCarryForward(policy.maxCarryForwardDays);
    setEditIsPaid(policy.isPaid);
    setEditEncashable(policy.encashable);
    setEditRequiresProofDays(policy.requiresDocumentProofAfterDays || 0);
  };

  const saveEditPolicy = (originalPolicy: CompanyLeavePolicy) => {
    onUpdatePolicy({
      ...originalPolicy,
      daysAllowedPerYear: Number(editDaysAllowed),
      accrualRule: editAccrualRule,
      maxCarryForwardDays: Number(editMaxCarryForward),
      isPaid: editIsPaid,
      encashable: editEncashable,
      requiresDocumentProofAfterDays: editRequiresProofDays > 0 ? Number(editRequiresProofDays) : undefined,
    });
    setEditingPolicyId(null);
  };

  const handleSelectEmployeeForBalance = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setCustomCasual(emp.leaveBalance.casual);
      setCustomSick(emp.leaveBalance.sick);
      setCustomAnnual(emp.leaveBalance.annual);
      setCustomFestive(emp.leaveBalance.festive ?? 6);
      setCustomMaternity(emp.leaveBalance.maternityPaternity ?? 98);
      setCustomMourning(emp.leaveBalance.mourning ?? 13);
    }
  };

  const handleSaveEmployeeBalance = () => {
    if (!selectedEmp) return;
    onUpdateEmployeeLeaveBalance(selectedEmp.id, {
      ...selectedEmp.leaveBalance,
      casual: Number(customCasual),
      sick: Number(customSick),
      annual: Number(customAnnual),
      festive: Number(customFestive),
      maternityPaternity: Number(customMaternity),
      mourning: Number(customMourning),
    });
    setBalanceSavedFeedback(true);
    setTimeout(() => setBalanceSavedFeedback(false), 2000);
  };

  return (
    <div id="company-leave-policy-manager" className="space-y-6">
      {/* Policy Rules Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-800 to-emerald-900 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Nepal Labor Act 2074 Compliant
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/15 text-white">
              Bi-Monthly 1st & 18th Accrual Rule
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-tight mt-1">
            Company Leave Policy & Quota Manager
          </h3>
          <p className="text-xs text-emerald-100 max-w-2xl mt-0.5">
            Define statutory annual entitlements for each leave type and allocate or top-up individualized quotas for technical and field staff.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl backdrop-blur-xs shrink-0">
          <div className="text-center px-3 border-r border-white/20">
            <p className="text-[10px] text-emerald-200">Active Leave Types</p>
            <p className="text-lg font-black">{policies.length}</p>
          </div>
          <div className="text-center px-3">
            <p className="text-[10px] text-emerald-200">Covered Employees</p>
            <p className="text-lg font-black">{employees.length}</p>
          </div>
        </div>
      </div>

      {/* Main Leave Policies Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              Statutory Leave Policies & Days Allocation
            </h4>
            <p className="text-xs text-slate-500">
              Click "Edit Policy" on any row to modify annual allowed days, carry-forward, or accrual schedule.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Leave Type & Title</th>
                <th className="py-3 px-3 text-center">Days / Year</th>
                <th className="py-3 px-3">Accrual Schedule</th>
                <th className="py-3 px-3 text-center">Compensation</th>
                <th className="py-3 px-3 text-center">Carry Forward</th>
                <th className="py-3 px-3 text-center">Encashable</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policies.map((policy) => {
                const isEditing = editingPolicyId === policy.id;
                return (
                  <tr
                    key={policy.id}
                    className={`transition-colors ${
                      isEditing ? 'bg-emerald-50/50' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Title */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{policy.leaveType}</p>
                        <p className="text-[11px] text-emerald-700 font-medium">{policy.nepaliName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs">{policy.description}</p>
                      </div>
                    </td>

                    {/* Days Allowed */}
                    <td className="py-3.5 px-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="365"
                          value={editDaysAllowed}
                          onChange={(e) => setEditDaysAllowed(Number(e.target.value))}
                          className="w-16 text-center text-xs font-bold border border-emerald-400 rounded-lg p-1 bg-white text-slate-900"
                        />
                      ) : (
                        <span className="text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {policy.daysAllowedPerYear} days
                        </span>
                      )}
                    </td>

                    {/* Accrual Rule */}
                    <td className="py-3.5 px-3">
                      {isEditing ? (
                        <select
                          value={editAccrualRule}
                          onChange={(e) => setEditAccrualRule(e.target.value as any)}
                          className="text-xs border border-emerald-400 rounded-lg p-1 bg-white text-slate-900"
                        >
                          <option value="bi_monthly_1st_18th">Bi-Monthly (1st & 18th)</option>
                          <option value="annual_upfront">Annual Upfront (1st Baisakh)</option>
                          <option value="monthly_pro_rata">Monthly Pro-Rata (1 for 20 days)</option>
                          <option value="as_needed">As Needed / Event Triggered</option>
                        </select>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {policy.accrualRule === 'bi_monthly_1st_18th'
                            ? 'Bi-Monthly (1st & 18th)'
                            : policy.accrualRule === 'annual_upfront'
                            ? 'Annual Upfront'
                            : policy.accrualRule === 'monthly_pro_rata'
                            ? 'Monthly Pro-Rata'
                            : 'Event Triggered'}
                        </span>
                      )}
                    </td>

                    {/* Compensation (Paid / Unpaid) */}
                    <td className="py-3.5 px-3 text-center">
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => setEditIsPaid(!editIsPaid)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-md transition-colors ${
                            editIsPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {editIsPaid ? '100% Paid' : 'Loss of Pay'}
                        </button>
                      ) : (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            policy.isPaid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {policy.isPaid ? 'Paid' : 'Unpaid (LOP)'}
                        </span>
                      )}
                    </td>

                    {/* Carry Forward */}
                    <td className="py-3.5 px-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="180"
                          value={editMaxCarryForward}
                          onChange={(e) => setEditMaxCarryForward(Number(e.target.value))}
                          className="w-14 text-center text-xs border border-emerald-400 rounded-lg p-1 bg-white text-slate-900"
                        />
                      ) : (
                        <span className="text-xs text-slate-700 font-mono">
                          {policy.maxCarryForwardDays > 0
                            ? `Up to ${policy.maxCarryForwardDays}d`
                            : 'No Carry'}
                        </span>
                      )}
                    </td>

                    {/* Encashable */}
                    <td className="py-3.5 px-3 text-center">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={editEncashable}
                          onChange={(e) => setEditEncashable(e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600"
                        />
                      ) : (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            policy.encashable
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'text-slate-400'
                          }`}
                        >
                          {policy.encashable ? 'Encashable' : 'No'}
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => saveEditPolicy(policy)}
                            className="p-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-xs"
                            title="Save policy updates"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPolicyId(null)}
                            className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                            title="Cancel"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditPolicy(policy)}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
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

      {/* Individual Employee Leave Balance Adjustment / Allocation */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Staff-Specific Leave Quota Allocation & Top-Up
              </h4>
              <p className="text-xs text-slate-500">
                Assign or override specific leave quotas for individual staff based on tenure or special compensation
              </p>
            </div>
          </div>

          {/* Employee Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-600 shrink-0">Employee:</span>
            <select
              value={selectedEmployeeId}
              onChange={(e) => handleSelectEmployeeForBalance(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 flex-1 sm:flex-initial"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeCode}) - {emp.department}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Employee Info Pill */}
        {selectedEmp && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedEmp.avatar}
                alt={selectedEmp.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-300"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  {selectedEmp.name}
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                    {selectedEmp.employeeCode}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500">
                  {selectedEmp.designation} • Joined: {selectedEmp.joinDate}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
              Base: NPR {selectedEmp.baseSalaryNPR.toLocaleString()}/mo
            </span>
          </div>
        )}

        {/* Quota Inputs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Casual */}
          <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1">
            <label className="block text-[11px] font-bold text-teal-900">
              Casual Leave (भइपरी)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={customCasual}
              onChange={(e) => setCustomCasual(Number(e.target.value))}
              className="w-full text-center text-sm font-black p-1.5 bg-white border border-teal-300 rounded-lg text-slate-900"
            />
            <p className="text-[10px] text-teal-700 text-center">Policy Default: 6d</p>
          </div>

          {/* Sick */}
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
            <label className="block text-[11px] font-bold text-rose-900">
              Sick Leave (बिरामी)
            </label>
            <input
              type="number"
              min="0"
              max="45"
              value={customSick}
              onChange={(e) => setCustomSick(Number(e.target.value))}
              className="w-full text-center text-sm font-black p-1.5 bg-white border border-rose-300 rounded-lg text-slate-900"
            />
            <p className="text-[10px] text-rose-700 text-center">Policy Default: 12d</p>
          </div>

          {/* Annual */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
            <label className="block text-[11px] font-bold text-blue-900">
              Annual / Home (घर)
            </label>
            <input
              type="number"
              min="0"
              max="90"
              value={customAnnual}
              onChange={(e) => setCustomAnnual(Number(e.target.value))}
              className="w-full text-center text-sm font-black p-1.5 bg-white border border-blue-300 rounded-lg text-slate-900"
            />
            <p className="text-[10px] text-blue-700 text-center">Policy Default: 18d</p>
          </div>

          {/* Festive */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
            <label className="block text-[11px] font-bold text-amber-900">
              Festive Leave (चाडपर्व)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={customFestive}
              onChange={(e) => setCustomFestive(Number(e.target.value))}
              className="w-full text-center text-sm font-black p-1.5 bg-white border border-amber-300 rounded-lg text-slate-900"
            />
            <p className="text-[10px] text-amber-700 text-center">Dashain/Tihar/Chhath</p>
          </div>

          {/* Maternity / Paternity */}
          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1">
            <label className="block text-[11px] font-bold text-purple-900">
              Maternity/Paternity
            </label>
            <input
              type="number"
              min="0"
              max="98"
              value={customMaternity}
              onChange={(e) => setCustomMaternity(Number(e.target.value))}
              className="w-full text-center text-sm font-black p-1.5 bg-white border border-purple-300 rounded-lg text-slate-900"
            />
            <p className="text-[10px] text-purple-700 text-center">Labor Act Sec 37</p>
          </div>

          {/* Mourning */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 space-y-1">
            <label className="block text-[11px] font-bold text-slate-800">
              Mourning (किरिया)
            </label>
            <input
              type="number"
              min="0"
              max="15"
              value={customMourning}
              onChange={(e) => setCustomMourning(Number(e.target.value))}
              className="w-full text-center text-sm font-black p-1.5 bg-white border border-slate-400 rounded-lg text-slate-900"
            />
            <p className="text-[10px] text-slate-600 text-center">13 Days Paid</p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          {balanceSavedFeedback ? (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-pulse">
              <Check className="w-4 h-4" />
              Leave balances successfully updated in payroll & leave engine!
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              Updates immediately reflect in employee leave balance cards and payroll LOP calculations.
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveEmployeeBalance}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Save Employee Leave Quotas
          </button>
        </div>
      </div>
    </div>
  );
};
