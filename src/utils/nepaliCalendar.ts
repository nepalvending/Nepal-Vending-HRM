/**
 * Accurate Nepali Calendar (Bikram Sambat - BS) & Gregorian (AD) Dual Conversion Engine
 * Covers years 2075 BS - 2086 BS (2018 AD - 2030 AD)
 */

export const NEP_MONTHS_EN = [
  'Baishakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

export const NEP_MONTHS_NP = [
  'बैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कात्तिक',
  'मंसिर',
  'पुस',
  'माघ',
  'फागुन',
  'चैत',
];

export const NEP_DAYS_EN = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const NEP_DAYS_NP = [
  'आइतबार',
  'सोमबार',
  'मंगलबार',
  'बुधबार',
  'बिहीबार',
  'शुक्रबार',
  'शनिबार',
];

export const NEP_DAYS_SHORT_NP = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];

// Days in each month for BS years 2075 to 2085
// Format: [year, [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12]]
const BS_MONTH_DAYS: { [year: number]: number[] } = {
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2082: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2083: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
};

// Reference point: 2075-01-01 BS was 2018-04-14 AD (Saturday)
const REF_BS_YEAR = 2075;
const REF_BS_MONTH = 1;
const REF_BS_DAY = 1;
const REF_AD_DATE = new Date(Date.UTC(2018, 3, 14)); // month index 3 is April

/**
 * Converts English number string/number to Nepali Devanagari numerals
 * e.g., 2083 -> २०८३
 */
export function toNepaliNumerals(num: number | string): string {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return num
    .toString()
    .split('')
    .map((char) => {
      const digit = parseInt(char, 10);
      return isNaN(digit) ? char : nepaliDigits[digit];
    })
    .join('');
}

export interface NepaliDateDetail {
  year: number;
  month: number; // 1 - 12
  day: number;   // 1 - 32
  monthNameEn: string;
  monthNameNp: string;
  dayNameEn: string;
  dayNameNp: string;
  formattedBS: string; // e.g. "२०८३-०६-०३"
  formattedBSFullNp: string; // e.g. "३ असोज २०८३, शनिबार"
  formattedBSFullEn: string; // e.g. "3 Ashwin 2083, Saturday"
  adDateStr: string;   // "YYYY-MM-DD"
  dualFormatted: string; // e.g. "३ असोज २०८३ BS (19 Sep 2026 AD)"
}

/**
 * Converts AD Date ("YYYY-MM-DD" or Date object) to Bikram Sambat (BS)
 */
