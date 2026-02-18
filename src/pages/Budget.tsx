import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
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
  { id: 'p1', label: 'EXPORTATION', forecast: 0, achievement: 0 },
  { id: 'p2', label: 'IMPORTATION', forecast: 0, achievement: 0 },
  { id: 'p3', label: 'LOCAL PROD.', forecast: 0, achievement: 0 },
  { id: 'p4', label: 'BORDER TRAFFIC', forecast: 0, achievement: 0 },
  { id: 'p5', label: 'LOCAL TRANS.', forecast: 0, achievement: 0 },
  { id: 'p6', label: 'LAB ANALYSIS', forecast: 0, achievement: 0 },
  { id: 'p7', label: 'FAILURES/AVARIES', forecast: 0, achievement: 0 },
  { id: 'p8', label: 'METROLOGY', forecast: 0, achievement: 0 },
  { id: 'p9', label: 'TECH. CONTROL', forecast: 0, achievement: 0 }
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
  { id: 'p1', category: 'MANAGEMENT STAFF', grade: 'DIR.', male: 0, female: 0 },
  { id: 'p2', category: 'MANAGEMENT STAFF', grade: 'D.A.', male: 0, female: 0 },
  { id: 'p3', category: 'MANAGEMENT STAFF', grade: 'SD', male: 0, female: 0 },
  { id: 'p4', category: 'SENIOR STAFF', grade: 'FPP', male: 0, female: 0 },
  { id: 'p5', category: 'SENIOR STAFF', grade: 'FP', male: 0, female: 0 },
  { id: 'p6', category: 'SUBORDINATE STAFF', grade: 'CS3', male: 0, female: 0 },
  { id: 'p7', category: 'SUBORDINATE STAFF', grade: 'CS2', male: 0, female: 0 },
  { id: 'p8', category: 'SUBORDINATE STAFF', grade: 'CS1', male: 0, female: 0 },
  { id: 'p9', category: 'SUPERVISORY STAFF', grade: 'M3', male: 0, female: 0 },
  { id: 'p10', category: 'SUPERVISORY STAFF', grade: 'M2', male: 0, female: 0 },
  { id: 'p11', category: 'SUPERVISORY STAFF', grade: 'M1', male: 0, female: 0 },
  { id: 'p12', category: 'ECHELONNED STAFF', grade: 'C9', male: 0, female: 0 },
  { id: 'p13', category: 'ECHELONNED STAFF', grade: 'C8', male: 0, female: 0 },
  { id: 'p14', category: 'ECHELONNED STAFF', grade: 'C7', male: 0, female: 0 },
  { id: 'p15', category: 'ECHELONNED STAFF', grade: 'C6', male: 0, female: 0 },
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
  // 1. Operating Data
  operatingData: [
    { id: 'op1', category: 'IMPORTATION CAE', subcategory: '', volume: { kgs: 0, m3: 0, litre: 0 }, value: { cif: 0, fob: 0, marchande: 0 }, occFees: 0, dpdVerification: 0, result: 0 },
    { id: 'op2', category: 'IMPORTATION CAA', subcategory: '', volume: { kgs: 0, m3: 0, litre: 0 }, value: { cif: 0, fob: 0, marchande: 0 }, occFees: 0, dpdVerification: 0, result: 0 },
    { id: 'op3', category: 'EXPORTATION', subcategory: '', volume: { kgs: 0, m3: 0, litre: 0 }, value: { cif: 0, fob: 0, marchande: 0 }, occFees: 0, dpdVerification: 0, result: 0 },
    { id: 'op4', category: 'LOCAL PRODUCTION', subcategory: '', volume: { kgs: 0, m3: 0, litre: 0 }, value: { cif: 0, fob: 0, marchande: 0 }, occFees: 0, dpdVerification: 0, result: 0 },
    { id: 'op5', category: 'BORDER TRAFFIC', subcategory: '', volume: { kgs: 0, m3: 0, litre: 0 }, value: { cif: 0, fob: 0, marchande: 0 }, occFees: 0, dpdVerification: 0, result: 0 },
    { id: 'op6', category: 'LOCAL TRANSACTION', subcategory: '', volume: { kgs: 0, m3: 0, litre: 0 }, value: { cif: 0, fob: 0, marchande: 0 }, occFees: 0, dpdVerification: 0, result: 0 },
  ],
  // 2. Failures
  failures: [
    { id: 'f1', name: 'Findings', count: 0 },
    { id: 'f2', name: 'Prevention', count: 0 },
  ],
  // 3. Laboratory
  labAnalysis: [], 
  // 4. Metrology
  metrology: [
    { id: 'met1', name: 'Metrology', count: 0 },
    { id: 'met2', name: 'Other Services', count: 0 },
  ],
  // 5. Technical Control
  technicalControl: [
    { id: 'tc1', name: 'Lifting', count: 0 },
    { id: 'tc2', name: 'Pressure', count: 0 },
    { id: 'tc3', name: 'Electricity', count: 0 },
    { id: 'tc4', name: 'Other Services', count: 0 },
  ],
};

export default function Budget() {
  const { t } = useTranslation();
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
              {t('← Back to Dashboard')}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {t('Save All Data')}
            </button>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium">{user?.displayName}</span>
              <span className="text-xs text-gray-500">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              {t('Logout')}
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
          <SectionDashboard data={appData} />
        )}
        
        {activeTab === 'personnel' && (
          <SectionPersonnel data={appData} onChange={handleDataChange} />
        )}
        
        {activeTab === 'workforce' && (
          <SectionWorkforce data={appData} onChange={handleDataChange} />
        )}
        
        {activeTab === 'movement' && (
          <SectionMovement data={appData} onChange={handleDataChange} />
        )}
        
        {activeTab === 'medical' && (
          <SectionMedical data={appData} onChange={handleDataChange} />
        )}
        
        {activeTab === 'exploitation' && (
          <SectionExploitation data={appData} onChange={handleDataChange} t={t}/>
        )}
        
        {activeTab === 'budget' && (
          <SectionBudget data={appData} onChange={handleDataChange} />
        )}
      </main>
    </div>
  );
}
