import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SectionBudget from '../components/SectionBudget';
import SectionDashboard from '../components/SectionDashboard';
import SectionPersonnel from '../components/SectionPersonnel';
import SectionWorkforce from '../components/SectionWorkforce';
import SectionMovement from '../components/SectionMovement';
import SectionMedical from '../components/SectionMedical';
import SectionExploitation from '../components/SectionExploitation';
import type { AppData, BudgetData, PersonnelRow, WorkforceRow, MovementRow, MedicalCare, ExploitationData } from '../types/budget';

// Sample initial data
const initialBudgetData: BudgetData = {
  production: [
    { id: 'p1', label: 'Sales Revenue', forecast: 0, achievement: 0 },
    { id: 'p2', label: 'Service Revenue', forecast: 0, achievement: 0 },
    { id: 'p3', label: 'Other Revenue', forecast: 0, achievement: 0 },
  ],
  charges: [
    { id: 'bc1', label: 'Salaries & Wages', forecast: 0, achievement: 0 },
    { id: 'bc2', label: 'Rent', forecast: 0, achievement: 0 },
    { id: 'bc3', label: 'Utilities', forecast: 0, achievement: 0 },
    { id: 'bc4', label: 'Office Supplies', forecast: 0, achievement: 0 },
    { id: 'bc5', label: 'Marketing', forecast: 0, achievement: 0 },
    { id: 'bc6', label: 'Insurance', forecast: 0, achievement: 0 },
    { id: 'bc7', label: 'Maintenance', forecast: 0, achievement: 0 },
    { id: 'bc8', label: 'Professional Fees', forecast: 0, achievement: 0 },
    { id: 'bc9', label: 'Miscellaneous', forecast: 0, achievement: 0 },
  ],
  treasuryReceipts: [
    { id: 'tr1', label: 'Customer Payments', forecast: 0, achievement: 0 },
    { id: 'tr2', label: 'Investment Income', forecast: 0, achievement: 0 },
    { id: 'tr3', label: 'Loan Proceeds', forecast: 0, achievement: 0 },
    { id: 'tr4', label: 'Other Receipts', forecast: 0, achievement: 0 },
  ],
  treasuryDisbursements: [
    { id: 'td1', label: 'Salaries & Wages', forecast: 0, achievement: 0 },
    { id: 'td2', label: 'Rent', forecast: 0, achievement: 0 },
    { id: 'td3', label: 'Utilities', forecast: 0, achievement: 0 },
    { id: 'td4', label: 'Office Supplies', forecast: 0, achievement: 0 },
    { id: 'td5', label: 'Marketing', forecast: 0, achievement: 0 },
    { id: 'td6', label: 'Insurance', forecast: 0, achievement: 0 },
    { id: 'td7', label: 'Maintenance', forecast: 0, achievement: 0 },
    { id: 'td8', label: 'Professional Fees', forecast: 0, achievement: 0 },
    { id: 'td9', label: 'Miscellaneous', forecast: 0, achievement: 0 },
    { id: 'td10', label: 'Loan Repayments', forecast: 0, achievement: 0 },
    { id: 'td11', label: 'Tax Payments', forecast: 0, achievement: 0 },
    { id: 'td12', label: 'Capital Expenditure', forecast: 0, achievement: 0 },
  ],
};

const initialPersonnelData: PersonnelRow[] = [
  { id: 'p1', category: 'r_p_cat_dir', grade: 'DIR', male: 0, female: 0 },
  { id: 'p2', category: 'Technical Staff', grade: 'SD', male: 0, female: 0 },
  { id: 'p3', category: 'Administrative', grade: 'FP', male: 0, female: 0 },
  { id: 'p4', category: 'Support Staff', grade: 'CS1', male: 0, female: 0 },
];

