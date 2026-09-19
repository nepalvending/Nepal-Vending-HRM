import { AttendanceRecord, ShiftConfig, Employee, VerifyMode } from '../types';
import { calculateShiftAttendanceAndOvertime, DEFAULT_SHIFTS } from './overtimeCalculator';

export interface ParsedHikvisionRow {
  terminalId: string;
  terminalName: string;
  employeeCode: string;
  employeeName: string;
  cardNo: string;
  dateTime: string; // YYYY-MM-DD HH:MM:SS
  date: string;     // YYYY-MM-DD
  time: string;     // HH:MM:SS
  eventType: 'Check-In' | 'Check-Out';
  verifyMode: VerifyMode;
}

export function generateSampleHikvisionCSV(): string {
  const headers = [
    'TerminalID',
    'TerminalName',
    'EmployeeCode',
    'Name',
    'CardNo',
    'Date',
    'Time',
    'EventType',
    'VerifyMode',
  ];

  const rows = [
    // Aarav Shrestha (Field Tech) - Normal day + Overtime
    ['HIK-KTM-01', 'Kathmandu HQ MinMoe Face', 'NV-101', 'Aarav Shrestha', 'C98124', '2026-09-18', '08:52:10', 'Check-In', 'Face'],
    ['HIK-KTM-01', 'Kathmandu HQ MinMoe Face', 'NV-101', 'Aarav Shrestha', 'C98124', '2026-09-18', '20:15:30', 'Check-Out', 'Face'], // 2h 15m Overtime!

    // Sunita Adhikari (HR Manager) - On Time
    ['HIK-KTM-01', 'Kathmandu HQ MinMoe Face', 'NV-102', 'Sunita Adhikari', 'C98125', '2026-09-18', '08:58:05', 'Check-In', 'Fingerprint'],
    ['HIK-KTM-01', 'Kathmandu HQ MinMoe Face', 'NV-102', 'Sunita Adhikari', 'C98125', '2026-09-18', '18:05:40', 'Check-Out', 'Fingerprint'],

    // Bibek Tamang (Vending Refill Operative) - Route shift early start & late restocking
    ['HIK-WH-02', 'Patan Warehouse Refill Terminal', 'NV-103', 'Bibek Tamang', 'C98126', '2026-09-18', '07:55:00', 'Check-In', 'Card'],
    ['HIK-WH-02', 'Patan Warehouse Refill Terminal', 'NV-103', 'Bibek Tamang', 'C98126', '2026-09-18', '19:30:15', 'Check-Out', 'Card'], // 2.5h OT

    // Roshani Gurung (Client Relations & Operations) - Slight Late check-in
    ['HIK-KTM-01', 'Kathmandu HQ MinMoe Face', 'NV-104', 'Roshani Gurung', 'C98127', '2026-09-18', '09:28:45', 'Check-In', 'Face'],
    ['HIK-KTM-01', 'Kathmandu HQ MinMoe Face', 'NV-104', 'Roshani Gurung', 'C98127', '2026-09-18', '18:10:00', 'Check-Out', 'Face'],

    // Dipesh Shrestha (Senior Field Maintenance Engineer) - Night refill shift
    ['HIK-WH-02', 'Patan Warehouse Refill Terminal', 'NV-105', 'Dipesh Shrestha', 'C98128', '2026-09-18', '08:48:12', 'Check-In', 'Fingerprint'],
    ['HIK-WH-02', 'Patan Warehouse Refill Terminal', 'NV-105', 'Dipesh Shrestha', 'C98128', '2026-09-18', '21:00:20', 'Check-Out', 'Fingerprint'], // 3h OT

    // Aarav Shrestha - 2026-09-19 (Today's check in)
    ['HIK-KTM-01', 'Kathmandu HQ MinMoe Face', 'NV-101', 'Aarav Shrestha', 'C98124', '2026-09-19', '08:50:22', 'Check-In', 'Face'],
    // Sunita Adhikari - 2026-09-19
    ['HIK-KTM-01', 'Kathmandu HQ MinMoe Face', 'NV-102', 'Sunita Adhikari', 'C98125', '2026-09-19', '09:02:11', 'Check-In', 'Fingerprint'],
    // Bibek Tamang - 2026-09-19
    ['HIK-WH-02', 'Patan Warehouse Refill Terminal', 'NV-103', 'Bibek Tamang', 'C98126', '2026-09-19', '07:58:30', 'Check-In', 'Card'],
  ];

  const csvContent = [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
  return csvContent;
}

export function downloadSampleHikvisionCSV() {
  const content = generateSampleHikvisionCSV();
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Hikvision_NepalVending_Sample_Attendance.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseHikvisionCSV(
  csvText: string,
  employees: Employee[],
  shifts: ShiftConfig[]
): {
  success: boolean;
  message: string;
  rawRowsCount: number;
  records: AttendanceRecord[];
} {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      success: false,
      message: 'CSV file is empty or does not contain header and data rows.',
      rawRowsCount: 0,
      records: [],
    };
  }

  // Parse header
  const headerLine = lines[0];
  const headerCols = headerLine.split(',').map((h) => h.replace(/["'\r\n]/g, '').trim().toLowerCase());

  // Find column indexes
  const colEmpCode = headerCols.findIndex((c) =>
    c.includes('employee') || c.includes('personnel') || c.includes('empcode') || c.includes('empid') || c.includes('id')
  );
  const colDate = headerCols.findIndex((c) => c.includes('date') && !c.includes('time'));
  const colTime = headerCols.findIndex((c) => c.includes('time') && !c.includes('date'));
  const colDateTime = headerCols.findIndex((c) => c.includes('datetime') || (c.includes('date') && c.includes('time')));
  const colEvent = headerCols.findIndex((c) => c.includes('event') || c.includes('type') || c.includes('status'));
  const colMode = headerCols.findIndex((c) => c.includes('mode') || c.includes('verify'));
  const colTerminal = headerCols.findIndex((c) => c.includes('terminal') || c.includes('device'));

  const parsedEvents: ParsedHikvisionRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Split on commas while respecting quotes
    const cols = rawLine
      .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
      ?.map((c) => c.replace(/^"|"$/g, '').trim()) || rawLine.split(',').map((c) => c.trim());

    if (cols.length < 3) continue;

    const empCode = (colEmpCode >= 0 ? cols[colEmpCode] : cols[2] || cols[0])?.toUpperCase();
    let date = '';
    let time = '';

    if (colDateTime >= 0 && cols[colDateTime]) {
      const dtParts = cols[colDateTime].split(' ');
      date = dtParts[0];
      time = dtParts[1] || '00:00:00';
    } else {
      date = (colDate >= 0 ? cols[colDate] : cols[5] || cols[1]);
      time = (colTime >= 0 ? cols[colTime] : cols[6] || cols[2]);
    }

    // Standardize event type
    let rawEvent = (colEvent >= 0 ? cols[colEvent] : 'Check-In').toLowerCase();
    let eventType: 'Check-In' | 'Check-Out' = 'Check-In';
    if (rawEvent.includes('out') || rawEvent.includes('exit') || rawEvent.includes('depart')) {
      eventType = 'Check-Out';
    }

    // Verify mode
    let rawMode = (colMode >= 0 ? cols[colMode] : 'Face').toLowerCase();
    let verifyMode: VerifyMode = 'Face';
    if (rawMode.includes('finger') || rawMode.includes('fp') || rawMode.includes('thumb')) {
      verifyMode = 'Fingerprint';
    } else if (rawMode.includes('card') || rawMode.includes('rfid')) {
      verifyMode = 'Card';
    } else if (rawMode.includes('pwd') || rawMode.includes('pass')) {
      verifyMode = 'Password';
    }

    const terminalName = colTerminal >= 0 ? cols[colTerminal] : 'Hikvision MinMoe Terminal';

    // Find employee
    const matchedEmp = employees.find(
      (e) => e.employeeCode.toUpperCase() === empCode || e.cardNo.toUpperCase() === empCode
    );

    parsedEvents.push({
      terminalId: 'HIK-IMPORT',
      terminalName,
      employeeCode: matchedEmp ? matchedEmp.employeeCode : empCode,
      employeeName: matchedEmp ? matchedEmp.name : `Employee ${empCode}`,
      cardNo: matchedEmp ? matchedEmp.cardNo : empCode,
      dateTime: `${date} ${time}`,
      date,
      time,
      eventType,
      verifyMode,
    });
  }

  // Group events by Employee and Date to form Attendance Records with In and Out
  const grouped: { [key: string]: { checkIn?: ParsedHikvisionRow; checkOut?: ParsedHikvisionRow } } = {};

  parsedEvents.forEach((ev) => {
    const key = `${ev.employeeCode}_${ev.date}`;
    if (!grouped[key]) grouped[key] = {};

    if (ev.eventType === 'Check-In') {
      if (!grouped[key].checkIn || ev.time < grouped[key].checkIn!.time) {
        grouped[key].checkIn = ev;
      }
    } else {
      if (!grouped[key].checkOut || ev.time > grouped[key].checkOut!.time) {
        grouped[key].checkOut = ev;
      }
    }
  });

  const records: AttendanceRecord[] = [];

  Object.keys(grouped).forEach((key) => {
    const item = grouped[key];
    const firstEv = item.checkIn || item.checkOut;
    if (!firstEv) return;

    const emp = employees.find((e) => e.employeeCode === firstEv.employeeCode) || employees[0];
    const shift = shifts.find((s) => s.id === emp.shiftId) || DEFAULT_SHIFTS[0];

    const checkInTime = item.checkIn ? item.checkIn.time : '09:00:00';
    const checkOutTime = item.checkOut ? item.checkOut.time : null;

    const calc = calculateShiftAttendanceAndOvertime(
      firstEv.date,
      checkInTime,
      checkOutTime,
      shift,
      emp.hourlyRateNPR
    );

    records.push({
      id: `att_imp_${firstEv.employeeCode}_${firstEv.date}`,
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      employeeName: emp.name,
      date: firstEv.date,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      shiftId: shift.id,
      shiftName: shift.name,
      verifyMode: firstEv.verifyMode,
      terminalId: firstEv.terminalId,
      terminalName: firstEv.terminalName,
      regularMinutes: calc.regularMinutes,
      overtimeMinutes: calc.overtimeMinutes,
      lateMinutes: calc.lateMinutes,
      earlyDepartureMinutes: calc.earlyDepartureMinutes,
      status: calc.status,
      isOvertimeApproved: calc.overtimeMinutes > 0, // Auto-flagged for approval
      overtimePayNPR: calc.overtimePayNPR,
      notes: calc.overtimeMinutes > 0 ? `Auto-calculated overtime: ${(calc.overtimeMinutes / 60).toFixed(1)} hrs` : undefined,
    });
  });

  return {
    success: true,
    message: `Successfully processed ${parsedEvents.length} Hikvision raw log events into ${records.length} daily attendance records with automated overtime calculation!`,
    rawRowsCount: parsedEvents.length,
    records,
  };
}
