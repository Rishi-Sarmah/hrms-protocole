export type Language = 'en' | 'fr';

// --- Administration Types ---
export interface StaffRow {
  id: string;
  category: string;
  grade: string;
  male: number;
  female: number;
}

export interface MovementRow {
  id: string;
  type: string;
  count: number;
  observation: string;
  isCustom?: boolean;
}

export interface WorkforceRow {
  level: string;
  [grade: string]: number | string; // dynamic grade keys
}

export interface ServiceMission {
  type: 'performed' | 'received';
  count: number;
  cost: number;
}

export interface MedicalCare {
  category: string;
  usd: number;
  cdf: number;
}

export interface MedicalTransfer {
  id: string;
  entity: string;
  agents: number;
  retirees: number;
  wives: number;
  children: number;
  totalUsd: number;
  observation: string;
}

export interface OtherCost {
  category: string;
  usd: number;
  cdf: number;
}

// --- Exploitation Types ---

export interface OperatingDataRow {
  id: string;
  category: string; // e.g., IMPORTATION
  subcategory: string; // e.g., CAE, CAA
  volume: {
    kgs: number;
    m3: number;
    litre: number;
  };
  value: {
    cif: number;
    fob: number;
    marchande: number;
  };
  occFees: number;
  dpdVerification: number;
  result: number;
}

export interface ServiceCountRow {
  id: string;
  name: string;
  count: number | string;
}

export interface LabAnalysisRow {
  id: string;
  category: string; // e.g., PRODUITS ALIMENTAIRES
  product: string;
  received: number;
  analyzed: number;
  nonCompliant: number;
  compliant: number;
}

export interface ExploitationData {
  operatingData: OperatingDataRow[];
  failures: ServiceCountRow[]; // Avaries
  labAnalysis: LabAnalysisRow[];
  metrology: ServiceCountRow[];
  technicalControl: ServiceCountRow[];
}

// --- Budget Types ---

export interface BudgetRow {
  id: string;
  label: string;
  forecast: number;
  achievement: number;
  isCustom?: boolean;
}

export interface BudgetData {
  production: BudgetRow[];
  charges: BudgetRow[];
  treasuryReceipts: BudgetRow[];
  treasuryDisbursements: BudgetRow[];
}

export interface AppData {
  // Admin
  staff: StaffRow[];
  managementCount: number;
  salaryMassCDF: number;
  movements: MovementRow[];
  workforce: WorkforceRow[];
  serviceMissions: {
    performed: ServiceMission;
    received: ServiceMission;
  };
  medicalCare: MedicalCare[];
  transfersKinshasa: MedicalTransfer[];
  transfersAbroad: MedicalTransfer[];
  missionCosts: {
    inside: { usd: number; cdf: number };
    abroad: { usd: number; cdf: number };
  };
  divers: OtherCost[];
  
  // Exploitation
  exploitation: ExploitationData;

  // Budget
  budget: BudgetData;
}

export type TranslationKey = 
  | 'app_title'
  | 'grp_admin'
  | 'grp_exploit'
  | 'grp_finance'
  | 'tab_personnel'
  | 'tab_movement'
  | 'tab_workforce'
  | 'tab_medical'
  | 'tab_operating'
  | 'tab_budget'
  | 'tab_dashboard'
  | 'tab_insights'
  | 'col_category'
  | 'col_grade'
  | 'col_male'
  | 'col_female'
  | 'col_total'
  | 'lbl_management_count'
  | 'lbl_salary_mass'
  | 'sec_personnel'
  | 'sec_movement'
  | 'sec_workforce'
  | 'sec_medical'
  | 'sec_operating'
  | 'sec_lab'
  | 'sec_services'
  | 'sec_budget_production'
  | 'sec_budget_charges'
  | 'sec_treasury_receipts'
  | 'sec_treasury_disbursements'
  | 'sec_dashboard'
  | 'btn_save'
  | 'btn_analyze'
  | 'loading_ai'
  | 'dashboard_lbl_va' | 'dashboard_fml_va'
  | 'dashboard_lbl_coeff' | 'dashboard_fml_coeff'
  | 'dashboard_lbl_ebe' | 'dashboard_fml_ebe'
  | 'dashboard_lbl_re' | 'dashboard_fml_re'
  | 'dashboard_lbl_encours' | 'dashboard_fml_encours'
  | 'dashboard_lbl_recovery' | 'dashboard_fml_recovery'
  | 'dashboard_lbl_productivity' | 'dashboard_fml_productivity'
  | 'dashboard_lbl_avg_cost' | 'dashboard_fml_avg_cost'
  | 'dashboard_lbl_supervision' | 'dashboard_fml_supervision'
  | 'dashboard_lbl_avg_salary' | 'dashboard_fml_avg_salary'
  | 'dashboard_lbl_total_workforce' | 'dashboard_fml_total_workforce';
