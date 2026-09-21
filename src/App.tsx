/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_PAYROLLS,
  INITIAL_TAX_REPORTS,
  INITIAL_DEVICES,
  DEFAULT_COMPANY_LEAVE_POLICIES,
  INITIAL_TASKS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SUPPORT_MESSAGES,
} from './data/mockData';
import { DEFAULT_SHIFTS, calculateShiftAttendanceAndOvertime } from './utils/overtimeCalculator';
import { recalculateAllEmployeePayrolls } from './utils/payrollCalculator';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollSlip,
  TaxReport,
  HikvisionDevice,
  ShiftConfig,
  AutomatedOvertimeSettings,
  CompanyLeavePolicy,
  EmployeeTask,
  CompanyAnnouncement,
  SupportChatMessage,
} from './types';
import { Navbar } from './components/Navbar';
import { EmployeePortal } from './components/EmployeePortal';
import { ManagerDashboard } from './components/ManagerDashboard';
import { HikvisionSyncModal } from './components/HikvisionSyncModal';
import { OvertimeAutomatorModal } from './components/OvertimeAutomatorModal';
import { PayslipAndTaxModal } from './components/PayslipAndTaxModal';
import { DualCalendarModal } from './components/DualCalendarModal';
import { EmployeeProfileEditModal } from './components/EmployeeProfileEditModal';
import { EmployeeSelfLoginModal } from './components/EmployeeSelfLoginModal';
import { EmergencySosDrawer } from './components/EmergencySosDrawer';
import { GPSAttendanceModal } from './components/GPSAttendanceModal';

