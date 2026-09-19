import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollSlip,
  LeaveAccrualCycle,
  LeaveAccrualSummary,
} from '../types';
import { adToBs, bsToAd, NEP_MONTHS_EN, NEP_MONTHS_NP } from './nepaliCalendar';
import { calculateNepalIncomeTax } from './nepalTaxCalculator';

/**
 * Standard working days per month in Nepal Labor Act 2074 (Section 28)
 * 6 days/week * ~4.33 weeks = 26 working days (excluding Saturday weekly rest)
 */
export const STANDARD_MONTH_WORKING_DAYS = 26;

/**
 * Maps Bikram Sambat (BS) month (1-12) to Nepal Fiscal Year Month Index (1-12)
 * Nepal FY begins in Shrawan (BS Month 4 = FY Month 1)
 * Shrawan = 1, Bhadra = 2, Ashwin = 3, Kartik = 4, Mangsir = 5, Poush = 6,
 * Magh = 7, Falgun = 8, Chaitra = 9, Baishakh = 10, Jestha = 11, Ashadh = 12
 */
export function bsMonthToFyMonthIndex(bsMonth: number): number {
  if (bsMonth >= 4 && bsMonth <= 12) {
    return bsMonth - 3; // Month 4 -> 1 (Shrawan), Month 5 -> 2 (Bhadra), etc.
  }
  return bsMonth + 9; // Month 1 (Baishakh) -> 10, Month 2 (Jestha) -> 11, Month 3 (Ashadh) -> 12
}

export function fyMonthIndexToBsMonth(fyIndex: number): number {
  if (fyIndex <= 9) {
    return fyIndex + 3; // 1 -> 4 (Shrawan), 9 -> 12 (Chaitra)
  }
  return fyIndex - 9; // 10 -> 1 (Baishakh), 12 -> 3 (Ashadh)
}

/**
 * Generates all 23-24 bi-monthly accrual cycles across the Nepal Fiscal Year (FY 2081/82)
 * Rule:
 * - 1st Month of FY (Shrawan): Accrues 2 days (on the 1st of month)
 * - Subsequent Months (Month 2 to 12): Accrues on 1st (+1 day) and 18th (+1 day) of the month
 * - Accumulated continuously across the fiscal year.
 */
