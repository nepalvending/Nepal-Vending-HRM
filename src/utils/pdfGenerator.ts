import { jsPDF } from 'jspdf';
import { PayrollSlip, TaxReport, Employee } from '../types';
import { adToBs } from './nepaliCalendar';

export function downloadPayslipPDF(payroll: PayrollSlip, employee: Employee) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Background bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NEPAL VENDING PVT. LTD.', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Smart Automated Vending & Beverage Solutions Nepal', 14, 19);
  doc.text('Ward No. 3, Pulchowk, Lalitpur, Nepal | Reg: 182947/074/075 | PAN: 606829143', 14, 25);

  // Payslip Badge
  const bsGen = adToBs(payroll.generatedDate);
  doc.setFillColor(225, 29, 72); // rose-600
  doc.roundedRect(pageWidth - 75, 8, 61, 17, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('CONFIDENTIAL PAYSLIP', pageWidth - 72, 13.5);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${payroll.month} (${bsGen.monthNameEn} ${bsGen.year} BS)`, pageWidth - 72, 18.5);
  doc.text(`Issued: ${payroll.generatedDate} AD / ${bsGen.day} ${bsGen.monthNameEn} BS`, pageWidth - 72, 22.5);

  // Employee Information Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, 38, pageWidth - 28, 38, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('EMPLOYEE CREDENTIALS & SHIFT PROFILE', 18, 45);

  doc.setDrawColor(226, 232, 240);
  doc.line(18, 48, pageWidth - 18, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  // Column 1
  doc.text(`Employee Name:`, 18, 54);
  doc.text(`Employee Code:`, 18, 60);
  doc.text(`Department:`, 18, 66);
  doc.text(`Designation:`, 18, 72);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${employee.name}`, 48, 54);
  doc.text(`${employee.employeeCode}`, 48, 60);
  doc.text(`${employee.department}`, 48, 66);
  doc.text(`${employee.designation}`, 48, 72);

  // Column 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`PAN Number:`, 108, 54);
  doc.text(`SSF Number:`, 108, 60);
  doc.text(`Bank Name:`, 108, 66);
  doc.text(`Account No:`, 108, 72);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${employee.panNumber}`, 134, 54);
  doc.text(`${employee.ssfNumber}`, 134, 60);
  doc.text(`${employee.bankName}`, 134, 66);
  doc.text(`${employee.bankAccount}`, 134, 72);

  // Attendance & Leave Quota Summary Box
  const attY = 78;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(14, attY, pageWidth - 28, 14, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('ATTENDANCE & LEAVE QUOTA SUMMARY (1st & 18th ACCRUAL RULE):', 18, attY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  const presentDays = payroll.presentDays ?? 24;
  const workingDays = payroll.totalWorkingDays ?? 26;
  const paidLeave = payroll.paidLeaveDays ?? 2;
  const quotaAccrued = payroll.accumulatedLeaveQuota ?? 5;
  const excessUnpaid = payroll.unpaidLeaveDays ?? 0;
  const lopDeduction = payroll.lossOfPayDeduction ?? 0;

  doc.text(
    `Working Days: ${workingDays}  |  Present: ${presentDays}  |  Paid Leave Used: ${paidLeave} days  |  Accumulated Quota: ${quotaAccrued} days`,
    18,
    attY + 10
  );
  if (excessUnpaid > 0) {
    doc.setTextColor(190, 24, 93); // rose-700
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Excess Unpaid Leave (LOP): ${excessUnpaid} days (-रू ${lopDeduction.toLocaleString()})`,
      pageWidth - 85,
      attY + 10
    );
  } else {
    doc.setTextColor(22, 101, 52); // green-700
    doc.text(`Unpaid Leave / LOP: 0 days (Full Quota)`, pageWidth - 65, attY + 10);
  }

  // Earnings & Deductions Tables side-by-side
  const tableY = 96;
  const colWidth = (pageWidth - 32) / 2;

  // Earnings Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, tableY, colWidth, 8, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('EARNINGS & ALLOWANCES', 18, tableY + 5.5);
  doc.text('NPR', 14 + colWidth - 12, tableY + 5.5);

  // Deductions Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14 + colWidth + 4, tableY, colWidth, 8, 'F');
  doc.text('DEDUCTIONS (LEGAL & LOP)', 18 + colWidth + 4, tableY + 5.5);
  doc.text('NPR', 14 + colWidth * 2 + 4 - 12, tableY + 5.5);

  const earnings = [
    { label: 'Basic Salary', amount: payroll.basicSalary },
    { label: 'Dearness Allowance (DA)', amount: payroll.dearnessAllowance },
    { label: 'House Rent Allowance (HRA)', amount: payroll.houseRentAllowance },
    { label: 'Conveyance / Field Allowance', amount: payroll.conveyanceAllowance },
    {
      label: `Automated Overtime (${payroll.overtimeHours.toFixed(1)} hrs @ 1.5x)`,
      amount: payroll.overtimePay,
      highlight: true,
    },
  ];

  const deductions = [
    ...(lopDeduction > 0
      ? [
          {
            label: `Loss of Pay / Excess Leave (${excessUnpaid} days)`,
            amount: lopDeduction,
            highlight: true,
          },
        ]
      : []),
    { label: 'Social Security Fund (SSF 11%)', amount: payroll.ssfEmployee },
    { label: 'Income Tax TDS (Nepal IRD)', amount: payroll.incomeTaxTDS },
    { label: 'Provident Fund (CIT / PF)', amount: payroll.providentFund },
  ];

  let currentY = tableY + 14;
  earnings.forEach((item) => {
    doc.setFont('helvetica', item.highlight ? 'bold' : 'normal');
    doc.setFontSize(8);
    if (item.highlight) {
      doc.setTextColor(190, 24, 93); // rose-700 for overtime
    } else {
      doc.setTextColor(51, 65, 85);
    }
    doc.text(item.label, 18, currentY);
    doc.text(item.amount.toLocaleString(), 14 + colWidth - 8, currentY, { align: 'right' });
    currentY += 8;
  });

  let dedY = tableY + 14;
  deductions.forEach((item) => {
    doc.setFont('helvetica', (item as any).highlight ? 'bold' : 'normal');
    doc.setFontSize(8);
    if ((item as any).highlight) {
      doc.setTextColor(190, 24, 93); // rose-700 for LOP
    } else {
      doc.setTextColor(51, 65, 85);
    }
    doc.text(item.label, 18 + colWidth + 4, dedY);
    doc.text(item.amount.toLocaleString(), 14 + colWidth * 2 + 4 - 8, dedY, { align: 'right' });
    dedY += 8;
  });

  // Totals Row
  const totalsY = Math.max(currentY, dedY) + 4;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, totalsY, 14 + colWidth, totalsY);
  doc.line(14 + colWidth + 4, totalsY, pageWidth - 14, totalsY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Gross Earnings:', 18, totalsY + 6);
  doc.text(`रू ${payroll.grossEarnings.toLocaleString()}`, 14 + colWidth - 8, totalsY + 6, { align: 'right' });

  doc.text('Total Deductions:', 18 + colWidth + 4, totalsY + 6);
  doc.text(`रू ${payroll.totalDeductions.toLocaleString()}`, 14 + colWidth * 2 + 4 - 8, totalsY + 6, { align: 'right' });

  // Net Payable Card
  const netCardY = totalsY + 12;
  doc.setFillColor(240, 253, 244); // green-50
  doc.setDrawColor(187, 247, 208); // green-200
  doc.roundedRect(14, netCardY, pageWidth - 28, 24, 2.5, 2.5, 'FD');

  doc.setTextColor(22, 101, 52); // green-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('NET SALARY PAYABLE', 20, netCardY + 9.5);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(74, 222, 128);
  doc.text('(Credited to bank account via NCHL / ConnectIPS)', 20, netCardY + 17);

  doc.setTextColor(21, 128, 61);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(`रू ${payroll.netPay.toLocaleString()}`, pageWidth - 20, netCardY + 14, { align: 'right' });

  // SSF Employer Contribution Notice
  const noticeY = netCardY + 28;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, noticeY, pageWidth - 28, 14, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    `* Employer Social Security Contribution (SSF 20%): NPR ${payroll.ssfEmployer.toLocaleString()} deposited on behalf of employee to SSF Nepal.`,
    18,
    noticeY + 5.5
  );
  doc.text(
    `* Leave Quota Rule: Bi-monthly accrual on 1st (+1 day) & 18th (+1 day) of month (FY M1 = 2 days); excess leaves deducted as Loss of Pay (LOP).`,
    18,
    noticeY + 10.5
  );

  // Signatures
  const signY = noticeY + 24;
  doc.setDrawColor(148, 163, 184);
  doc.line(24, signY, 74, signY);
  doc.line(pageWidth - 74, signY, pageWidth - 24, signY);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Employee Signature', 49, signY + 5, { align: 'center' });
  doc.text('Authorized Signatory / Finance Manager', pageWidth - 49, signY + 5, { align: 'center' });

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer generated pay slip from Nepal Vending HRM System.', pageWidth / 2, 285, {
    align: 'center',
  });

  const safeMonth = payroll.month.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`NepalVending_Payslip_${employee.employeeCode}_${safeMonth}.pdf`);
}

