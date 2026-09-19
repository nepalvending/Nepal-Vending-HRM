import { ShiftConfig, AttendanceStatus, VerifyMode } from '../types';

export const DEFAULT_SHIFTS: ShiftConfig[] = [
  {
    id: 'shift_std',
    name: 'Day Standard Shift (Kathmandu HQ & Service)',
    startTime: '09:00',
    endTime: '18:00',
    breakDurationMinutes: 60,
    expectedWorkMinutes: 480, // 8 hours net work
    gracePeriodMinutes: 15,
    overtimeThresholdMinutes: 30, // at least 30 mins over shift to qualify for OT
    otHourlyRateMultiplier: 1.5,
    weekendHolidayMultiplier: 2.0,
  },
  {
    id: 'shift_field',
    name: 'Vending Route Replenishment & Refill',
    startTime: '08:00',
    endTime: '17:00',
    breakDurationMinutes: 60,
    expectedWorkMinutes: 480,
    gracePeriodMinutes: 15,
    overtimeThresholdMinutes: 30,
    otHourlyRateMultiplier: 1.5,
    weekendHolidayMultiplier: 2.0,
  },
  {
    id: 'shift_emergency',
    name: 'Technical Maintenance & Night Restock',
    startTime: '16:00',
    endTime: '00:00',
    breakDurationMinutes: 45,
    expectedWorkMinutes: 435,
    gracePeriodMinutes: 15,
    overtimeThresholdMinutes: 30,
    otHourlyRateMultiplier: 1.75, // higher for night vending maintenance
    weekendHolidayMultiplier: 2.2,
  },
];

export interface CalculationResult {
  regularMinutes: number;
  overtimeMinutes: number;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  status: AttendanceStatus;
  overtimePayNPR: number;
  totalDurationMinutes: number;
  isSaturday: boolean;
}

/**
 * Parses "HH:MM" or "HH:MM:SS" string into total minutes since midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map((p) => parseInt(p, 10));
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  return h * 60 + m;
}

/**
 * Formats minutes into "X hrs Y mins" or "X.Xh"
 */
export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return '0h';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Calculates shift compliance, late arrival, early departure,
 * and automated overtime hours & pay in NPR.
 */
export function calculateShiftAttendanceAndOvertime(
  dateStr: string,
  checkInStr: string,
  checkOutStr: string | null,
  shift: ShiftConfig,
  hourlyRateNPR: number
): CalculationResult {
  const checkInMin = timeToMinutes(checkInStr);
  const shiftStartMin = timeToMinutes(shift.startTime);
  const shiftEndMin = timeToMinutes(shift.endTime);

  // Check day of week (Saturday is index 6 in JS Date, which is Nepal's weekly off day)
  const dayOfWeek = new Date(dateStr).getDay();
  const isSaturday = dayOfWeek === 6;

  // If no check-out yet (active shift)
  if (!checkOutStr) {
    let lateMin = 0;
    if (checkInMin > shiftStartMin + shift.gracePeriodMinutes) {
      lateMin = checkInMin - shiftStartMin;
    }
    return {
      regularMinutes: 0,
      overtimeMinutes: 0,
      lateMinutes: lateMin,
      earlyDepartureMinutes: 0,
      status: lateMin > 0 ? 'late' : 'present',
      overtimePayNPR: 0,
      totalDurationMinutes: 0,
      isSaturday,
    };
  }

  let checkOutMin = timeToMinutes(checkOutStr);
  // Handle overnight shifts if checkOut is on next day (smaller than checkIn)
  if (checkOutMin < checkInMin) {
    checkOutMin += 24 * 60;
  }

  const totalRawDuration = checkOutMin - checkInMin;

  // Lateness check
  let lateMinutes = 0;
  if (checkInMin > shiftStartMin + shift.gracePeriodMinutes) {
    lateMinutes = checkInMin - shiftStartMin;
  }

  // Early departure check
  let earlyDepartureMinutes = 0;
  if (checkOutMin < shiftEndMin) {
    earlyDepartureMinutes = shiftEndMin - checkOutMin;
  }

  // Overtime calculation
  let overtimeMinutes = 0;

  if (isSaturday) {
    // Weekend shift in Nepal: all worked hours beyond 1 hour break qualify for weekend overtime rate!
    const netWorked = Math.max(0, totalRawDuration - shift.breakDurationMinutes);
    overtimeMinutes = netWorked;
  } else {
    // Normal weekday:
    // If employee stayed past shift end
    if (checkOutMin > shiftEndMin) {
      const extraMinutes = checkOutMin - shiftEndMin;
      if (extraMinutes >= shift.overtimeThresholdMinutes) {
        overtimeMinutes += extraMinutes;
      }
    }
    // Also if employee checked in very early with authorization (e.g. > 45 mins before morning vending restocking)
    if (checkInMin < shiftStartMin - 45) {
      const earlyExtra = shiftStartMin - checkInMin;
      overtimeMinutes += earlyExtra;
    }
  }

  // Regular minutes is capped by expectedWorkMinutes minus any lateness/early departure
  let regularMinutes = 0;
  if (!isSaturday) {
    const grossShiftDuration = shiftEndMin - shiftStartMin - shift.breakDurationMinutes;
    const lostMinutes = lateMinutes + earlyDepartureMinutes;
    regularMinutes = Math.max(0, grossShiftDuration - lostMinutes);
  }

  // Overtime pay rate multiplier
  const multiplier = isSaturday
    ? shift.weekendHolidayMultiplier
    : shift.otHourlyRateMultiplier;

  // Overtime pay = (overtimeMinutes / 60) * hourlyRate * multiplier
  const overtimeHours = overtimeMinutes / 60;
  const overtimePayNPR = Math.round(overtimeHours * hourlyRateNPR * multiplier);

  // Status determination
  let status: AttendanceStatus = 'present';
  if (lateMinutes > 0) {
    status = 'late';
  } else if (earlyDepartureMinutes > 30) {
    status = 'early_leave';
  }

  return {
    regularMinutes,
    overtimeMinutes,
    lateMinutes,
    earlyDepartureMinutes,
    status,
    overtimePayNPR,
    totalDurationMinutes: totalRawDuration,
    isSaturday,
  };
}