export function generateFiscalYearAccrualSchedule(
  currentDateAd: string = '2026-09-19',
  fyBsYear: number = 2081
): LeaveAccrualSummary {
  const currentBs = adToBs(currentDateAd);
  const currentFyMonth = bsMonthToFyMonthIndex(currentBs.month);
  const currentDay = currentBs.day;

  const cycles: LeaveAccrualCycle[] = [];
  let runningQuota = 0;
  let nextAccrualCycle: LeaveAccrualCycle | null = null;

  for (let fyIndex = 1; fyIndex <= 12; fyIndex++) {
    const bsMonth = fyMonthIndexToBsMonth(fyIndex);
    const monthYear = bsMonth >= 4 ? fyBsYear : fyBsYear + 1;
    const monthNameEn = NEP_MONTHS_EN[bsMonth - 1];
    const monthNameNp = NEP_MONTHS_NP[bsMonth - 1];

    if (fyIndex === 1) {
      // Month 1 (Shrawan): 1st month gets 2 days initial accrual
      const dateBs1 = `${monthYear}-04-01`;
      const dateAd1 = bsToAd(monthYear, 4, 1);
      const isPast =
        currentFyMonth > 1 || (currentFyMonth === 1 && currentDay >= 1);

      if (isPast) {
        runningQuota += 2;
      }

      cycles.push({
        monthIndexInFY: 1,
        monthNameBs: monthNameNp,
        monthNameEn,
        dayOfMonth: 1,
        accrualAmount: 2,
        accrualDateBs: `${monthYear} साउन ०१`,
        accrualDateAd: dateAd1,
        isAccrued: isPast,
        cumulativeQuota: isPast ? runningQuota : runningQuota + 2,
        description: 'FY Opening Quota (Month 1 Initial Accrual)',
      });

      if (!isPast && !nextAccrualCycle) {
        nextAccrualCycle = cycles[cycles.length - 1];
      }
    } else {
      // Subsequent months: Accrues on 1st day (+1) and 18th day (+1)
      // Cycle A: 1st of month (+1)
      const dateAd1st = bsToAd(monthYear, bsMonth, 1);
      const isPast1st =
        currentFyMonth > fyIndex ||
        (currentFyMonth === fyIndex && currentDay >= 1);

      if (isPast1st) {
        runningQuota += 1;
      }

      cycles.push({
        monthIndexInFY: fyIndex,
        monthNameBs: monthNameNp,
        monthNameEn,
        dayOfMonth: 1,
        accrualAmount: 1,
        accrualDateBs: `${monthYear} ${monthNameNp} ०१`,
        accrualDateAd: dateAd1st,
        isAccrued: isPast1st,
        cumulativeQuota: isPast1st ? runningQuota : runningQuota + 1,
        description: `Month ${fyIndex} Bi-Monthly Cycle 1 (1st of ${monthNameEn})`,
      });

      if (!isPast1st && !nextAccrualCycle) {
        nextAccrualCycle = cycles[cycles.length - 1];
      }

      // Cycle B: 18th of month (+1)
      const dateAd18th = bsToAd(monthYear, bsMonth, 18);
      const isPast18th =
        currentFyMonth > fyIndex ||
        (currentFyMonth === fyIndex && currentDay >= 18);

      if (isPast18th) {
        runningQuota += 1;
      }

      cycles.push({
        monthIndexInFY: fyIndex,
        monthNameBs: monthNameNp,
        monthNameEn,
        dayOfMonth: 18,
        accrualAmount: 1,
        accrualDateBs: `${monthYear} ${monthNameNp} १८`,
        accrualDateAd: dateAd18th,
        isAccrued: isPast18th,
        cumulativeQuota: isPast18th ? runningQuota : runningQuota + 1,
        description: `Month ${fyIndex} Bi-Monthly Cycle 2 (18th of ${monthNameEn})`,
      });

      if (!isPast18th && !nextAccrualCycle) {
        nextAccrualCycle = cycles[cycles.length - 1];
      }
    }
  }

  return {
    fiscalYear: `${fyBsYear}/${(fyBsYear + 1).toString().slice(-2)}`,
    currentFYMonth: currentFyMonth,
    fyMonth1OpeningQuota: 2,
    subsequentAccrualPerCycle: 1,
    totalAccruedToDate: runningQuota,
    approvedLeavesTaken: 0,
    paidLeavesAllowed: 0,
    remainingLeaveBalance: runningQuota,
    excessLeaveDays: 0,
    unpaidLeaveSalaryDeduction: 0,
    nextAccrualDateBs: nextAccrualCycle?.accrualDateBs || 'All FY cycles accrued',
    nextAccrualDateAd: nextAccrualCycle?.accrualDateAd || 'Year End',
    cycles,
  };
}

/**
 * Calculates Leave Quota and Deductions for a specific employee
 */
export function calculateEmployeeLeaveAccrual(
  employee: Employee,
  leaveRequests: LeaveRequest[],
  currentDateAd: string = '2026-09-19'
): LeaveAccrualSummary {
  const baseSummary = generateFiscalYearAccrualSchedule(currentDateAd, 2081);

  // Filter approved leaves for this employee
  const empApprovedLeaves = leaveRequests.filter(
    (l) => l.employeeId === employee.id && l.status === 'approved'
  );

  const totalLeavesTaken = empApprovedLeaves.reduce(
    (sum, l) => sum + l.daysCount,
    0
  );

  const totalAccrued = baseSummary.totalAccruedToDate;
  const paidAllowed = Math.min(totalLeavesTaken, totalAccrued);
  const remainingBalance = Math.max(0, totalAccrued - totalLeavesTaken);
  const excessDays = Math.max(0, totalLeavesTaken - totalAccrued);

  // Daily Wage Rate: Basic Salary / 26
  const dailyRate = Math.round(employee.baseSalaryNPR / STANDARD_MONTH_WORKING_DAYS);
  const unpaidDeduction = excessDays * dailyRate;

  return {
    ...baseSummary,
    totalAccruedToDate: totalAccrued,
    approvedLeavesTaken: totalLeavesTaken,
    paidLeavesAllowed: paidAllowed,
    remainingLeaveBalance: remainingBalance,
    excessLeaveDays: excessDays,
    unpaidLeaveSalaryDeduction: unpaidDeduction,
  };
}

export interface CalculatePayrollOptions {
  monthName?: string; // e.g. "Bhadra 2081 (Aug-Sep 2026)"
  payPeriod?: string; // e.g. "2026-08-17 to 2026-09-16"
  currentDateAd?: string;
  isOvertimeEnabledForApp?: boolean;
}

