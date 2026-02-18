import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // ...existing keys...
      // Dashboard metrics (EN)
      'dashboard_lbl_total_workforce': 'Total Workforce',
      'dashboard_fml_total_workforce': 'Sum of all personnel',
      'dashboard_lbl_va': 'Added Value (V.A.)',
      'dashboard_fml_va': 'Production - Charges(60-65)',
      'dashboard_lbl_coeff': 'Operating Coefficient',
      'dashboard_fml_coeff': 'Production / Total Charges',
      'dashboard_lbl_ebe': 'EBITDA (EBE)',
      'dashboard_fml_ebe': 'V.A. - Charge(66)',
      'dashboard_lbl_re': 'Operating Result (R.E.)',
      'dashboard_fml_re': 'EBE - Charge(67)',
      'dashboard_lbl_encours': 'Outstanding Receivables',
      'dashboard_fml_encours': 'Production - Net Receipts',
      'dashboard_lbl_recovery': 'Recovery Rate',
      'dashboard_fml_recovery': '(Receipts / Production) × 100',
      'dashboard_lbl_productivity': 'Productivity',
      'dashboard_fml_productivity': 'Production / Workforce',
      'dashboard_lbl_avg_cost': 'Average Cost per Employee',
      'dashboard_fml_avg_cost': 'Charge(66) / Workforce',
      'dashboard_lbl_supervision': 'Supervision Ratio',
      'dashboard_fml_supervision': 'Workforce / Management Count',
      'dashboard_lbl_avg_salary': 'Average Salary',
      'dashboard_fml_avg_salary': 'Salary Mass / Workforce',
      'sec_dashboard': 'Key Performance Indicators',
      'Dashboard_Indicator': 'Indicator',
      'Dashboard_Formula': 'Formula',
      'Dashboard_Value': 'Value',
      'Sales Revenue': 'Sales Revenue',
      'Service Revenue': 'Service Revenue',
      'Other Revenue': 'Other Revenue',
      'Salaries & Wages': 'Salaries & Wages',
      'Rent': 'Rent',
      'Utilities': 'Utilities',
      'Office Supplies': 'Office Supplies',
      'Marketing': 'Marketing',
      'Insurance': 'Insurance',
      'Maintenance': 'Maintenance',
      'Professional Fees': 'Professional Fees',
      'Miscellaneous': 'Miscellaneous',
      'Customer Payments': 'Customer Payments',
      'Investment Income': 'Investment Income',
      'Loan Proceeds': 'Loan Proceeds',
      'Other Receipts': 'Other Receipts',
      'Loan Repayments': 'Loan Repayments',
      'Tax Payments': 'Tax Payments',
      'Capital Expenditure': 'Capital Expenditure',
      'New Charge': 'New Charge',
      // ...existing keys...
      // Dashboard metrics (FR)
    }
  },
  fr: {
    translation: {
      // ...existing keys...
      'Sales Revenue': 'Revenus des ventes',
      'Service Revenue': 'Revenus des services',
      'Other Revenue': 'Autres revenus',
      'Salaries & Wages': 'Salaires et traitements',
      'Rent': 'Loyer',
      'Utilities': 'Services publics',
      'Office Supplies': 'Fournitures de bureau',
      'Marketing': 'Marketing',
      'Insurance': 'Assurance',
      'Maintenance': 'Entretien',
      'Professional Fees': 'Honoraires professionnels',
      'Miscellaneous': 'Divers',
      'Customer Payments': 'Paiements des clients',
      'Investment Income': 'Revenus d’investissement',
      'Loan Proceeds': 'Produit des prêts',
      'Other Receipts': 'Autres recettes',
      'Loan Repayments': 'Remboursements de prêts',
      'Tax Payments': 'Paiements d’impôts',
      'Capital Expenditure': 'Dépenses d’investissement',
      'New Charge': 'Nouvelle charge',
      // ...existing keys...
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
