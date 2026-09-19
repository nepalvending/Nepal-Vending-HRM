export interface NepalTaxBracketResult {
  bracket: string;
  rate: string;
  taxableAmount: number;
  taxAmount: number;
}

export interface TaxCalculationResult {
  grossAnnual: number;
  ssfDeductionAnnual: number;
  citDeductionAnnual: number;
  lifeInsuranceDeduction: number;
  netTaxableIncome: number;
  slabs: NepalTaxBracketResult[];
  totalAnnualTax: number;
  monthlyTDS: number;
}

/**
 * Calculates Nepal Income Tax & SSF according to Inland Revenue Department (IRD) Nepal FY 2081/82
 */
export function calculateNepalIncomeTax(
  monthlyGross: number,
  monthlyBasic: number,
  maritalStatus: 'single' | 'married',
  annualCit: number = 0,
  annualInsurance: number = 25000
): TaxCalculationResult {
  const grossAnnual = monthlyGross * 12;
  const ssfDeductionAnnual = monthlyBasic * 0.11 * 12; // 11% SSF contribution deductible
  const citDeductionAnnual = annualCit;
  const lifeInsuranceDeduction = Math.min(annualInsurance, 40000); // capped at 40k NPR in Nepal

  // Total eligible deductions capped under Section 63 (SSF + CIT up to 1/3 of income or 300k, whichever lower)
  const maxRetirementDeduction = Math.min(grossAnnual / 3, 300000);
  const actualRetirementDeduction = Math.min(ssfDeductionAnnual + citDeductionAnnual, maxRetirementDeduction);

  const netTaxableIncome = Math.max(
    0,
    grossAnnual - actualRetirementDeduction - lifeInsuranceDeduction
  );

  const slabs: NepalTaxBracketResult[] = [];
  let remaining = netTaxableIncome;
  let totalAnnualTax = 0;

  if (maritalStatus === 'single') {
    // 1st Slab: 500,000 @ 1% (Social security tax; note: for SSF contributors, this is usually 0% or 1%)
    const b1 = Math.min(remaining, 500000);
    const tax1 = Math.round(b1 * 0.01);
    slabs.push({
      bracket: 'First NPR 500,000 (SST)',
      rate: '1%',
      taxableAmount: b1,
      taxAmount: tax1,
    });
    totalAnnualTax += tax1;
    remaining -= b1;

    // 2nd Slab: 200,000 @ 10%
    if (remaining > 0) {
      const b2 = Math.min(remaining, 200000);
      const tax2 = Math.round(b2 * 0.10);
      slabs.push({
        bracket: 'Next NPR 200,000 (5L to 7L)',
        rate: '10%',
        taxableAmount: b2,
        taxAmount: tax2,
      });
      totalAnnualTax += tax2;
      remaining -= b2;
    }

    // 3rd Slab: 300,000 @ 20%
    if (remaining > 0) {
      const b3 = Math.min(remaining, 300000);
      const tax3 = Math.round(b3 * 0.20);
      slabs.push({
        bracket: 'Next NPR 300,000 (7L to 10L)',
        rate: '20%',
        taxableAmount: b3,
        taxAmount: tax3,
      });
      totalAnnualTax += tax3;
      remaining -= b3;
    }

    // 4th Slab: 1,000,000 @ 30%
    if (remaining > 0) {
      const b4 = Math.min(remaining, 1000000);
      const tax4 = Math.round(b4 * 0.30);
      slabs.push({
        bracket: 'Next NPR 1,000,000 (10L to 20L)',
        rate: '30%',
        taxableAmount: b4,
        taxAmount: tax4,
      });
      totalAnnualTax += tax4;
      remaining -= b4;
    }

    // 5th Slab: Above 2,000,000 @ 36%
    if (remaining > 0) {
      const b5 = remaining;
      const tax5 = Math.round(b5 * 0.36);
      slabs.push({
        bracket: 'Above NPR 2,000,000 (30% + 20% surcharge)',
        rate: '36%',
        taxableAmount: b5,
        taxAmount: tax5,
      });
      totalAnnualTax += tax5;
      remaining -= b5;
    }
  } else {
    // Married Couple Slabs
    // 1st Slab: 600,000 @ 1%
    const b1 = Math.min(remaining, 600000);
    const tax1 = Math.round(b1 * 0.01);
    slabs.push({
      bracket: 'First NPR 600,000 (SST)',
      rate: '1%',
      taxableAmount: b1,
      taxAmount: tax1,
    });
    totalAnnualTax += tax1;
    remaining -= b1;

    // 2nd Slab: 200,000 @ 10%
    if (remaining > 0) {
      const b2 = Math.min(remaining, 200000);
      const tax2 = Math.round(b2 * 0.10);
      slabs.push({
        bracket: 'Next NPR 200,000 (6L to 8L)',
        rate: '10%',
        taxableAmount: b2,
        taxAmount: tax2,
      });
      totalAnnualTax += tax2;
      remaining -= b2;
    }

    // 3rd Slab: 300,000 @ 20%
    if (remaining > 0) {
      const b3 = Math.min(remaining, 300000);
      const tax3 = Math.round(b3 * 0.20);
      slabs.push({
        bracket: 'Next NPR 300,000 (8L to 11L)',
        rate: '20%',
        taxableAmount: b3,
        taxAmount: tax3,
      });
      totalAnnualTax += tax3;
      remaining -= b3;
    }

    // 4th Slab: 900,000 @ 30%
    if (remaining > 0) {
      const b4 = Math.min(remaining, 900000);
      const tax4 = Math.round(b4 * 0.30);
      slabs.push({
        bracket: 'Next NPR 900,000 (11L to 20L)',
        rate: '30%',
        taxableAmount: b4,
        taxAmount: tax4,
      });
      totalAnnualTax += tax4;
      remaining -= b4;
    }

    // 5th Slab: Above 2,000,000 @ 36%
    if (remaining > 0) {
      const b5 = remaining;
      const tax5 = Math.round(b5 * 0.36);
      slabs.push({
        bracket: 'Above NPR 2,000,000 (30% + 20% surcharge)',
        rate: '36%',
        taxableAmount: b5,
        taxAmount: tax5,
      });
      totalAnnualTax += tax5;
      remaining -= b5;
    }
  }

  const monthlyTDS = Math.round(totalAnnualTax / 12);

  return {
    grossAnnual,
    ssfDeductionAnnual,
    citDeductionAnnual,
    lifeInsuranceDeduction,
    netTaxableIncome,
    slabs,
    totalAnnualTax,
    monthlyTDS,
  };
}
