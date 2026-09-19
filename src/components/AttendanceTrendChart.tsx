import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
} from 'recharts';
import { TrendingUp, Users, Calendar, AlertCircle, CheckCircle2, BarChart2, Award } from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';
import { adToBs } from '../utils/nepaliCalendar';

interface AttendanceTrendChartProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
}

export interface DayAttendanceTrend {
  date: string; // YYYY-MM-DD
  dayLabelAD: string; // e.g. "19 Sep"
  dayLabelBS: string; // e.g. "३ असोज"
  bsMonth: string;
  dayOfWeek: string;
  isSaturday: boolean;
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  onLeaveCount: number;
  lateCount: number;
  attendanceRatio: number; // percentage 0-100
}

export const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({
  employees,
  attendanceRecords,
}) => {
  const [timeRange, setTimeRange] = useState<'7' | '14' | '30'>('30');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  // Generate 30 days of data ending on today '2026-09-19'
  const trendData = useMemo(() => {
    const totalStaff = Math.max(employees.length, 10);
    const data: DayAttendanceTrend[] = [];
    const baseDate = new Date(Date.UTC(2026, 8, 19)); // Sep 19, 2026

    // Map existing attendance records by date
    const recordsByDate: { [dateStr: string]: AttendanceRecord[] } = {};
    attendanceRecords.forEach((r) => {
      if (!recordsByDate[r.date]) recordsByDate[r.date] = [];
      recordsByDate[r.date].push(r);
    });

    for (let i = 29; i >= 0; i--) {
      const d = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeekIdx = d.getUTCDay(); // 0 = Sun, 6 = Sat
      const isSaturday = dayOfWeekIdx === 6;
      const dayOfWeekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayOfWeek = dayOfWeekNames[dayOfWeekIdx];

      const bsDetail = adToBs(dateStr);
      const dayLabelAD = `${d.getUTCDate()} ${d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })}`;
      const dayLabelBS = `${bsDetail.day} ${bsDetail.monthNameNp}`;

      const existingLogs = recordsByDate[dateStr] || [];

      let presentCount = 0;
      let lateCount = 0;
      let onLeaveCount = 0;

      if (existingLogs.length > 0) {
        const uniqueEmps = new Set(existingLogs.map((r) => r.employeeId));
        presentCount = uniqueEmps.size;
        lateCount = existingLogs.filter((r) => r.status === 'late').length;
      } else {
        // Deterministic realistic synthetic data for prior 30 days for Nepal Vending
        // Saturdays: 2-3 emergency field technicians on voluntary roster/OT
        // Weekdays: 8 to 10 staff present (90-100% attendance rate)
        if (isSaturday) {
          // Saturday is weekend in Nepal
          presentCount = 2 + (i % 3); // 2 to 4 on vending standby
        } else {
          // Pseudo random based on date
          const seed = (d.getUTCDate() * 7 + i) % 10;
          if (seed === 0) {
            presentCount = totalStaff - 2; // 2 absent / on leave
            onLeaveCount = 2;
          } else if (seed <= 3) {
            presentCount = totalStaff - 1; // 1 absent / on leave
            onLeaveCount = 1;
          } else {
            presentCount = totalStaff; // 100% present
          }
          lateCount = seed % 3 === 0 ? 1 : 0;
        }
      }

      // Ensure present does not exceed total staff
      presentCount = Math.min(presentCount, totalStaff);
      const absentCount = Math.max(0, totalStaff - presentCount);
      const attendanceRatio = Math.round((presentCount / totalStaff) * 100);

      data.push({
        date: dateStr,
        dayLabelAD,
        dayLabelBS,
        bsMonth: bsDetail.monthNameNp,
        dayOfWeek,
        isSaturday,
        totalEmployees: totalStaff,
        presentCount,
        absentCount,
        onLeaveCount,
        lateCount,
        attendanceRatio,
      });
    }

    return data;
  }, [employees.length, attendanceRecords]);

  // Filter based on selected time range
  const filteredData = useMemo(() => {
    const count = parseInt(timeRange, 10);
    return trendData.slice(-count);
  }, [trendData, timeRange]);

  // High-level analytics
  // Excluding Saturdays from weekday average calculation gives accurate operational health
  const weekdayRecords = filteredData.filter((d) => !d.isSaturday);
  const avgWeekdayRatio = weekdayRecords.length
    ? Math.round(
        weekdayRecords.reduce((acc, curr) => acc + curr.attendanceRatio, 0) / weekdayRecords.length
      )
    : 0;

  const totalPresentLogs = filteredData.reduce((acc, curr) => acc + curr.presentCount, 0);
  const totalAbsentLogs = filteredData.reduce((acc, curr) => acc + curr.absentCount, 0);
  const overallRatio = Math.round(
    (totalPresentLogs / (totalPresentLogs + totalAbsentLogs || 1)) * 100
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
      {/* Header with Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>30-Day Attendance Trends & Ratio Analysis</span>
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                  Recharts Analytics
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Daily present vs. absent employees ratio across Nepal Vending operational roster
              </p>
            </div>
          </div>
        </div>

        {/* Range & Style Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              id="trend-range-7d-btn"
              type="button"
              onClick={() => setTimeRange('7')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === '7' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              id="trend-range-14d-btn"
              type="button"
              onClick={() => setTimeRange('14')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === '14' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
            <button
              id="trend-range-30d-btn"
              type="button"
              onClick={() => setTimeRange('30')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === '30' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              id="chart-type-bar-btn"
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                chartType === 'bar' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Ratio Stack
            </button>
            <button
              id="chart-type-area-btn"
              type="button"
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                chartType === 'area' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Area Rate
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Weekday Attendance Rate
          </span>
          <div className="text-xl font-black text-emerald-900 font-mono mt-0.5">
            {avgWeekdayRatio}%
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Standard 09:00 - 18:00 shifts</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
            Total Staff Roster
          </span>
          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
            {employees.length} Members
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Active biometric cards</span>
        </div>

        <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
            Total Man-Days Present
          </span>
          <div className="text-xl font-black text-rose-900 font-mono mt-0.5">
            {totalPresentLogs} / {totalPresentLogs + totalAbsentLogs}
          </div>
          <span className="text-[11px] text-rose-700 font-medium">In selected {timeRange} days</span>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Saturday Standby Duty
          </span>
          <div className="text-xl font-black text-amber-900 font-mono mt-0.5">
            {filteredData.filter((d) => d.isSaturday).reduce((acc, c) => acc + c.presentCount, 0)} Shifts
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Overtime @ 2.0x weekend rate</span>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <ComposedChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="dayLabelAD"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                interval={timeRange === '30' ? 2 : 0}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                domain={[0, employees.length]}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 10, fill: '#0ea5e9' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
                iconSize={8}
              />
              <Bar
                yAxisId="left"
                dataKey="presentCount"
                name="Present Staff"
                stackId="attendance"
                fill="#10b981"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                yAxisId="left"
                dataKey="absentCount"
                name="Absent / On-Leave"
                stackId="attendance"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="attendanceRatio"
                name="Attendance Ratio (%)"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#2563eb' }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          ) : (
            <ComposedChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="dayLabelAD"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                interval={timeRange === '30' ? 2 : 0}
              />
              <YAxis
                yAxisId="ratio"
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
                iconSize={8}
              />
              <Area
                yAxisId="ratio"
                type="monotone"
                dataKey="attendanceRatio"
                name="Attendance Ratio (%)"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="#d1fae5"
                fillOpacity={0.6}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend & Nepal Calendar Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Present Employees</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span>Absent / Approved Leave</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-blue-600 inline-block"></span>
            <span>Ratio (%)</span>
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Note: Saturdays (शनिबार) are official weekly rests; lower attendance reflects voluntary vending technician standby.
        </div>
      </div>
    </div>
  );
};

// Custom Tooltip component for dual calendar (AD & BS) and clean detail presentation
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: DayAttendanceTrend = payload[0].payload;
    const ratioColor =
      data.attendanceRatio >= 90
        ? 'text-emerald-700'
        : data.attendanceRatio >= 70
        ? 'text-amber-700'
        : 'text-rose-700';

    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-52">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-bold text-white">
            {data.dayLabelAD} 2026 ({data.dayOfWeek})
          </span>
          <span className="text-amber-400 font-bold text-[10px] bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800/80">
            {data.dayLabelBS} BS
          </span>
        </div>

        {data.isSaturday && (
          <div className="text-[10px] font-bold text-amber-300 bg-amber-500/10 p-1 rounded">
            शनिबार (Saturday Weekly Rest)
          </div>
        )}

        <div className="space-y-1 pt-1 font-mono text-[11px]">
          <div className="flex justify-between items-center text-emerald-400">
            <span>Present:</span>
            <span className="font-bold">
              {data.presentCount} / {data.totalEmployees} staff
            </span>
          </div>

          <div className="flex justify-between items-center text-rose-400">
            <span>Absent / Leave:</span>
            <span className="font-bold">{data.absentCount} staff</span>
          </div>

          {data.lateCount > 0 && (
            <div className="flex justify-between items-center text-amber-400">
              <span>Late check-ins:</span>
              <span className="font-bold">{data.lateCount}</span>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-slate-800 pt-1 text-white font-bold font-sans">
            <span>Attendance Ratio:</span>
            <span className={ratioColor}>{data.attendanceRatio}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