const initialWorkforceData: WorkforceRow[] = [
  { level: 'University', DIR: 0, DA: 0, SD: 0, FPP: 0, FP: 0, CS3: 0, CS2: 0, CS1: 0, M3: 0, M2: 0, M1: 0, C9: 0, C8: 0, C7: 0, C6: 0 },
  { level: 'Graduate', DIR: 0, DA: 0, SD: 0, FPP: 0, FP: 0, CS3: 0, CS2: 0, CS1: 0, M3: 0, M2: 0, M1: 0, C9: 0, C8: 0, C7: 0, C6: 0 },
  { level: 'Secondary', DIR: 0, DA: 0, SD: 0, FPP: 0, FP: 0, CS3: 0, CS2: 0, CS1: 0, M3: 0, M2: 0, M1: 0, C9: 0, C8: 0, C7: 0, C6: 0 },
  { level: 'Primary', DIR: 0, DA: 0, SD: 0, FPP: 0, FP: 0, CS3: 0, CS2: 0, CS1: 0, M3: 0, M2: 0, M1: 0, C9: 0, C8: 0, C7: 0, C6: 0 },
];

const initialMovementData: MovementRow[] = [
  { id: 'm1', type: 'New Hires', count: 0, observation: '' },
  { id: 'm2', type: 'Resignations', count: 0, observation: '' },
  { id: 'm3', type: 'Transfers In', count: 0, observation: '' },
  { id: 'm4', type: 'Transfers Out', count: 0, observation: '' },
];

const initialMedicalCare: MedicalCare[] = [
  { category: 'Consultation', usd: 0, cdf: 0 },
  { category: 'Surgery', usd: 0, cdf: 0 },
  { category: 'Pharmacy', usd: 0, cdf: 0 },
  { category: 'Laboratory', usd: 0, cdf: 0 },
];

const initialExploitationData: ExploitationData = {
  operatingData: [
    { id: 'op1', category: 'Product A', subcategory: '', volume: { kgs: 0, m3: 0, litre: 0 }, value: { cif: 0, fob: 0, marchande: 0 }, occFees: 0, dpdVerification: 0, result: 0 },
    { id: 'op2', category: 'Product B', subcategory: '', volume: { kgs: 0, m3: 0, litre: 0 }, value: { cif: 0, fob: 0, marchande: 0 }, occFees: 0, dpdVerification: 0, result: 0 },
  ],
  failures: [
    { id: 'f1', name: 'Equipment Failure', count: '' },
    { id: 'f2', name: 'Process Failure', count: '' },
  ],
  labAnalysis: [],
  metrology: [
    { id: 'met1', name: 'Calibration', count: 0 },
    { id: 'met2', name: 'Verification', count: 0 },
  ],
  technicalControl: [
    { id: 'tc1', name: 'Quality Inspection', count: 0 },
    { id: 'tc2', name: 'Safety Check', count: 0 },
  ],
};

const translate = (key: string) => {
  const translations: Record<string, string> = {
    'sec_budget_production': 'Production Budget',
    'sec_budget_charges': 'Operating Charges',
    'sec_treasury_receipts': 'Treasury Receipts',
    'sec_treasury_disbursements': 'Treasury Disbursements',
    'Designation': 'Designation',
    'Forecast': 'Forecast',
    'Achievements': 'Achievements',
    'RealRate': 'Achievement Rate',
    'sec_dashboard': 'Key Performance Indicators',
    'Dashboard_Indicator': 'Indicator',
    'Dashboard_Formula': 'Formula',
    'Dashboard_Value': 'Value',
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
    'sec_personnel': 'Personnel Management',
    'col_category': 'Category',
    'col_grade': 'Grade',
    'col_male': 'Male',
    'col_female': 'Female',
    'col_total': 'Total',
    'lbl_management_count': 'Management Count (Auto-calculated)',
    'lbl_salary_mass': 'Salary Mass (CDF)',
    'sec_workforce': 'Workforce by Education Level',
    'Level': 'Education Level',
    'sec_movement': 'Personnel Movement',
    'Movement': 'Movement Type',
    'Effectif': 'Count',
    'Observation': 'Observation',
    'Missions': 'Service Missions',
    'Performed': 'Missions Performed',
    'Received': 'Missions Received',
    'Medical Care': 'Medical Care Expenses',
    'Transfers Kinshasa': 'Medical Transfers - Kinshasa',
    'Transfers Abroad': 'Medical Transfers - Abroad',
    'Entity': 'Entity',
    'Agents': 'Agents',
    'Retirees': 'Retirees',
    'Wives': 'Spouses',
    'Children': 'Children',
    'Divers': 'Miscellaneous Expenses',
    'Inside': 'Domestic',
    'Abroad': 'International',
    'sec_operating': 'Operating Data',
    'Product': 'Product',
    'Volume': 'Volume',
    'Value': 'Value',
    'Fees & Result': 'Fees & Results',
    'Failures': 'Operational Failures',
    'Type': 'Type',
    'Count': 'Count',
    'Description': 'Description',
    'Metrology': 'Metrology Services',
    'TechControl': 'Technical Control',
  };
  return translations[key] || key;
};

