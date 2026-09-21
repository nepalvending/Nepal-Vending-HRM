import { Employee, LeaveRequest } from '../types';
import { adToBs, toNepaliNumerals } from './nepaliCalendar';

/**
 * Nepal Vending HQ Geofence Coordinates (Putalisadak / New Plaza, Kathmandu)
 */
export const KTM_OFFICE_GEOFENCE = {
  name: 'Nepal Vending Corporate HQ',
  latitude: 27.7025,
  longitude: 85.324,
  radiusMeters: 300,
  address: 'New Plaza, Putalisadak, Kathmandu 44600, Nepal',
  city: 'Kathmandu',
};

export const KATHMANDU_HQ_COORDS = {
  latitude: 27.7025,
  longitude: 85.324,
  name: 'Nepal Vending Corporate HQ',
  address: 'New Plaza, Putalisadak, Kathmandu 44600, Nepal',
};

export const GEOFENCE_RADIUS_METERS = 300;

export interface FieldLocationPreset {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
}

export const FIELD_PRESET_LOCATIONS: FieldLocationPreset[] = [
  {
    name: 'Nepal Vending HQ (Putalisadak)',
    latitude: 27.7025,
    longitude: 85.324,
    address: 'New Plaza, Putalisadak, Kathmandu 44600',
    description: 'Corporate Office & Dispatch Hub',
  },
  {
    name: 'Tribhuvan Int. Airport (TIA Terminal)',
    latitude: 27.6966,
    longitude: 85.3591,
    address: 'Departure Lounge, Ring Road, Kathmandu',
    description: 'Airport Vending Machines Kiosk',
  },
  {
    name: 'Civil Mall Vending Cluster (Sundhara)',
    latitude: 27.7008,
    longitude: 85.3117,
    address: 'Sundhara, Kathmandu 44600',
    description: 'Retail & Beverage Maintenance',
  },
  {
    name: 'Labim Mall Depot (Pulchowk, Lalitpur)',
    latitude: 27.6784,
    longitude: 85.3168,
    address: 'Pulchowk Rd, Lalitpur 44700',
    description: 'South Valley Refill Station',
  },
];

/**
 * Standard Haversine formula to compute great-circle distance between two points in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number = KTM_OFFICE_GEOFENCE.latitude,
  lon2: number = KTM_OFFICE_GEOFENCE.longitude
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export interface GeofenceResult {
  isWithinGeofence: boolean;
  distanceMeters: number;
  formattedDistance: string;
  statusText: string;
}

export function evaluateGeofence(
  userLat: number,
  userLon: number,
  fenceRadius: number = KTM_OFFICE_GEOFENCE.radiusMeters
): GeofenceResult {
  const dist = calculateDistanceMeters(userLat, userLon);
  const isWithin = dist <= fenceRadius;

  let formattedDistance = '';
  if (dist < 1000) {
    formattedDistance = `${dist}m`;
  } else {
    formattedDistance = `${(dist / 1000).toFixed(1)}km`;
  }

  const statusText = isWithin
    ? `Inside Geofence (${formattedDistance} from HQ Center)`
    : `Field / Remote (${formattedDistance} from KTM Office)`;

  return {
    isWithinGeofence: isWithin,
    distanceMeters: dist,
    formattedDistance,
    statusText,
  };
}

export interface BirthdayItem {
  employee: Employee;
  isToday: boolean;
  daysUntil: number;
  nextBirthdayDateStr: string;
  turningAge?: number;
  nepaliBirthMonth: string;
}

/**
 * Calculates upcoming birthdays relative to reference date (e.g. 2026-09-19)
 */
export function getUpcomingBirthdays(
  employees: Employee[],
  referenceDateStr: string = '2026-09-19'
): BirthdayItem[] {
  const refDate = new Date(referenceDateStr + 'T00:00:00');
  const currentYear = refDate.getFullYear();

  const results: BirthdayItem[] = [];

  for (const emp of employees) {
    if (!emp.dateOfBirth) continue;
    const parts = emp.dateOfBirth.split('-').map(Number);
    if (parts.length < 3) continue;

    const birthYear = parts[0];
    const birthMonth = parts[1]; // 1-12
    const birthDay = parts[2];

    // Check this year's birthday
    let bdayThisYear = new Date(currentYear, birthMonth - 1, birthDay);
    if (bdayThisYear < refDate) {
      // Birthday already occurred this year, evaluate next year
      bdayThisYear = new Date(currentYear + 1, birthMonth - 1, birthDay);
    }

    const diffTime = bdayThisYear.getTime() - refDate.getTime();
    const daysUntil = Math.round(diffTime / (1000 * 3600 * 24));
    const isToday = daysUntil === 0;

    const turningAge = bdayThisYear.getFullYear() - birthYear;

    let nepaliMonth = '';
    try {
      const bs = adToBs(emp.dateOfBirth);
      nepaliMonth = `${bs.day} ${bs.monthNameNp}`;
    } catch {
      nepaliMonth = `${birthMonth}/${birthDay}`;
    }

    results.push({
      employee: emp,
      isToday,
      daysUntil,
      nextBirthdayDateStr: bdayThisYear.toISOString().split('T')[0],
      turningAge,
      nepaliBirthMonth: nepaliMonth,
    });
  }

  // Sort by days until birthday (today first, then 1, 2, 3...)
  return results.sort((a, b) => a.daysUntil - b.daysUntil);
}

export interface ColleagueOnLeave {
  employee: Employee;
  leaveRequest: LeaveRequest;
  startDateBs: string;
  endDateBs: string;
  returnDate: string;
  isToday: boolean;
}

/**
 * Returns all approved colleagues on leave for a given date
 */
export function getEmployeesOnLeaveToday(
  employees: Employee[],
  leaveRequests: LeaveRequest[],
  targetDateStr: string = '2026-09-19'
): ColleagueOnLeave[] {
  const approvedLeaves = leaveRequests.filter(
    (l) => l.status === 'approved' && targetDateStr >= l.startDate && targetDateStr <= l.endDate
  );

  return approvedLeaves.map((lev) => {
    const emp = employees.find((e) => e.id === lev.employeeId) || {
      id: lev.employeeId,
      employeeCode: lev.employeeCode,
      name: lev.employeeName,
      department: lev.department,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'employee',
    } as Employee;

    let startBs = '';
    let endBs = '';
    try {
      const s = adToBs(lev.startDate);
      const e = adToBs(lev.endDate);
      startBs = `${toNepaliNumerals(s.day)} ${s.monthNameNp}`;
      endBs = `${toNepaliNumerals(e.day)} ${e.monthNameNp}`;
    } catch {
      startBs = lev.startDate;
      endBs = lev.endDate;
    }

    // Return date is the day after endDate
    const endDateObj = new Date(lev.endDate + 'T00:00:00');
    endDateObj.setDate(endDateObj.getDate() + 1);
    const returnDateStr = endDateObj.toISOString().split('T')[0];

    return {
      employee: emp,
      leaveRequest: lev,
      startDateBs: startBs,
      endDateBs: endBs,
      returnDate: returnDateStr,
      isToday: true,
    };
  });
}