export default function App() {
  const [viewMode, setViewMode] = useState<'mobile' | 'manager'>('mobile');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>(INITIAL_EMPLOYEES[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [devices] = useState<HikvisionDevice[]>(INITIAL_DEVICES);
  const [shifts] = useState<ShiftConfig[]>(DEFAULT_SHIFTS);
  const [payrollSlips, setPayrollSlips] = useState<PayrollSlip[]>(() =>
    recalculateAllEmployeePayrolls(INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, INITIAL_LEAVES)
  );
  const [taxReports] = useState<TaxReport[]>(INITIAL_TAX_REPORTS);

  // Leave Policies, Announcements, Tasks, and Support state
  const [leavePolicies, setLeavePolicies] = useState<CompanyLeavePolicy[]>(DEFAULT_COMPANY_LEAVE_POLICIES);
  const [announcements, setAnnouncements] = useState<CompanyAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [tasks, setTasks] = useState<EmployeeTask[]>(INITIAL_TASKS);
  const [supportMessages, setSupportMessages] = useState<SupportChatMessage[]>(INITIAL_SUPPORT_MESSAGES);

  // New Modals & Drawers state
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [isSelfLoginModalOpen, setIsSelfLoginModalOpen] = useState(false);
  const [isSosDrawerOpen, setIsSosDrawerOpen] = useState(false);
  const [isGPSModalOpen, setIsGPSModalOpen] = useState(false);

  // Automated Overtime Settings (can be ON or OFF for employee mobile app)
  const [overtimeSettings, setOvertimeSettings] = useState<AutomatedOvertimeSettings>({
    isMobileOvertimeEnabled: true,
    autoApprovalThresholdHours: 2,
    requirePreApprovalNotice: true,
    gracePeriodMinutes: 15,
    overtimeRateMultiplier: 1.5,
    employeeOverrides: {},
    updatedAt: 'Today at 10:10',
    updatedBy: 'Sunita Adhikari (HR Manager)',
  });

  const handleUpdateOvertimeSettings = (newSettings: Partial<AutomatedOvertimeSettings>) => {
    setOvertimeSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  const handleToggleGlobalMobileOvertime = () => {
    const nextState = !overtimeSettings.isMobileOvertimeEnabled;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOvertimeSettings((prev) => ({
      ...prev,
      isMobileOvertimeEnabled: nextState,
      updatedAt: `Today at ${timeStr}`,
    }));
  };

  // Modals state
  const [isHikvisionModalOpen, setIsHikvisionModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [documentModal, setDocumentModal] = useState<{
    isOpen: boolean;
    type: 'payslip' | 'tax';
    payroll?: PayrollSlip;
    taxReport?: TaxReport;
  }>({
    isOpen: false,
    type: 'payslip',
  });

  // Derived counts
  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'pending').length;
  const totalOtMinutesThisMonth = attendanceRecords.reduce(
    (acc, curr) => acc + (curr.overtimeMinutes || 0),
    0
  );
  const totalOtCostThisMonth = attendanceRecords.reduce(
    (acc, curr) => acc + (curr.overtimePayNPR || 0),
    0
  );

  // Handler: Employee submits leave request
  const handleSubmitLeaveRequest = (
    newLeaveData: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>
  ) => {
    const newLeave: LeaveRequest = {
      ...newLeaveData,
      id: `lev_${Date.now()}`,
      appliedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending',
    };
    setLeaveRequests((prev) => [newLeave, ...prev]);
  };

  // Handler: Manager approves leave request
  const handleApproveLeave = (leaveId: string, managerRemark: string) => {
    let updatedLeavesList: LeaveRequest[] = [];
    setLeaveRequests((prev) => {
      updatedLeavesList = prev.map((l) => {
        if (l.id !== leaveId) return l;
        return {
          ...l,
          status: 'approved' as const,
          managerRemarks: managerRemark,
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          reviewedBy: 'Sunita Adhikari (HR Manager)',
        };
      });

      // Automatically recalculate payroll with the newly approved leave & LOP deductions
      setTimeout(() => {
        setPayrollSlips(recalculateAllEmployeePayrolls(employees, attendanceRecords, updatedLeavesList));
      }, 0);

      return updatedLeavesList;
    });

    // Deduct leave balance for employee
    const targetLeave = leaveRequests.find((l) => l.id === leaveId);
    if (targetLeave) {
      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.id !== targetLeave.employeeId) return emp;
          const updatedBalance = { ...emp.leaveBalance };
          if (targetLeave.leaveType === 'Casual Leave') {
            updatedBalance.casual = Math.max(0, updatedBalance.casual - targetLeave.daysCount);
          } else if (targetLeave.leaveType === 'Sick Leave') {
            updatedBalance.sick = Math.max(0, updatedBalance.sick - targetLeave.daysCount);
          } else if (targetLeave.leaveType === 'Annual Leave' || targetLeave.leaveType === 'Festive Leave') {
            updatedBalance.annual = Math.max(0, updatedBalance.annual - targetLeave.daysCount);
          }

          const updatedEmp = { ...emp, leaveBalance: updatedBalance };
          if (selectedEmployee.id === emp.id) {
            setSelectedEmployee(updatedEmp);
          }
          return updatedEmp;
        })
      );
    }
  };

  const handleRecalculateAllPayrolls = () => {
    setPayrollSlips(recalculateAllEmployeePayrolls(employees, attendanceRecords, leaveRequests));
  };

  // Handler: Manager rejects leave request
  const handleRejectLeave = (leaveId: string, managerRemark: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => {
        if (l.id !== leaveId) return l;
        return {
          ...l,
          status: 'rejected',
          managerRemarks: managerRemark,
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          reviewedBy: 'Sunita Adhikari (HR Manager)',
        };
      })
    );
  };

  // Handler: Manager approves overtime record
  const handleApproveOvertime = (recordId: string) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) => (rec.id === recordId ? { ...rec, isOvertimeApproved: true } : rec))
    );
  };

  // Handler: Biometric Punch (Check-in or Check-out)
  const handlePunchAttendance = (empId: string, punchType: 'Check-In' | 'Check-Out') => {
    const today = '2026-09-19';
    const currentTime = new Date().toTimeString().split(' ')[0];
    const emp = employees.find((e) => e.id === empId) || selectedEmployee;
    const shift = shifts.find((s) => s.id === emp.shiftId) || shifts[0];

    if (punchType === 'Check-In') {
      const newRec: AttendanceRecord = {
        id: `att_${emp.id}_${today}`,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.name,
        date: today,
        checkIn: currentTime,
        checkOut: null,
        shiftId: shift.id,
        shiftName: shift.name,
        verifyMode: 'Face',
        terminalId: 'HIK-KTM-01',
        terminalName: 'Kathmandu HQ MinMoe Facial Recognition',
        regularMinutes: 0,
        overtimeMinutes: 0,
        lateMinutes: 0,
        earlyDepartureMinutes: 0,
        status: 'present',
        isOvertimeApproved: false,
        overtimePayNPR: 0,
        notes: 'Real-time face scan verified at Kathmandu HQ terminal',
      };
      setAttendanceRecords((prev) => [newRec, ...prev]);
    } else {
      // Check-out: calculate overtime
      setAttendanceRecords((prev) =>
        prev.map((rec) => {
          if (rec.employeeId === emp.id && rec.date === today) {
            const calc = calculateShiftAttendanceAndOvertime(
              today,
              rec.checkIn,
              currentTime,
              shift,
              emp.hourlyRateNPR
            );

            // Update payroll slip if overtime earned
            if (calc.overtimeMinutes > 0) {
              setPayrollSlips((pSlips) =>
                pSlips.map((p) => {
                  if (p.employeeId === emp.id) {
                    const extraOtHours = calc.overtimeMinutes / 60;
                    const newTotalOt = p.overtimeHours + extraOtHours;
                    const newOtPay = p.overtimePay + calc.overtimePayNPR;
                    const newGross = p.basicSalary + p.dearnessAllowance + p.houseRentAllowance + p.conveyanceAllowance + newOtPay;
                    const newNet = newGross - p.totalDeductions;
                    return {
                      ...p,
                      overtimeHours: newTotalOt,
                      overtimePay: newOtPay,
                      grossEarnings: newGross,
                      netPay: newNet,
                    };
                  }
                  return p;
                })
              );
            }

            return {
              ...rec,
              checkOut: currentTime,
              regularMinutes: calc.regularMinutes,
              overtimeMinutes: calc.overtimeMinutes,
              lateMinutes: calc.lateMinutes,
              earlyDepartureMinutes: calc.earlyDepartureMinutes,
              status: calc.status,
              isOvertimeApproved: calc.overtimeMinutes > 0,
              overtimePayNPR: calc.overtimePayNPR,
              notes: calc.overtimeMinutes > 0 ? `Automated overtime: ${(calc.overtimeMinutes / 60).toFixed(1)} hrs` : undefined,
            };
          }
          return rec;
        })
      );
    }
  };

  // Handler: Import CSV attendance or Direct Terminal sync
  const handleImportAttendance = (newRecords: AttendanceRecord[]) => {
    setAttendanceRecords((prev) => {
      // Merge records by id or date+employeeCode
      const existingIds = new Set(prev.map((r) => r.id));
      const filteredNew = newRecords.filter((r) => !existingIds.has(r.id));
      return [...filteredNew, ...prev];
    });

    // Update Overtime into Payroll Slips
    const otMap: { [empCode: string]: { hours: number; pay: number } } = {};
    newRecords.forEach((r) => {
      if (r.overtimeMinutes > 0) {
        if (!otMap[r.employeeCode]) otMap[r.employeeCode] = { hours: 0, pay: 0 };
        otMap[r.employeeCode].hours += r.overtimeMinutes / 60;
        otMap[r.employeeCode].pay += r.overtimePayNPR;
      }
    });

    setPayrollSlips((prev) =>
      prev.map((slip) => {
        if (otMap[slip.employeeCode]) {
          const added = otMap[slip.employeeCode];
          const newOtHours = slip.overtimeHours + added.hours;
          const newOtPay = slip.overtimePay + added.pay;
          const newGross =
            slip.basicSalary +
            slip.dearnessAllowance +
            slip.houseRentAllowance +
            slip.conveyanceAllowance +
            newOtPay;
          return {
            ...slip,
            overtimeHours: newOtHours,
            overtimePay: newOtPay,
            grossEarnings: newGross,
            netPay: newGross - slip.totalDeductions,
          };
        }
        return slip;
      })
    );
  };

  // Handler: Update Employee Personal Info & Emergency Contacts
  const handleUpdateEmployeeProfile = (updatedEmp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)));
    if (selectedEmployee.id === updatedEmp.id) {
      setSelectedEmployee(updatedEmp);
    }
  };

  // Handler: Update Company Leave Policy
  const handleUpdatePolicy = (updatedPolicy: CompanyLeavePolicy) => {
    setLeavePolicies((prev) =>
      prev.map((p) => (p.id === updatedPolicy.id ? updatedPolicy : p))
    );
  };

  // Handler: Update Employee Leave Balance directly (Allocation by HR)
  const handleUpdateEmployeeLeaveBalance = (
    empId: string,
    balances: Employee['leaveBalance']
  ) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== empId) return emp;
        const updated = { ...emp, leaveBalance: balances };
        if (selectedEmployee.id === empId) {
          setSelectedEmployee(updated);
        }
        return updated;
      })
    );
    setTimeout(() => handleRecalculateAllPayrolls(), 0);
  };

  // Handler: Employee Task status update
  const handleUpdateTaskStatus = (
    taskId: string,
    newStatus: 'todo' | 'in_progress' | 'completed'
  ) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  // Handler: Add new task
  const handleAddTask = (newTaskData: Omit<EmployeeTask, 'id' | 'assignedAt'>) => {
    const newTask: EmployeeTask = {
      ...newTaskData,
      id: `task_${Date.now()}`,
      assignedAt: '2026-09-19',
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Handler: Publish company announcement
  const handlePublishAnnouncement = (
    data: Omit<CompanyAnnouncement, 'id' | 'publishedAt'>
  ) => {
    const newAnnouncement: CompanyAnnouncement = {
      ...data,
      id: `ann_${Date.now()}`,
      publishedAt: '2026-09-19',
    };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
  };

  // Handler: Support chat messaging
  const handleSendChatMessage = (content: string) => {
    const userMsg: SupportChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'employee',
      senderName: selectedEmployee.name,
      message: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setSupportMessages((prev) => [...prev, userMsg]);

    // Simulate friendly HR auto-reply
    setTimeout(() => {
      const hrReply: SupportChatMessage = {
        id: `msg_rep_${Date.now()}`,
        sender: 'hr_agent',
        senderName: 'Sunita Adhikari (HR Hotline)',
        message: `Namaste ${selectedEmployee.name.split(' ')[0]}, we received your message: "${content}". An HR officer will contact your direct phone (${selectedEmployee.phone}) shortly. If this is an urgent emergency, please tap 102/100 above.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSupportMessages((prev) => [...prev, hrReply]);
    }, 1000);
  };

  // Handler: GPS Punch
  const handleGPSPunch = (
    type: 'checkIn' | 'checkOut',
    coords: {
      latitude: number;
      longitude: number;
      accuracy: number;
      address: string;
      isWithinGeofence: boolean;
      distanceMeters: number;
    }
  ) => {
    const today = '2026-09-19';
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const shift = shifts[0];
    const geofenceStatus: 'inside' | 'outside' = coords.isWithinGeofence ? 'inside' : 'outside';

    if (type === 'checkIn') {
      const existing = attendanceRecords.find((r) => r.employeeId === selectedEmployee.id && r.date === today);
      if (existing) {
        setAttendanceRecords((prev) =>
          prev.map((r) =>
            r.id === existing.id
              ? {
                  ...r,
                  checkIn: currentTime,
                  gpsLocation: {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    accuracy: coords.accuracy,
                    address: coords.address,
                    geofenceStatus,
                    distanceMeters: coords.distanceMeters,
                  },
                  notes: `GPS Mobile Punch (${coords.isWithinGeofence ? 'In Geofence' : 'Field Remote'})`,
                }
              : r
          )
        );
      } else {
        const newRec: AttendanceRecord = {
          id: `att_gps_${Date.now()}`,
          employeeId: selectedEmployee.id,
          employeeCode: selectedEmployee.employeeCode,
          employeeName: selectedEmployee.name,
          date: today,
          checkIn: currentTime,
          checkOut: null,
          shiftId: shift.id,
          shiftName: shift.name,
          verifyMode: 'Mobile_GPS',
          terminalId: 'GPS-MOBILE-APP',
          terminalName: 'Nepal Vending Mobile GPS Attendance',
          regularMinutes: 0,
          overtimeMinutes: 0,
          lateMinutes: 0,
          earlyDepartureMinutes: 0,
          status: 'present',
          isOvertimeApproved: false,
          overtimePayNPR: 0,
          gpsLocation: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            address: coords.address,
            geofenceStatus,
            distanceMeters: coords.distanceMeters,
          },
          notes: `GPS Mobile Punch (${coords.isWithinGeofence ? 'In Geofence' : 'Field Remote'})`,
        };
        setAttendanceRecords((prev) => [newRec, ...prev]);
      }
    } else {
      // Check-out with GPS
      setAttendanceRecords((prev) =>
        prev.map((rec) => {
          if (rec.employeeId === selectedEmployee.id && rec.date === today) {
            const calc = calculateShiftAttendanceAndOvertime(
              today,
              rec.checkIn || '09:00',
              currentTime,
              shift,
              selectedEmployee.hourlyRateNPR
            );
            return {
              ...rec,
              checkOut: currentTime,
              regularMinutes: calc.regularMinutes,
              overtimeMinutes: calc.overtimeMinutes,
              lateMinutes: calc.lateMinutes,
              earlyDepartureMinutes: calc.earlyDepartureMinutes,
              status: calc.status,
              isOvertimeApproved: calc.overtimeMinutes > 0,
              overtimePayNPR: calc.overtimePayNPR,
              gpsLocation: {
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy,
                address: coords.address,
                geofenceStatus,
                distanceMeters: coords.distanceMeters,
              },
              notes: `GPS Check-Out (${coords.isWithinGeofence ? 'In Geofence' : 'Field Remote'})`,
            };
          }
          return rec;
        })
      );
    }
  };

  // Handler: View Document (Payslip or Tax Report) in modal for download
  const handleViewDocument = (
    type: 'payslip' | 'tax',
    payroll?: PayrollSlip,
    taxReport?: TaxReport
  ) => {
    setDocumentModal({
      isOpen: true,
      type,
      payroll,
      taxReport,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-800 antialiased selection:bg-rose-500 selection:text-white">
      {/* Primary Header */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        employees={employees}
        onOpenHikvisionModal={() => setIsHikvisionModalOpen(true)}
        onOpenOvertimeModal={() => setIsOvertimeModalOpen(true)}
        onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
        onOpenSelfLoginModal={() => setIsSelfLoginModalOpen(true)}
        onOpenSosDrawer={() => setIsSosDrawerOpen(true)}
        onOpenGPSModal={() => setIsGPSModalOpen(true)}
        hikvisionOnlineCount={devices.filter((d) => d.status === 'online').length}
        pendingLeavesCount={pendingLeavesCount}
        totalOtHoursThisMonth={totalOtMinutesThisMonth / 60}
        isMobileOvertimeEnabled={overtimeSettings.isMobileOvertimeEnabled}
        onToggleMobileOvertime={handleToggleGlobalMobileOvertime}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {viewMode === 'mobile' ? (
          <EmployeePortal
            employee={selectedEmployee}
            allEmployees={employees}
            attendanceHistory={attendanceRecords}
            leaveRequests={leaveRequests}
            payrollSlips={payrollSlips.filter((p) => p.employeeId === selectedEmployee.id)}
            taxReports={taxReports.filter((t) => t.employeeId === selectedEmployee.id)}
            announcements={announcements}
            tasks={tasks}
            leavePolicies={leavePolicies}
            overtimeSettings={overtimeSettings}
            onSubmitLeaveRequest={handleSubmitLeaveRequest}
            onPunchAttendance={handlePunchAttendance}
            onViewDocument={handleViewDocument}
            onOpenOvertimeModal={() => setIsOvertimeModalOpen(true)}
            onOpenGPSModal={() => setIsGPSModalOpen(true)}
            onOpenProfileEditModal={() => setIsProfileEditModalOpen(true)}
            onOpenSelfLoginModal={() => setIsSelfLoginModalOpen(true)}
            onOpenSosDrawer={() => setIsSosDrawerOpen(true)}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onAddTask={handleAddTask}
          />
        ) : (
          <ManagerDashboard
            employees={employees}
            attendanceRecords={attendanceRecords}
            leaveRequests={leaveRequests}
            devices={devices}
            shifts={shifts}
            overtimeSettings={overtimeSettings}
            payrollSlips={payrollSlips}
            leavePolicies={leavePolicies}
            announcements={announcements}
            tasks={tasks}
            onUpdatePolicy={handleUpdatePolicy}
            onUpdateEmployeeLeaveBalance={handleUpdateEmployeeLeaveBalance}
            onUpdateOvertimeSettings={handleUpdateOvertimeSettings}
            onSwitchToMobilePreview={() => setViewMode('mobile')}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
            onApproveOvertime={handleApproveOvertime}
            onOpenHikvisionModal={() => setIsHikvisionModalOpen(true)}
            onOpenOvertimeModal={() => setIsOvertimeModalOpen(true)}
            onViewDocument={handleViewDocument}
            onRecalculatePayroll={handleRecalculateAllPayrolls}
          />
        )}
      </main>

      {/* Hikvision Biometric Terminal & CSV Import Modal */}
      <HikvisionSyncModal
        isOpen={isHikvisionModalOpen}
        onClose={() => setIsHikvisionModalOpen(false)}
        devices={devices}
        employees={employees}
        shifts={shifts}
        onImportAttendance={handleImportAttendance}
      />

      {/* Automated Shift Overtime Engine Modal */}
      <OvertimeAutomatorModal
        isOpen={isOvertimeModalOpen}
        onClose={() => setIsOvertimeModalOpen(false)}
        shifts={shifts}
        employees={employees}
        totalOtHours={totalOtMinutesThisMonth / 60}
        totalOtCostNPR={totalOtCostThisMonth}
        settings={overtimeSettings}
        onToggleMobileOvertime={handleToggleGlobalMobileOvertime}
      />

      {/* Payslip and IRD Tax Assessment Report PDF Modal */}
      <PayslipAndTaxModal
        isOpen={documentModal.isOpen}
        onClose={() => setDocumentModal({ ...documentModal, isOpen: false })}
        type={documentModal.type}
        payroll={documentModal.payroll}
        taxReport={documentModal.taxReport}
        employee={selectedEmployee}
      />

      {/* Dual Bikram Sambat BS & Gregorian AD Calendar Modal */}
      <DualCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
      />

      {/* Employee Basic Info & Emergency Contact Edit Modal */}
      <EmployeeProfileEditModal
        isOpen={isProfileEditModalOpen}
        onClose={() => setIsProfileEditModalOpen(false)}
        employee={selectedEmployee}
        onSave={handleUpdateEmployeeProfile}
      />

      {/* Employee Self-Login & Profile Switcher Modal */}
      <EmployeeSelfLoginModal
        isOpen={isSelfLoginModalOpen}
        onClose={() => setIsSelfLoginModalOpen(false)}
        employees={employees}
        currentEmployee={selectedEmployee}
        onSelectEmployee={(emp) => {
          setSelectedEmployee(emp);
          setViewMode('mobile');
        }}
      />

      {/* Emergency SOS Drawer with One-Tap Hotline & HR Chat */}
      <EmergencySosDrawer
        isOpen={isSosDrawerOpen}
        onClose={() => setIsSosDrawerOpen(false)}
        currentEmployee={selectedEmployee}
        chatMessages={supportMessages}
        onSendMessage={handleSendChatMessage}
      />

      {/* GPS Mobile Attendance & Geofencing Punch Modal */}
      <GPSAttendanceModal
        isOpen={isGPSModalOpen}
        onClose={() => setIsGPSModalOpen(false)}
        currentEmployee={selectedEmployee}
        todayRecord={attendanceRecords.find(
          (r) => r.employeeId === selectedEmployee.id && r.date === '2026-09-19'
        )}
        onGPSPunch={handleGPSPunch}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © 2026 <strong>Nepal Vending Pvt. Ltd.</strong> • Lalitpur & Kathmandu, Nepal
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>Hikvision MinMoe ISAPI v3.2</span>
            <span>•</span>
            <span>Nepal Labor Act 2074 & IRD e-TDS</span>
            <span>•</span>
            <span>SSF Compliant (11% / 20%)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