export default function Budget() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'personnel' | 'workforce' | 'movement' | 'medical' | 'exploitation' | 'budget'>('dashboard');
  
  const [appData, setAppData] = useState<AppData>({
    budget: initialBudgetData,
    personnel: initialPersonnelData,
    managementCount: 0,
    salaryMassCDF: 0,
    workforce: initialWorkforceData,
    movements: initialMovementData,
    serviceMissions: {
      performed: { type: 'performed', count: 0, cost: 0 },
      received: { type: 'received', count: 0, cost: 0 },
    },
    medicalCare: initialMedicalCare,
    transfersKinshasa: [],
    transfersAbroad: [],
    missionCosts: {
      inside: { usd: 0, cdf: 0 },
      abroad: { usd: 0, cdf: 0 },
    },
    divers: [
      { category: 'Travel', usd: 0, cdf: 0 },
      { category: 'Accommodation', usd: 0, cdf: 0 },
      { category: 'Other', usd: 0, cdf: 0 },
    ],
    exploitation: initialExploitationData,
  });

  const handleDataChange = (newData: AppData) => {
    setAppData(newData);
    console.log('Data updated:', newData);
  };

  const handleSave = async () => {
    console.log('Saving all data:', appData);
    alert('Data saved! (Console log for now)');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'personnel', label: 'Personnel' },
    { id: 'workforce', label: 'Workforce' },
    { id: 'movement', label: 'Movement' },
    { id: 'medical', label: 'Medical' },
    { id: 'exploitation', label: 'Exploitation' },
    { id: 'budget', label: 'Budget' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="p-4 bg-white shadow border-b border-gray-200">
        <div className="flex items-center justify-between container mx-auto">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-blue-600">HRMS Management</h1>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition"
            >
              ← Back to Dashboard
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Save All Data
            </button>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium">{user?.displayName}</span>
              <span className="text-xs text-gray-500">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex gap-1 px-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto p-6">
        {activeTab === 'dashboard' && (
          <SectionDashboard data={appData} t={translate} />
        )}
        
        {activeTab === 'personnel' && (
          <SectionPersonnel data={appData} onChange={handleDataChange} t={translate} />
        )}
        
        {activeTab === 'workforce' && (
          <SectionWorkforce data={appData} onChange={handleDataChange} t={translate} />
        )}
        
        {activeTab === 'movement' && (
          <SectionMovement data={appData} onChange={handleDataChange} t={translate} />
        )}
        
        {activeTab === 'medical' && (
          <SectionMedical data={appData} onChange={handleDataChange} t={translate} />
        )}
        
        {activeTab === 'exploitation' && (
          <SectionExploitation data={appData} onChange={handleDataChange} t={translate} />
        )}
        
        {activeTab === 'budget' && (
          <SectionBudget data={appData} onChange={handleDataChange} t={translate} />
        )}
      </main>
    </div>
  );
}
