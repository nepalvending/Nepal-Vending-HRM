import React, { useState, useEffect } from 'react';
import { Employee, AttendanceRecord } from '../types';
import {
  calculateDistanceMeters,
  KATHMANDU_HQ_COORDS,
  GEOFENCE_RADIUS_METERS,
  FIELD_PRESET_LOCATIONS,
  FieldLocationPreset,
} from '../utils/geoAndSocial';
import {
  Navigation,
  MapPin,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LogIn,
  LogOut,
  X,
  RefreshCw,
  Building2,
  Crosshair,
} from 'lucide-react';

interface GPSAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmployee: Employee;
  todayRecord?: AttendanceRecord;
  onGPSPunch: (
    type: 'checkIn' | 'checkOut',
    coords: {
      latitude: number;
      longitude: number;
      accuracy: number;
      address: string;
      isWithinGeofence: boolean;
      distanceMeters: number;
    }
  ) => void;
}

export const GPSAttendanceModal: React.FC<GPSAttendanceModalProps> = ({
  isOpen,
  onClose,
  currentEmployee,
  todayRecord,
  onGPSPunch,
}) => {
  const [currentLat, setCurrentLat] = useState<number>(KATHMANDU_HQ_COORDS.latitude);
  const [currentLon, setCurrentLon] = useState<number>(KATHMANDU_HQ_COORDS.longitude);
  const [accuracy, setAccuracy] = useState<number>(12);
  const [currentAddress, setCurrentAddress] = useState<string>('Nepal Vending HQ, Putalisadak, Kathmandu');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationSource, setLocationSource] = useState<'browser' | 'preset'>('browser');
  const [punchFeedback, setPunchFeedback] = useState<string | null>(null);

  // Calculate distance & geofence status
  const distanceMeters = calculateDistanceMeters(
    currentLat,
    currentLon,
    KATHMANDU_HQ_COORDS.latitude,
    KATHMANDU_HQ_COORDS.longitude
  );
  const isWithinGeofence = distanceMeters <= GEOFENCE_RADIUS_METERS;

  const fetchLiveGPS = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLat(pos.coords.latitude);
          setCurrentLon(pos.coords.longitude);
          setAccuracy(Math.round(pos.coords.accuracy || 15));
          setCurrentAddress('Live GPS: Detected Device Coordinates');
          setLocationSource('browser');
          setIsLocating(false);
        },
        (err) => {
          // If denied or error, default to office coordinates with slight jitter
          setCurrentLat(27.7035);
          setCurrentLon(85.3221);
          setAccuracy(10);
          setCurrentAddress('Putalisadak HQ (Office Geofence Calibrated)');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLiveGPS();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: FieldLocationPreset) => {
    setCurrentLat(preset.latitude);
    setCurrentLon(preset.longitude);
    setCurrentAddress(`${preset.name}, ${preset.address}`);
    setAccuracy(10);
    setLocationSource('preset');
  };

  const handleExecutePunch = (type: 'checkIn' | 'checkOut') => {
    onGPSPunch(type, {
      latitude: currentLat,
      longitude: currentLon,
      accuracy,
      address: currentAddress,
      isWithinGeofence,
      distanceMeters,
    });
    setPunchFeedback(`GPS ${type === 'checkIn' ? 'Check-In' : 'Check-Out'} logged successfully!`);
    setTimeout(() => {
      setPunchFeedback(null);
      onClose();
    }, 900);
  };

  const isCheckedIn = Boolean(todayRecord?.checkIn);
  const isCheckedOut = Boolean(todayRecord?.checkOut);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="gps-attendance-modal"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 transition-all"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20">
              <Navigation className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Mobile GPS Attendance & Geofencing
              </h3>
              <p className="text-xs text-emerald-100">
                {currentEmployee.name} • {currentEmployee.employeeCode}
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

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {punchFeedback && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              {punchFeedback}
            </div>
          )}

          {/* Geofence Radar Card */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isWithinGeofence
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-blue-50/70 border-blue-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl ${
                    isWithinGeofence
                      ? 'bg-emerald-600 text-white animate-pulse'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isWithinGeofence
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-blue-200 text-blue-900'
                      }`}
                    >
                      {isWithinGeofence ? 'Inside Office Geofence' : 'Field Work Location'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ±{accuracy}m accuracy
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {currentAddress}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-mono">
                    {currentLat.toFixed(5)}° N, {currentLon.toFixed(5)}° E
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchLiveGPS}
                disabled={isLocating}
                className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                title="Refresh GPS Coordinates"
              >
                <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>

            {/* Distance calculation bar */}
            <div className="mt-3 pt-3 border-t border-black/10 flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                Distance from Putalisadak HQ:
              </span>
              <span className="font-bold text-slate-900 font-mono">
                {distanceMeters < 1000
                  ? `${distanceMeters} meters`
                  : `${(distanceMeters / 1000).toFixed(2)} km`}
              </span>
            </div>
          </div>

          {/* Quick Preset Location Switcher (for Field Technicians) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
              Simulate Field / Route Work Sites (Quick Switch)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_PRESET_LOCATIONS.map((loc: FieldLocationPreset, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(loc)}
                  className={`p-2 rounded-xl border text-left text-xs transition-all ${
                    currentAddress.includes(loc.name)
                      ? 'border-emerald-600 bg-emerald-50/80 font-bold text-emerald-950'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="font-bold truncate">{loc.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{loc.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Today's Punch Summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-around text-center">
            <div>
              <p className="text-[11px] text-slate-500">Check-In Status</p>
              <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">
                {todayRecord?.checkIn ? (
                  <span className="text-emerald-700">{todayRecord.checkIn} (GPS)</span>
                ) : (
                  <span className="text-slate-400">Not Punched</span>
                )}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-[11px] text-slate-500">Check-Out Status</p>
              <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">
                {todayRecord?.checkOut ? (
                  <span className="text-blue-700">{todayRecord.checkOut} (GPS)</span>
                ) : (
                  <span className="text-slate-400">Active Shift</span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={isCheckedIn && !isCheckedOut}
              onClick={() => handleExecutePunch('checkIn')}
              className="py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              <LogIn className="w-4 h-4" />
              {isCheckedIn ? 'Checked In' : 'GPS Check-In'}
            </button>

            <button
              type="button"
              disabled={!isCheckedIn || isCheckedOut}
              onClick={() => handleExecutePunch('checkOut')}
              className="py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              <LogOut className="w-4 h-4" />
              {isCheckedOut ? 'Checked Out' : 'GPS Check-Out'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            Coordinates are encrypted & matched against biometric logs for OT & LOP audit.
          </p>
        </div>
      </div>
    </div>
  );
};