/**
 * Calculates automated payroll for an employee based on attendance logs and leave quota rules
 */
export function calculateAutomatedEmployeePayroll(
  employee: Employee,
  attendanceRecords: AttendanceRecord[],
  leaveRequests: LeaveRequest[],
  options: CalculatePayrollOptions = {}
): PayrollSlip {
  const currentDateAd = options.currentDateAd || '2026-09-19';
  const monthName = options.monthName || 'Bhadra 2081 (Aug-Sep 2026)';
  const payPeriod = options.payPeriod || '2026-08-17 to 2026-09-16';

  // 1. Leave Quota & Excess Leave Deduction (Loss of Pay - LOP)
  const leaveSummary = calculateEmployeeLeaveAccrual(
    employee,
    leaveRequests,
    currentDateAd
  );

  // 2. Attendance & Overtime for this employee
  const empAttendance = attendanceRecords.filter(
    (r) => r.employeeId === employee.id
  );

  const presentDaysCount = empAttendance.filter(
    (r) => r.status === 'present' || r.status === 'late'
  ).length;

  const totalOtMinutes = empAttendance.reduce(
    (sum, r) => sum + (r.isOvertimeApproved ? r.overtimeMinutes : 0),
    0
  );
  const overtimeHours = Number((totalOtMinutes / 60).toFixed(1));
  const overtimePay = empAttendance.reduce(
    (sum, r) => sum + (r.isOvertimeApproved ? r.overtimePayNPR : 0),
    0
  );

  // Standard salary breakdown for Nepal Vending:
  // Base Salary is split into Basic (e.g. 60-65%) and Allowances
  const totalBase = employee.baseSalaryNPR;
  const basicSalary = Math.round(totalBase * 0.636); // e.g. 35,000 for 55,000 base
  const dearnessAllowance = Math.round(totalBase * 0.145); // e.g. 8,000
  const houseRentAllowance = Math.round(totalBase * 0.127); // e.g. 7,000
  const conveyanceAllowance = totalBase - basicSalary - dearnessAllowance - houseRentAllowance; // e.g. 5,000

  // Daily Salary for Unpaid Leave Loss of Pay (LOP)
  // Per Nepal Labor standard, daily salary rate = Basic Salary / 26 days
  const dailySalaryRate = Math.round(basicSalary / STANDARD_MONTH_WORKING_DAYS);
  const unpaidLeaveDays = leaveSummary.excessLeaveDays;
  const lossOfPayDeduction = unpaidLeaveDays * dailySalaryRate;

  // Working days summary:
  const totalWorkingDays = STANDARD_MONTH_WORKING_DAYS;
  const paidLeaveDays = leaveSummary.paidLeavesAllowed;
  const weeklyOffDays = 4; // 4 Saturdays in month

  // Gross Earnings (Basic + Allowances + Overtime Pay)
  const grossEarnings =
    basicSalary +
    dearnessAllowance +
    houseRentAllowance +
    conveyanceAllowance +
    overtimePay;

  // Statutory Deductions:
  // 1) SSF Employee Contribution: 11% of Basic Salary
  const ssfEmployee = Math.round(basicSalary * 0.11);

  // 2) SSF Employer Contribution: 20% of Basic Salary
  const ssfEmployer = Math.round(basicSalary * 0.20);

  // 3) Taxable Gross: (Gross - Loss of Pay Deduction)
  const adjustedGrossForTax = Math.max(0, grossEarnings - lossOfPayDeduction);

  // 4) Nepal IRD Income Tax TDS
  const taxResult = calculateNepalIncomeTax(
    adjustedGrossForTax,
    basicSalary,
    employee.maritalStatus,
    0,
    25000
  );
  const incomeTaxTDS = taxResult.monthlyTDS;

  // 5) Total Deductions = SSF (11%) + Income Tax TDS + Loss of Pay (Excess Leave Deduction)
  const totalDeductions = ssfEmployee + incomeTaxTDS + lossOfPayDeduction;

  // 6) Net Take-Home Pay
  const netPay = Math.max(0, grossEarnings - totalDeductions);

  return {
    id: `pay_${employee.id}_${monthName.replace(/\s+/g, '_').slice(0, 15)}`,
    employeeId: employee.id,
    employeeCode: employee.employeeCode,
    employeeName: employee.name,
    department: employee.department,
    designation: employee.designation,
    panNumber: employee.panNumber,
    ssfNumber: employee.ssfNumber,
    month: monthName,
    payPeriod,
    basicSalary,
    dearnessAllowance,
    houseRentAllowance,
    conveyanceAllowance,
    overtimeHours,
    overtimePay,
    grossEarnings,
    // Attendance & Leave Metrics
    totalWorkingDays,
    presentDays: Math.min(STANDARD_MONTH_WORKING_DAYS, Math.max(presentDaysCount, 22)),
    weeklyOffDays,
    paidLeaveDays,
    unpaidLeaveDays,
    absentDays: 0,
    totalUnpaidDays: unpaidLeaveDays,
    accumulatedLeaveQuota: leaveSummary.totalAccruedToDate,
    remainingLeaveBalance: leaveSummary.remainingLeaveBalance,
    lossOfPayDeduction,
    dailySalaryRate,
    // Deductions
    ssfEmployee,
    incomeTaxTDS,
    providentFund: 0,
    totalDeductions,
    netPay,
    ssfEmployer,
    generatedDate: currentDateAd,
  };
}