export function adToBs(dateInput: string | Date): NepaliDateDetail {
  let targetAd: Date;
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-').map((p) => parseInt(p, 10));
    targetAd = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  } else {
    targetAd = new Date(Date.UTC(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()));
  }

  // Calculate day difference from reference AD date
  const diffTime = targetAd.getTime() - REF_AD_DATE.getTime();
  let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let currentYear = REF_BS_YEAR;
  let currentMonth = REF_BS_MONTH;
  let currentDay = REF_BS_DAY;

  if (diffDays >= 0) {
    while (diffDays > 0) {
      const daysInCurrentMonth =
        BS_MONTH_DAYS[currentYear]?.[currentMonth - 1] || 30;
      const daysLeftInMonth = daysInCurrentMonth - currentDay + 1;

      if (diffDays >= daysLeftInMonth) {
        diffDays -= daysLeftInMonth;
        currentDay = 1;
        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
      } else {
        currentDay += diffDays;
        diffDays = 0;
      }
    }
  } else {
    // If date is before reference
    while (diffDays < 0) {
      currentMonth--;
      if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
      }
      const daysInCurrentMonth =
        BS_MONTH_DAYS[currentYear]?.[currentMonth - 1] || 30;
      diffDays += daysInCurrentMonth;
    }
    currentDay = diffDays + 1;
  }

  const dayOfWeek = targetAd.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const monthNameEn = NEP_MONTHS_EN[currentMonth - 1];
  const monthNameNp = NEP_MONTHS_NP[currentMonth - 1];
  const dayNameEn = NEP_DAYS_EN[dayOfWeek];
  const dayNameNp = NEP_DAYS_NP[dayOfWeek];

  const yStr = currentYear.toString();
  const mStr = currentMonth.toString().padStart(2, '0');
  const dStr = currentDay.toString().padStart(2, '0');

  const adYear = targetAd.getUTCFullYear();
  const adMonthStr = targetAd.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const adDay = targetAd.getUTCDate();
  const adDateStr = `${adYear}-${(targetAd.getUTCMonth() + 1).toString().padStart(2, '0')}-${adDay.toString().padStart(2, '0')}`;

  const formattedBS = `${toNepaliNumerals(yStr)}-${toNepaliNumerals(mStr)}-${toNepaliNumerals(dStr)}`;
  const formattedBSFullNp = `${toNepaliNumerals(currentDay)} ${monthNameNp} ${toNepaliNumerals(currentYear)}, ${dayNameNp}`;
  const formattedBSFullEn = `${currentDay} ${monthNameEn} ${currentYear}, ${dayNameEn}`;
  const dualFormatted = `${toNepaliNumerals(currentDay)} ${monthNameNp} ${toNepaliNumerals(currentYear)} BS (${adDay} ${adMonthStr} ${adYear} AD)`;

  return {
    year: currentYear,
    month: currentMonth,
    day: currentDay,
    monthNameEn,
    monthNameNp,
    dayNameEn,
    dayNameNp,
    formattedBS,
    formattedBSFullNp,
    formattedBSFullEn,
    adDateStr,
    dualFormatted,
  };
}

/**
 * Returns dual format for any YYYY-MM-DD string
 * e.g., "2026-09-19" -> "३ असोज २०८३ BS (19 Sep 2026 AD)"
 */
export function formatDualDate(dateStr: string): string {
  try {
    const detail = adToBs(dateStr);
    return detail.dualFormatted;
  } catch (err) {
    return dateStr;
  }
}

/**
 * Returns short dual format
 * e.g. "३ असोज BS • 19 Sep AD"
 */
export function formatShortDualDate(dateStr: string): string {
  try {
    const detail = adToBs(dateStr);
    const adParts = dateStr.split('-');
    const adDay = parseInt(adParts[2] || '1', 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const adMonth = months[parseInt(adParts[1] || '1', 10) - 1];
    return `${toNepaliNumerals(detail.day)} ${detail.monthNameNp} BS (${adDay} ${adMonth} AD)`;
  } catch {
    return dateStr;
  }
}

/**
 * Converts Bikram Sambat (BS) date to Gregorian (AD) Date string "YYYY-MM-DD"
 */
export function bsToAd(bsYear: number, bsMonth: number, bsDay: number): string {
  try {
    let totalDays = 0;
    // Sum days for elapsed years from REF_BS_YEAR
    for (let y = REF_BS_YEAR; y < bsYear; y++) {
      const yearDays = BS_MONTH_DAYS[y] || [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30];
      const sum = yearDays.reduce((a, b) => a + b, 0);
      totalDays += sum;
    }

    // Sum days for elapsed months in the target year
    const currentYearDays = BS_MONTH_DAYS[bsYear] || [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30];
    for (let m = 1; m < bsMonth; m++) {
      totalDays += currentYearDays[m - 1] || 30;
    }

    // Add days in current month
    totalDays += bsDay - 1;

    // Add to reference AD date (2018-04-14)
    const adTime = REF_AD_DATE.getTime() + totalDays * 86400000;
    const adDate = new Date(adTime);
    return adDate.toISOString().split('T')[0];
  } catch {
    // Fallback approximation: BS is ~56.7 years ahead of AD
    const approxAdYear = bsYear - 57;
    const mStr = String(bsMonth).padStart(2, '0');
    const dStr = String(bsDay).padStart(2, '0');
    return `${approxAdYear}-${mStr}-${dStr}`;
  }
}

