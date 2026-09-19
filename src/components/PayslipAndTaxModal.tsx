import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  Building2,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Percent,
} from 'lucide-react';
import { PayrollSlip, TaxReport, Employee } from '../types';
import { downloadPayslipPDF, downloadTaxReportPDF } from '../utils/pdfGenerator';
import { adToBs } from '../utils/nepaliCalendar';

interface PayslipAndTaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'payslip' | 'tax';
  payroll?: PayrollSlip;
  taxReport?: TaxReport;
  employee: Employee;
}

export const PayslipAndTaxModal: React.FC<PayslipAndTaxModalProps> = ({
  isOpen,
  onClose,
  type,
  payroll,
  taxReport,
  employee,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (type === 'payslip' && payroll) {
      downloadPayslipPDF(payroll, employee);
    } else if (type === 'tax' && taxReport) {
      downloadTaxReportPDF(taxReport, employee);
    }
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {type === 'payslip'
                  ? `Monthly Salary Slip • ${payroll?.month}`
                  : `Nepal IRD Tax Assessment Report • FY ${taxReport?.fiscalYear}`}
              </h2>
              <p className="text-xs text-slate-300">
                Official PDF document for {employee.name} ({employee.employeeCode})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="modal-download-pdf-btn"
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              id="close-document-preview-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="bg-emerald-500 text-white text-xs py-2 px-6 flex items-center justify-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>PDF file downloaded successfully! Saved to your device.</span>
          </div>
        )}

        {/* Document Body (Printable & Viewable) */}
        <div className="p-6 md:p-8 space-y-6 text-slate-800 bg-white">
          {/* Header */}
          <div className="border-b pb-4 border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
                  Nepal Vending Pvt. Ltd.
                </span>
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  {type === 'payslip' ? 'SALARY PAYMENT ADVICE' : 'TAX DEDUCTION CERTIFICATE (e-TDS)'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pulchowk, Lalitpur, Nepal • Corporate PAN: 606829143 • Reg: 182947/074/075
                </p>
              </div>
              <div className="text-right">
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-block px-3 py-1 bg-rose-50 border border-rose-200 rounded-lg text-xs font-mono font-bold text-rose-800">
                    {type === 'payslip'
                      ? `${payroll?.month} (${payroll ? adToBs(payroll.generatedDate).monthNameNp + ' ' + adToBs(payroll.generatedDate).year + ' वि.सं.' : ''})`
                      : `आ.व. ${taxReport?.fiscalYear} BS/AD`}
                  </span>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Issued: {type === 'payslip' ? payroll?.generatedDate : taxReport?.generatedDate} AD (
                    {type === 'payslip' && payroll
                      ? `${adToBs(payroll.generatedDate).day} ${adToBs(payroll.generatedDate).monthNameNp} BS`
                      : taxReport
                      ? `${adToBs(taxReport.generatedDate).day} ${adToBs(taxReport.generatedDate).monthNameNp} BS`
                      : ''}
                    )
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Credentials Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-600 font-bold block uppercase">
                Employee
              </span>
              <span className="font-bold text-slate-900 block">{employee.name}</span>
              <span className="text-[11px] text-slate-500 font-mono">{employee.employeeCode}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 font-bold block uppercase">
                Department
              </span>
              <span className="font-semibold text-slate-800 block">{employee.department}</span>
              <span className="text-[11px] text-slate-500">{employee.designation}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 font-bold block uppercase">
                PAN / SSF No.
              </span>
              <span className="font-mono font-bold text-slate-800 block">{employee.panNumber}</span>
              <span className="text-[11px] text-slate-500 font-mono">{employee.ssfNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 font-bold block uppercase">
                Bank Disbursement
              </span>
              <span className="font-semibold text-slate-800 block line-clamp-1">
                {employee.bankName}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">{employee.bankAccount}</span>
            </div>
          </div>

          {/* Attendance & Leave Quota Rule (1st & 18th) Summary */}
          {type === 'payslip' && payroll && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600 inline-block"></span>
                  <span>Attendance & Leave Accrual Verification (1st & 18th Accrual Rule)</span>
                </span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-amber-200 text-amber-800 font-bold">
                  Period: {payroll.payPeriod}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-slate-700 pt-1">
                <div className="bg-white p-2 rounded-lg border border-amber-100">
                  <span className="text-[10px] text-slate-600 block">Working Days</span>
                  <span className="font-bold text-slate-900 font-mono">{payroll.totalWorkingDays ?? 26} days</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-amber-100">
                  <span className="text-[10px] text-slate-600 block">Present / Biometric</span>
                  <span className="font-bold text-emerald-800 font-mono">{payroll.presentDays ?? 24} days</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-amber-100">
                  <span className="text-[10px] text-slate-600 block">Accumulated Quota</span>
                  <span className="font-bold text-indigo-800 font-mono">{payroll.accumulatedLeaveQuota ?? 5} days</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-amber-100">
                  <span className="text-[10px] text-slate-600 block">Paid Leave Allowed</span>
                  <span className="font-bold text-teal-800 font-mono">{payroll.paidLeaveDays ?? 2} days</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-amber-100 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-600 block">Excess Unpaid (LOP)</span>
                  <span className={`font-bold font-mono ${(payroll.unpaidLeaveDays ?? 0) > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {(payroll.unpaidLeaveDays ?? 0) > 0 ? `${payroll.unpaidLeaveDays} days (-रू ${(payroll.lossOfPayDeduction ?? 0).toLocaleString()})` : '0 days (None)'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payslip Details Table */}
          {type === 'payslip' && payroll && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 flex justify-between">
                    <span>EARNINGS & ALLOWANCES</span>
                    <span>AMOUNT (NPR)</span>
                  </div>
                  <div className="p-3 divide-y divide-slate-100 text-xs space-y-2">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-600">Basic Salary</span>
                      <span className="font-mono font-semibold">
                        रू {payroll.basicSalary.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-600">Dearness Allowance (DA)</span>
                      <span className="font-mono font-semibold">
                        रू {payroll.dearnessAllowance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-600">House Rent Allowance (HRA)</span>
                      <span className="font-mono font-semibold">
                        रू {payroll.houseRentAllowance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-600">Conveyance & Route Fuel</span>
                      <span className="font-mono font-semibold">
                        रू {payroll.conveyanceAllowance.toLocaleString()}
                      </span>
                    </div>
                    {/* Automated Overtime Highlight */}
                    <div className="flex justify-between pt-1 bg-rose-50/80 -mx-3 px-3 py-1 text-rose-900 rounded">
                      <div>
                        <span className="font-bold flex items-center gap-1">
                          <span>Automated Shift Overtime</span>
                          <span className="text-[10px] bg-rose-200 px-1 py-0.2 rounded font-mono">
                            {payroll.overtimeHours.toFixed(1)} hrs
                          </span>
                        </span>
                        <span className="text-[10px] text-rose-700 block">
                          Recorded from Hikvision Terminal @ 1.5x
                        </span>
                      </div>
                      <span className="font-mono font-bold text-rose-700 self-center">
                        रू {payroll.overtimePay.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-3 py-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-900">
                    <span>Gross Earnings</span>
                    <span className="font-mono">रू {payroll.grossEarnings.toLocaleString()}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 flex justify-between">
                    <span>DEDUCTIONS (LEGAL & LOP)</span>
                    <span>AMOUNT (NPR)</span>
                  </div>
                  <div className="p-3 divide-y divide-slate-100 text-xs space-y-2">
                    {/* Loss of Pay (LOP) for Unpaid / Excess Leave */}
                    {(payroll.lossOfPayDeduction ?? 0) > 0 && (
                      <div className="flex justify-between pt-1 bg-rose-50 -mx-3 px-3 py-1.5 text-rose-900 rounded">
                        <div>
                          <span className="font-bold text-rose-900 block">
                            Loss of Pay (Excess Leave)
                          </span>
                          <span className="text-[10px] text-rose-700 block">
                            {payroll.unpaidLeaveDays} days over accumulated leave quota
                          </span>
                        </div>
                        <span className="font-mono font-bold text-rose-700 self-center">
                          रू {(payroll.lossOfPayDeduction ?? 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1">
                      <div>
                        <span className="text-slate-600">Social Security Fund (SSF 11%)</span>
                        <span className="text-[10px] text-slate-600 block">
                          Govt. SSF Contribution
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-slate-700">
                        रू {payroll.ssfEmployee.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <div>
                        <span className="text-slate-600">Income Tax (TDS Nepal IRD)</span>
                        <span className="text-[10px] text-slate-600 block">
                          FY 2081/82 Tax Slab
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-slate-700">
                        रू {payroll.incomeTaxTDS.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-600">Provident Fund (CIT/PF)</span>
                      <span className="font-mono font-semibold text-slate-700">
                        रू {payroll.providentFund.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-3 py-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-900">
                    <span>Total Deductions</span>
                    <span className="font-mono">रू {payroll.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay Callout */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Net Take-Home Salary Payable
                  </span>
                  <span className="text-xs text-emerald-600">
                    Disbursed directly to Nabil Bank Account • {employee.bankAccount}
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-950 font-mono">
                  रू {payroll.netPay.toLocaleString()}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p>
                  <strong>SSF Employer Contribution:</strong> Nepal Vending Pvt. Ltd. has deposited
                  an additional <strong>रू {payroll.ssfEmployer.toLocaleString()} (20%)</strong> into
                  your Social Security Fund account for this payroll cycle.
                </p>
              </div>
            </div>
          )}

          {/* Tax Report Details */}
          {type === 'tax' && taxReport && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-800 flex justify-between">
                  <span>ANNUAL INCOME & TAXABLE CALCULATION (FY {taxReport.fiscalYear})</span>
                  <span>AMOUNT (NPR)</span>
                </div>
                <div className="p-4 divide-y divide-slate-100 text-xs space-y-2">
                  <div className="flex justify-between pt-1">
                    <span className="font-medium text-slate-700">
                      A. Gross Annual Remuneration & Overtime
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      रू {taxReport.grossAnnualIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 text-slate-600">
                    <span>B. Less: Social Security Fund (SSF 11% Annual)</span>
                    <span className="font-mono text-rose-600">
                      - रू {taxReport.ssfDeductionAnnual.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 text-slate-600">
                    <span>C. Less: Citizen Investment Trust (CIT) / PF</span>
                    <span className="font-mono text-rose-600">
                      - रू {taxReport.citDeductionAnnual.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 text-slate-600">
                    <span>D. Less: Life Insurance Premium Deduction (Sec 63)</span>
                    <span className="font-mono text-rose-600">
                      - रू {taxReport.insuranceAllowance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-bold text-indigo-900 bg-indigo-50/50 -mx-4 px-4 py-1.5">
                    <span>E. Net Assessable Taxable Income</span>
                    <span className="font-mono">
                      रू {taxReport.netTaxableIncome.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tax Slabs breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800">
                  SLAB-WISE TAX ASSESSMENT BREAKDOWN (NEPAL IRD)
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2">Tax Bracket</th>
                      <th className="px-4 py-2">Rate</th>
                      <th className="px-4 py-2 text-right">Taxable Amount</th>
                      <th className="px-4 py-2 text-right">Tax Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {taxReport.taxSlabs.map((s, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 font-sans font-medium text-slate-700">
                          {s.bracket}
                        </td>
                        <td className="px-4 py-2 text-slate-600">{s.rate}</td>
                        <td className="px-4 py-2 text-right text-slate-700">
                          रू {s.taxableAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-slate-900">
                          रू {s.taxAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax Balance Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Total Tax Liability
                  </span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    रू {taxReport.totalTaxPayable.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                    TDS Deposited with IRD
                  </span>
                  <span className="text-base font-bold text-emerald-800 font-mono">
                    रू {taxReport.taxPaidToDate.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase block">
                    Balance Due / (Refund)
                  </span>
                  <span className="text-base font-bold text-indigo-900 font-mono">
                    रू {taxReport.balanceDueOrRefund.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer signature line */}
          <div className="pt-6 border-t border-slate-200 flex justify-between text-center text-xs text-slate-500">
            <div className="space-y-1">
              <div className="w-32 border-b border-slate-300 mx-auto mb-1 h-8"></div>
              <span>Employee Signature</span>
            </div>
            <div className="space-y-1">
              <div className="w-40 border-b border-slate-300 mx-auto mb-1 h-8"></div>
              <span>Finance & HR Signatory</span>
              <p className="text-[10px] text-slate-600 font-medium">Nepal Vending Pvt. Ltd.</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Compliant with Nepal Labor Act 2074 & Income Tax Act 2058
          </span>
          <div className="flex gap-2">
            <button
              id="print-document-btn"
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              id="footer-download-pdf-btn"
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