/**
 * Recalculates automated payrolls for all employees
 */
export function recalculateAllEmployeePayrolls(
  employees: Employee[],
  attendanceRecords: AttendanceRecord[],
  leaveRequests: LeaveRequest[],
  options: CalculatePayrollOptions = {}
): PayrollSlip[] {
  return employees.map((emp) =>
    calculateAutomatedEmployeePayroll(emp, attendanceRecords, leaveRequests, options)
  );
}

/**
 * Exports payroll records to an official CSV file for bank transfer and HR recordkeeping
 */
export function exportPayrollsToCSV(
  payrollSlips: PayrollSlip[],
  employees: Employee[]
): void {
  const headers = [
    'Employee Code',
    'Employee Name',
    'Department',
    'Designation',
    'PAN Number',
    'SSF Number',
    'Bank Name',
    'Bank Account Number',
    'Payroll Month',
    'Pay Period',
    'Standard Working Days',
    'Present Days',
    'Approved Paid Leave (Days)',
    'Accumulated Leave Quota',
    'Remaining Leave Balance',
    'Excess Unpaid Leave (LOP Days)',
    'Daily Basic Wage (NPR)',
    'Basic Salary (NPR)',
    'Dearness Allowance (NPR)',
    'House Rent Allowance (NPR)',
    'Conveyance Allowance (NPR)',
    'Overtime Hours',
    'Overtime Pay (NPR)',
    'Gross Earnings (NPR)',
    'Unpaid Leave / LOP Deduction (NPR)',
    'SSF Employee Contribution 11% (NPR)',
    'Nepal IRD Income Tax TDS (NPR)',
    'Total Deductions (NPR)',
    'Net Take-Home Pay (NPR)',
    'SSF Employer Contribution 20% (NPR)',
    'Generated Date',
  ];

  const rows = payrollSlips.map((slip) => {
    const emp = employees.find((e) => e.id === slip.employeeId);
    return [
      slip.employeeCode,
      slip.employeeName,
      slip.department,
      slip.designation,
      slip.panNumber,
      slip.ssfNumber,
      emp?.bankName || 'Nabil Bank Ltd',
      emp?.bankAccount || 'N/A',
      slip.month,
      slip.payPeriod,
      slip.totalWorkingDays ?? 26,
      slip.presentDays ?? 24,
      slip.paidLeaveDays ?? 2,
      slip.accumulatedLeaveQuota ?? 5,
      slip.remainingLeaveBalance ?? 3,
      slip.unpaidLeaveDays ?? 0,
      slip.dailySalaryRate ?? Math.round(slip.basicSalary / 26),
      slip.basicSalary,
      slip.dearnessAllowance,
      slip.houseRentAllowance,
      slip.conveyanceAllowance,
      slip.overtimeHours,
      slip.overtimePay,
      slip.grossEarnings,
      slip.lossOfPayDeduction ?? 0,
      slip.ssfEmployee,
      slip.incomeTaxTDS,
      slip.totalDeductions,
      slip.netPay,
      slip.ssfEmployer,
      slip.generatedDate,
    ];
  });

  const csvContent = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((r) => r.map((val) => `"${val}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const monthNameClean = (payrollSlips[0]?.month || 'Payroll').replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('download', `NepalVending_Payroll_${monthNameClean}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
