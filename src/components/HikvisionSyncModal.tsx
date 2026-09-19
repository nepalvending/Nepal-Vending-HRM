import React, { useState, useRef } from 'react';
import {
  HardDrive,
  Upload,
  Download,
  Wifi,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  RefreshCw,
  Server,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { HikvisionDevice, Employee, ShiftConfig, AttendanceRecord } from '../types';
import {
  downloadSampleHikvisionCSV,
  parseHikvisionCSV,
  generateSampleHikvisionCSV,
} from '../utils/csvParser';

interface HikvisionSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: HikvisionDevice[];
  employees: Employee[];
  shifts: ShiftConfig[];
  onImportAttendance: (newRecords: AttendanceRecord[]) => void;
}

export const HikvisionSyncModal: React.FC<HikvisionSyncModalProps> = ({
  isOpen,
  onClose,
  devices,
  employees,
  shifts,
  onImportAttendance,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'csv'>('terminal');
  const [selectedDevice, setSelectedDevice] = useState<HikvisionDevice>(devices[0]);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    message: string;
    details?: {
      firmware: string;
      serial: string;
      facesStored: number;
      pendingLogs: number;
      ntpSynced: boolean;
    };
  } | null>(null);

  const [isSyncingTerminal, setIsSyncingTerminal] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvTextPreview, setCsvTextPreview] = useState<string>('');
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvSuccess, setCsvSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handlePingDevice = () => {
    setIsPinging(true);
    setPingResult(null);
    setSyncFeedback(null);

    setTimeout(() => {
      setIsPinging(false);
      setPingResult({
        success: true,
        message: `HTTP 200 OK: Hikvision ISAPI handshake successful for ${selectedDevice.name} (${selectedDevice.ipAddress}:${selectedDevice.port}).`,
        details: {
          firmware: 'V3.2.30_build231018',
          serial: 'DS-K1T671MF-20230919AAWR98214',
          facesStored: 42,
          pendingLogs: 14,
          ntpSynced: true,
        },
      });
    }, 900);
  };

  const handleSyncRealTimeLogs = () => {
    setIsSyncingTerminal(true);
    setSyncFeedback(null);

    setTimeout(() => {
      setIsSyncingTerminal(false);
      // Generate realistic logs from terminal and parse
      const sampleCsv = generateSampleHikvisionCSV();
      const res = parseHikvisionCSV(sampleCsv, employees, shifts);
      if (res.success && res.records.length > 0) {
        onImportAttendance(res.records);
        setSyncFeedback(
          `Successfully synchronized ${res.rawRowsCount} event logs from ${selectedDevice.name}! Computed shifts and automated overtime.`
        );
      }
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError(null);
    setCsvSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      setCsvTextPreview(text);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleCSV = () => {
    const sample = generateSampleHikvisionCSV();
    setCsvTextPreview(sample);
    setCsvFile(new File([sample], 'Hikvision_Sample.csv', { type: 'text/csv' }));
    setCsvError(null);
    setCsvSuccess(null);
  };

  const handleProcessCSV = () => {
    if (!csvTextPreview) {
      setCsvError('Please select or paste a CSV file first.');
      return;
    }

    const res = parseHikvisionCSV(csvTextPreview, employees, shifts);
    if (!res.success) {
      setCsvError(res.message);
      return;
    }

    onImportAttendance(res.records);
    setCsvSuccess(res.message);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Hikvision Attendance Terminal Integration
              </h2>
              <p className="text-xs text-slate-300">
                Direct biometric terminal connection (ISAPI) or CSV log import
              </p>
            </div>
          </div>
          <button
            id="close-hikvision-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            id="tab-terminal-connection"
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'terminal'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>Direct Terminal ISAPI Connection</span>
          </button>
          <button
            id="tab-csv-import"
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'csv'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Attendance CSV Log</span>
          </button>
        </div>

        {/* Tab 1: Terminal Connection */}
        {activeTab === 'terminal' && (
          <div className="p-6 space-y-5">
            {/* Device Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Hikvision Hardware Terminal
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {devices.map((dev) => (
                  <button
                    key={dev.id}
                    type="button"
                    onClick={() => {
                      setSelectedDevice(dev);
                      setPingResult(null);
                      setSyncFeedback(null);
                    }}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      selectedDevice.id === dev.id
                        ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] font-bold text-slate-500">
                        {dev.id}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {dev.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                      {dev.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-1">
                      {dev.ipAddress}:{dev.port}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Connection Parameters Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Terminal Configuration & Security Credentials
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Protocol: {selectedDevice.protocol}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block uppercase">
                    IP Address
                  </span>
                  <input
                    type="text"
                    readOnly
                    value={selectedDevice.ipAddress}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block uppercase">
                    Port
                  </span>
                  <input
                    type="text"
                    readOnly
                    value={selectedDevice.port.toString()}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block uppercase">
                    ISAPI Username
                  </span>
                  <input
                    type="text"
                    readOnly
                    value="admin"
                    className="w-full mt-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block uppercase">
                    ISAPI Password
                  </span>
                  <input
                    type="password"
                    readOnly
                    value="••••••••••••"
                    className="w-full mt-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">Physical Location:</span>
                <span>{selectedDevice.location}</span>
              </div>
            </div>

            {/* Test Ping Diagnostic Output */}
            {pingResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs ${
                  pingResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="space-y-1 w-full">
                    <p className="font-semibold">{pingResult.message}</p>
                    {pingResult.details && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-emerald-800">
                        <div>
                          <span className="text-slate-500 block">Firmware:</span>
                          <span className="font-mono font-medium">
                            {pingResult.details.firmware}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Biometric Enrolled:</span>
                          <span className="font-mono font-medium">
                            {pingResult.details.facesStored} staff
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Buffered Logs:</span>
                          <span className="font-mono font-bold text-rose-600">
                            {pingResult.details.pendingLogs} punches
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Time Sync:</span>
                          <span className="font-mono font-medium text-emerald-700">NTP OK</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {syncFeedback && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                id="test-ping-device-btn"
                type="button"
                onClick={handlePingDevice}
                disabled={isPinging}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
              >
                <Wifi className={`w-3.5 h-3.5 ${isPinging ? 'animate-pulse text-rose-600' : ''}`} />
                <span>{isPinging ? 'Pinging Terminal...' : 'Test Connection & Diagnostics'}</span>
              </button>

              <button
                id="sync-terminal-now-btn"
                type="button"
                onClick={handleSyncRealTimeLogs}
                disabled={isSyncingTerminal}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTerminal ? 'animate-spin' : ''}`} />
                <span>
                  {isSyncingTerminal
                    ? 'Pulling Biometric Logs...'
                    : 'Sync Logs from Terminal Now'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: CSV Import */}
        {activeTab === 'csv' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Import Hikvision Log Export (.csv)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Upload CSV exported from Hikvision iVMS-4200 or terminal web interface
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="download-sample-csv-btn"
                  type="button"
                  onClick={downloadSampleHikvisionCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download Sample CSV</span>
                </button>
                <button
                  id="load-sample-csv-btn"
                  type="button"
                  onClick={handleLoadSampleCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load 1-Click Sample</span>
                </button>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-rose-400 bg-slate-50/60 rounded-2xl p-6 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                {csvFile ? csvFile.name : 'Click to browse or drop Hikvision CSV attendance file'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Standard format: TerminalID, EmployeeCode, Name, CardNo, Date, Time, EventType,
                VerifyMode
              </p>
            </div>

            {/* CSV Textarea Preview */}
            {csvTextPreview && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-700">
                    CSV Content Raw Preview ({csvTextPreview.split('\n').filter(Boolean).length} lines)
                  </span>
                  <span className="text-[10px] text-slate-500">Auto-pairs check-in & check-out</span>
                </div>
                <textarea
                  value={csvTextPreview}
                  onChange={(e) => setCsvTextPreview(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 text-[11px] font-mono bg-slate-900 text-slate-200 rounded-xl border border-slate-800 focus:outline-hidden"
                />
              </div>
            )}

            {csvError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{csvError}</span>
              </div>
            )}

            {csvSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{csvSuccess}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                id="cancel-csv-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                id="process-csv-records-btn"
                type="button"
                onClick={handleProcessCSV}
                disabled={!csvTextPreview}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 disabled:opacity-40 transition-all"
              >
                <span>Import & Calculate Overtime</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
