export type Role = 'employee' | 'manager' | 'admin';

export type AttendanceStatus = 'present' | 'late' | 'early_leave' | 'half_day' | 'absent' | 'on_leave';

export type VerifyMode = 'Face' | 'Fingerprint' | 'Card' | 'Password' | 'Mobile_GPS';

export interface ShiftConfig {
  id: string;
  name: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "17:00" or "18:00"
  breakDurationMinutes: number; // e.g. 60
  expectedWorkMinutes: number; // e.g. 480 (8 hours)
  gracePeriodMinutes: number; // e.g. 15
  overtimeThresholdMinutes: number; // e.g. 30 (minimum extra minutes to count as OT)
  otHourlyRateMultiplier: number; // e.g. 1.5
  weekendHolidayMultiplier: number; // e.g. 2.0
}

export interface Employee {
  id: string;
  employeeCode: string; // e.g. "NV-101"
  cardNo: string;       // Biometric card / ID
  name: string;
  nameNepali?: string;
  email: string;
  phone: string;
  role: Role;
  designation: string;
  department: string;
  avatar: string;
  joinDate: string;
  dateOfBirth?: string; // YYYY-MM-DD
  bloodGroup?: string;  // e.g. "O+", "A+", "B+", "AB+"
  address?: string;     // e.g. "Shantinagar, Kathmandu"
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  bio?: string;
  shiftId: string;
  baseSalaryNPR: number;
  hourlyRateNPR: number;
  panNumber: string;
  ssfNumber: string; // Social Security Fund Nepal
  bankAccount: string;
  bankName: string;
  maritalStatus: 'single' | 'married';
  leaveBalance: {
    annual: number;
    casual: number;
    sick: number;
    festive?: number;
    maternityPaternity?: number;
    mourning?: number;
    unpaid: number;
  };
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM:SS
  checkOut: string | null; // HH:MM:SS
  shiftId: string;
  shiftName: string;
  verifyMode: VerifyMode;
  terminalId: string;
  terminalName: string;
  regularMinutes: number;
  overtimeMinutes: number;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  status: AttendanceStatus;
  isOvertimeApproved: boolean;
  overtimePayNPR: number;
  notes?: string;
  // GPS Geolocation Tracking
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAccuracyMeters?: number;
  gpsAddress?: string;
  isWithinGeofence?: boolean;
  distanceFromOfficeMeters?: number;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    geofenceStatus?: 'inside' | 'outside';
    distanceMeters?: number;
    selfieUrl?: string;
  };
}

export type LeaveType =
  | 'Annual Leave'
  | 'Casual Leave'
  | 'Sick Leave'
  | 'Festive Leave'
  | 'Maternity / Paternity Leave'
  | 'Mourning (Kriya) Leave'
  | 'Compensatory Leave'
  | 'Unpaid Leave';

export interface CompanyLeavePolicy {
  id: string;
  leaveType: LeaveType;
  nepaliName: string;
  daysAllowedPerYear: number;
  accrualRule: 'bi_monthly_1st_18th' | 'annual_upfront' | 'monthly_pro_rata' | 'as_needed';
  isPaid: boolean;
  maxCarryForwardDays: number;
  encashable: boolean;
  applicableGender: 'all' | 'female' | 'male';
  requiresDocumentProofAfterDays?: number;
  description: string;
}

export interface EmployeeTask {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed';
  assignedBy: string;
  assignedAt: string;
  dueDate: string;
  completedAt?: string;
  tags: string[];
}

export interface CompanyAnnouncement {
  id: string;
  title: string;
  content: string;
  category: 'Festive Holiday' | 'Urgent Notice' | 'Policy Update' | 'HR Announcement' | 'Health & Safety';
  priority: 'normal' | 'high' | 'urgent';
  publishedAt: string;
  publishedBy: string;
  isPinned: boolean;
  targetDepartment?: string;
  readByEmployeeIds?: string[];
  actionLinkText?: string;
  actionUrl?: string;
}

