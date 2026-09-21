import React, { useState } from 'react';
import { Employee } from '../types';
import {
  LogIn,
  User,
  Lock,
  CheckCircle,
  KeyRound,
  Shield,
  ArrowRight,
  Sparkles,
  X,
  Smartphone,
} from 'lucide-react';

interface EmployeeSelfLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  currentEmployee: Employee;
  onSelectEmployee: (emp: Employee) => void;
}

export const EmployeeSelfLoginModal: React.FC<EmployeeSelfLoginModalProps> = ({
  isOpen,
  onClose,
  employees,
  currentEmployee,
  onSelectEmployee,
}) => {
  const [authMode, setAuthMode] = useState<'quick' | 'credentials'>('quick');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const term = loginIdentifier.trim().toLowerCase();

    const matched = employees.find(
      (emp) =>
        emp.employeeCode.toLowerCase() === term ||
        emp.email.toLowerCase() === term ||
        emp.cardNo.toLowerCase() === term ||
        emp.phone.replace(/[^0-9]/g, '').endsWith(term.replace(/[^0-9]/g, ''))
    );

    if (!matched) {
      setErrorMessage(`No employee found matching "${loginIdentifier}". Try Employee Code (e.g., NV-101) or work email.`);
      return;
    }

    setSuccessMessage(`Welcome back, ${matched.name}!`);
    setTimeout(() => {
      onSelectEmployee(matched);
      setSuccessMessage('');
      onClose();
    }, 600);
  };

  const handleQuickSelect = (emp: Employee) => {
    setSuccessMessage(`Switched to ${emp.name} (${emp.employeeCode})`);
    setTimeout(() => {
      onSelectEmployee(emp);
      setSuccessMessage('');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="employee-self-login-modal"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 transition-all"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xs">
              <LogIn className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Employee Self-Login Portal
              </h3>
              <p className="text-xs text-emerald-100">
                Nepal Vending Secure HRM & Field Authentication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Pill */}
        <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={currentEmployee.avatar}
              alt={currentEmployee.name}
              className="w-8 h-8 rounded-full object-cover border border-emerald-300"
            />
            <div>
              <p className="text-xs font-bold text-emerald-950">
                Currently Active: <span className="text-emerald-700">{currentEmployee.name}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                {currentEmployee.employeeCode} • {currentEmployee.designation}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800 uppercase tracking-wide">
            {currentEmployee.role}
          </span>
        </div>

        {/* Mode Toggle */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setAuthMode('quick')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'quick'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              One-Tap Fast Switch
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('credentials')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'credentials'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              Code & PIN Login
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-100/90 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-700 shrink-0" />
              {errorMessage}
            </div>
          )}

          {authMode === 'quick' ? (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500 mb-2">
                Select your employee profile to log in immediately and manage attendance, tasks, leaves, and payslips:
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {employees.map((emp) => {
                  const isCurrent = emp.id === currentEmployee.id;
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => handleQuickSelect(emp)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all group ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/30'
                          : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{emp.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {emp.employeeCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{emp.designation}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCurrent ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : (
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCredentialLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Employee Code or Work Email
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  placeholder="e.g. NV-101 or aarav.shrestha@nepalvending.com.np"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Demo hint: NV-101 (Aarav), NV-102 (Sunita), NV-103 (Bibek), NV-104 (Roshani), NV-105 (Dipesh)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  Staff PIN / Biometric Password
                </label>
                <input
                  type="password"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="Enter 4-digit PIN (optional for demo)"
                  maxLength={6}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Sign In to Mobile Portal
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            Protected by Nepal Vending Single Sign-On (SSO) & Biometric Token Sync
          </p>
        </div>
      </div>
    </div>
  );
};