export function downloadTaxReportPDF(taxReport: TaxReport, employee: Employee) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 34, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('NEPAL VENDING PRIVATE LIMITED', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Inland Revenue Department (IRD) Tax Deduction at Source (TDS) Certificate', 14, 20);
  const bsTaxGen = adToBs(taxReport.generatedDate);
  doc.text(`Fiscal Year: ${taxReport.fiscalYear} | Corporate PAN: 606829143 | Issued: ${taxReport.generatedDate} AD (${bsTaxGen.day} ${bsTaxGen.monthNameEn} BS)`, 14, 26);

  // Employee Credential block
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 40, pageWidth - 28, 34, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('TAXPAYER IDENTIFICATION & ASSESSMENT PROFILE', 18, 47);

  doc.line(18, 50, pageWidth - 18, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Taxpayer Name:', 18, 57);
  doc.text('Employee Code:', 18, 64);
  doc.text('Permanent PAN:', 108, 57);
  doc.text('Assessment Status:', 108, 64);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(employee.name, 48, 57);
  doc.text(employee.employeeCode, 48, 64);
  doc.text(taxReport.panNumber, 142, 57);
  doc.text(taxReport.maritalStatus === 'married' ? 'Couple / Married' : 'Individual / Single', 142, 64);

  // Summary Table of Annual Earnings & Exemptions
  const tableY = 80;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, tableY, pageWidth - 28, 8, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PARTICULARS OF REMUNERATION & DEDUCTIONS', 18, tableY + 5.5);
  doc.text('AMOUNT (NPR)', pageWidth - 20, tableY + 5.5, { align: 'right' });

  const rows = [
    { label: 'A. Gross Remuneration & Overtime Earnings', val: taxReport.grossAnnualIncome, bold: true },
    { label: 'B. Less: Social Security Fund (SSF 11% Annual)', val: -taxReport.ssfDeductionAnnual, bold: false },
    { label: 'C. Less: Citizen Investment Trust (CIT) / PF', val: -taxReport.citDeductionAnnual, bold: false },
    { label: 'D. Less: Life Insurance Premium Deduction (Sec 63)', val: -taxReport.insuranceAllowance, bold: false },
    { label: 'E. Total Assessable Net Taxable Income', val: taxReport.netTaxableIncome, bold: true, isHighlight: true },
  ];

  let currentY = tableY + 14;
  rows.forEach((r) => {
    doc.setFont('helvetica', r.bold ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    if (r.isHighlight) {
      doc.setTextColor(2, 132, 199); // sky-600
    } else {
      doc.setTextColor(30, 41, 59);
    }
    doc.text(r.label, 18, currentY);
    const prefix = r.val < 0 ? `- रू ` : `रू `;
    doc.text(`${prefix}${Math.abs(r.val).toLocaleString()}`, pageWidth - 20, currentY, { align: 'right' });
    currentY += 7.5;
  });

  // Slab Breakdown Section
  const slabHeaderY = currentY + 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, slabHeaderY, pageWidth - 28, 8, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SLAB-WISE TAX ASSESSMENT (NEPAL IRD INCOME TAX ACT 2058)', 18, slabHeaderY + 5.5);

  let slabRowY = slabHeaderY + 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TAX BRACKET', 18, slabRowY);
  doc.text('RATE', 105, slabRowY);
  doc.text('TAXABLE (NPR)', 140, slabRowY, { align: 'right' });
  doc.text('TAX (NPR)', pageWidth - 20, slabRowY, { align: 'right' });

  slabRowY += 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, slabRowY, pageWidth - 14, slabRowY);
  slabRowY += 6;

  taxReport.taxSlabs.forEach((slab) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(slab.bracket, 18, slabRowY);
    doc.text(slab.rate, 105, slabRowY);
    doc.text(slab.taxableAmount.toLocaleString(), 140, slabRowY, { align: 'right' });
    doc.text(slab.taxAmount.toLocaleString(), pageWidth - 20, slabRowY, { align: 'right' });
    slabRowY += 6.5;
  });

  // Grand Total Tax
  doc.line(14, slabRowY + 2, pageWidth - 14, slabRowY + 2);
  slabRowY += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Total Annual Tax Liability:', 18, slabRowY);
  doc.text(`रू ${taxReport.totalTaxPayable.toLocaleString()}`, pageWidth - 20, slabRowY, { align: 'right' });

  slabRowY += 6;
  doc.text('TDS Deducted & Deposited with IRD Nepal:', 18, slabRowY);
  doc.setTextColor(22, 101, 52);
  doc.text(`रू ${taxReport.taxPaidToDate.toLocaleString()}`, pageWidth - 20, slabRowY, { align: 'right' });

  slabRowY += 6;
  doc.setTextColor(15, 23, 42);
  doc.text('Balance Tax Due / (Refundable):', 18, slabRowY);
  doc.text(`रू ${taxReport.balanceDueOrRefund.toLocaleString()}`, pageWidth - 20, slabRowY, { align: 'right' });

  // Verification Box
  const signY = slabRowY + 20;
  doc.setDrawColor(148, 163, 184);
  doc.line(24, signY, 74, signY);
  doc.line(pageWidth - 74, signY, pageWidth - 24, signY);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Taxpayer Signature', 49, signY + 5, { align: 'center' });
  doc.text('Chief Tax & Accounts Officer', pageWidth - 49, signY + 5, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Verified under Inland Revenue Department e-TDS provisions. Nepal Vending HR Portal.', pageWidth / 2, 285, {
    align: 'center',
  });

  const safeFY = taxReport.fiscalYear.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`NepalVending_TaxReport_${employee.employeeCode}_FY_${safeFY}.pdf`);
}