export interface SupportChatMessage {
  id: string;
  sender: 'employee' | 'hr_agent' | 'system';
  senderName: string;
  message: string;
  timestamp: string;
  isQuickReply?: boolean;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  emergencyContact: string;
  appliedAt: string;
  status: LeaveStatus;
  managerRemarks?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface LeaveAccrualCycle {
  monthIndexInFY: number; // 1 = Shrawan, 2 = Bhadra, ..., 12 = Ashadh
  monthNameBs: string;
  monthNameEn: string;
  dayOfMonth: 1 | 18;
  accrualAmount: number; // 2 in Month 1, 1 on 1st & 18th in subsequent months
  accrualDateBs: string; // e.g. "2081-04-01"
  accrualDateAd: string;
  isAccrued: boolean;
  cumulativeQuota: number;
  description: string;
}

export interface LeaveAccrualSummary {
  fiscalYear: string;
  currentFYMonth: number; // 1 to 12
  fyMonth1OpeningQuota: number; // 2 days
  subsequentAccrualPerCycle: number; // 1 day on 1st and 1 day on 18th
  totalAccruedToDate: number;
  approvedLeavesTaken: number;
  paidLeavesAllowed: number;
  remainingLeaveBalance: number;
  excessLeaveDays: number; // Unpaid leave (LOP)
  unpaidLeaveSalaryDeduction: number;
  nextAccrualDateBs: string;
  nextAccrualDateAd: string;
  cycles: LeaveAccrualCycle[];
}

export interface PayrollSlip {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  panNumber: string;
  ssfNumber: string;
  month: string; // e.g. "Bhadra 2081 / August 2024"
  payPeriod: string;
  basicSalary: number;
  dearnessAllowance: number;
  houseRentAllowance: number;
  conveyanceAllowance: number;
  overtimeHours: number;
  overtimePay: number;
  grossEarnings: number;
  // Attendance & Leave Metrics
  totalWorkingDays?: number; // standard e.g. 26 days
  presentDays?: number;      // biometric/mobile attendance days
  weeklyOffDays?: number;    // Saturdays / rest days
  paidLeaveDays?: number;    // approved leaves covered by quota
  unpaidLeaveDays?: number;  // excess leaves taken beyond accumulated quota
  absentDays?: number;       // unauthorized absence
  totalUnpaidDays?: number;  // unpaidLeaveDays + absentDays
  accumulatedLeaveQuota?: number; // total accrued to date under 1st & 18th rule
  remainingLeaveBalance?: number; // quota left after paid leave
  lossOfPayDeduction?: number;    // deduction for unpaid/excess days (daily rate * unpaid days)
  dailySalaryRate?: number;       // basicSalary / 26
  // Deductions
  ssfEmployee: number; // 11% in Nepal
  incomeTaxTDS: number;
  providentFund: number;
  totalDeductions: number;
  netPay: number;
  // Employer contributions
  ssfEmployer: number; // 20%
  generatedDate: string;
}

export interface TaxReport {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  fiscalYear: string; // e.g. "2081/82 (2024/25)"
  panNumber: string;
  maritalStatus: 'single' | 'married';
  grossAnnualIncome: number;
  ssfDeductionAnnual: number;
  citDeductionAnnual: number;
  insuranceAllowance: number;
  netTaxableIncome: number;
  taxSlabs: {
    bracket: string;
    rate: string;
    taxableAmount: number;
    taxAmount: number;
  }[];
  totalTaxPayable: number;
  taxPaidToDate: number;
  balanceDueOrRefund: number;
  generatedDate: string;
}

export interface HikvisionDevice {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  model: string;
  location: string;
  status: 'online' | 'offline' | 'syncing';
  lastSyncTime: string;
  totalUsersSynced: number;
  protocol: 'ISAPI (HTTP)' | 'ISAPI (HTTPS)' | 'SDK';
}

export interface RawHikvisionLog {
  terminalId: string;
  terminalName: string;
  cardNo: string;
  employeeNo: string;
  name: string;
  dateTime: string; // YYYY-MM-DD HH:MM:SS
  eventType: 'Check-In' | 'Check-Out';
  verifyMode: VerifyMode;
}

export interface AutomatedOvertimeSettings {
  isMobileOvertimeEnabled: boolean; // Master toggle: ON or OFF for employee mobile app
  autoApprovalThresholdHours: number; // e.g. 2 hours
  requirePreApprovalNotice: boolean; // Show explanation notice in mobile app when turned off
  gracePeriodMinutes: number; // e.g. 15 minutes past shift
  overtimeRateMultiplier: number; // 1.5x under Nepal Labor Act 2074
  employeeOverrides: { [employeeId: string]: boolean }; // individual employee toggle: true=allowed, false=disabled
  updatedAt: string;
  updatedBy: string;
}
