import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useSession } from "../contexts/SessionContext";
import LanguageSelector from "../components/LanguageSelector";
import SectionBudget from "../components/SectionBudget";
import SectionDashboard from "../components/SectionDashboard";
import SectionStaff from "../components/SectionStaff";
import SectionWorkforce from "../components/SectionWorkforce";
import SectionMovement from "../components/SectionMovement";
import SectionMedical from "../components/SectionMedical";
import SectionExploitation from "../components/SectionExploitation";
import { saveSession, getSession } from "../services/sessionService";
import type {
  AppData,
  BudgetData,
  StaffRow,
  WorkforceRow,
  MovementRow,
  MedicalCare,
  ExploitationData,
} from "../types/budget";

// Sample initial data
const initialBudgetData: BudgetData = {
  production: [
  { id: 'p1', label: 'Exportation', forecast: 0, achievement: 0 },
  { id: 'p2', label: 'Importation', forecast: 0, achievement: 0 },
  { id: 'p3', label: 'Local Production', forecast: 0, achievement: 0 },
  { id: 'p4', label: 'Border Traffic', forecast: 0, achievement: 0 },
  { id: 'p5', label: 'Local Transportation', forecast: 0, achievement: 0 },
  { id: 'p6', label: 'Lab Analysis', forecast: 0, achievement: 0 },
  { id: 'p7', label: 'Damages', forecast: 0, achievement: 0 },
  { id: 'p8', label: 'Metrology', forecast: 0, achievement: 0 },
  { id: 'p9', label: 'Technical Control', forecast: 0, achievement: 0 }
],
  charges: [
    { id: "bc1", label: "Salaries & Wages", forecast: 0, achievement: 0 },
    { id: "bc2", label: "Rent", forecast: 0, achievement: 0 },
    { id: "bc3", label: "Utilities", forecast: 0, achievement: 0 },
    { id: "bc4", label: "Office Supplies", forecast: 0, achievement: 0 },
    { id: "bc5", label: "Marketing", forecast: 0, achievement: 0 },
    { id: "bc6", label: "Insurance", forecast: 0, achievement: 0 },
    { id: "bc7", label: "Maintenance", forecast: 0, achievement: 0 },
    { id: "bc8", label: "Professional Fees", forecast: 0, achievement: 0 },
    { id: "bc9", label: "Miscellaneous", forecast: 0, achievement: 0 },
  ],
  treasuryReceipts: [
    { id: "tr1", label: "Customer Payments", forecast: 0, achievement: 0 },
    { id: "tr2", label: "Investment Income", forecast: 0, achievement: 0 },
    { id: "tr3", label: "Loan Proceeds", forecast: 0, achievement: 0 },
    { id: "tr4", label: "Other Receipts", forecast: 0, achievement: 0 },
  ],
  treasuryDisbursements: [
    { id: "td1", label: "Salaries & Wages", forecast: 0, achievement: 0 },
    { id: "td2", label: "Rent", forecast: 0, achievement: 0 },
    { id: "td3", label: "Utilities", forecast: 0, achievement: 0 },
    { id: "td4", label: "Office Supplies", forecast: 0, achievement: 0 },
    { id: "td5", label: "Marketing", forecast: 0, achievement: 0 },
    { id: "td6", label: "Insurance", forecast: 0, achievement: 0 },
    { id: "td7", label: "Maintenance", forecast: 0, achievement: 0 },
    { id: "td8", label: "Professional Fees", forecast: 0, achievement: 0 },
    { id: "td9", label: "Miscellaneous", forecast: 0, achievement: 0 },
    { id: "td10", label: "Loan Repayments", forecast: 0, achievement: 0 },
    { id: "td11", label: "Tax Payments", forecast: 0, achievement: 0 },
    { id: "td12", label: "Capital Expenditure", forecast: 0, achievement: 0 },
  ],
};

const initialStaffData: StaffRow[] = [
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
  {
    level: "University",
    DIR: 0,
    DA: 0,
    SD: 0,
    FPP: 0,
    FP: 0,
    CS3: 0,
    CS2: 0,
    CS1: 0,
    M3: 0,
    M2: 0,
    M1: 0,
    C9: 0,
    C8: 0,
    C7: 0,
    C6: 0,
  },
  {
    level: "Graduate",
    DIR: 0,
    DA: 0,
    SD: 0,
    FPP: 0,
    FP: 0,
    CS3: 0,
    CS2: 0,
    CS1: 0,
    M3: 0,
    M2: 0,
    M1: 0,
    C9: 0,
    C8: 0,
    C7: 0,
    C6: 0,
  },
  {
    level: "Secondary",
    DIR: 0,
    DA: 0,
    SD: 0,
    FPP: 0,
    FP: 0,
    CS3: 0,
    CS2: 0,
    CS1: 0,
    M3: 0,
    M2: 0,
    M1: 0,
    C9: 0,
    C8: 0,
    C7: 0,
    C6: 0,
  },
  {
    level: "Primary",
    DIR: 0,
    DA: 0,
    SD: 0,
    FPP: 0,
    FP: 0,
    CS3: 0,
    CS2: 0,
    CS1: 0,
    M3: 0,
    M2: 0,
    M1: 0,
    C9: 0,
    C8: 0,
    C7: 0,
    C6: 0,
  },
];

const initialMovementData: MovementRow[] = [
  { id: "m1", type: "New Hires", count: 0, observation: "" },
  { id: "m2", type: "Resignations", count: 0, observation: "" },
  { id: "m3", type: "Transfers In", count: 0, observation: "" },
  { id: "m4", type: "Transfers Out", count: 0, observation: "" },
];

const initialMedicalCare: MedicalCare[] = [
  { category: "Consultation", usd: 0, cdf: 0 },
  { category: "Surgery", usd: 0, cdf: 0 },
  { category: "Pharmacy", usd: 0, cdf: 0 },
  { category: "Laboratory", usd: 0, cdf: 0 },
];

const initialExploitationData: ExploitationData = {
  // 1. Operating Data
  operatingData: [
    {
      id: "op1",
      category: "IMPORTATION CAE",
      subcategory: "",
      volume: { kgs: 0, m3: 0, litre: 0 },
      value: { cif: 0, fob: 0, marchande: 0 },
      occFees: 0,
      dpdVerification: 0,
      result: 0,
    },
    {
      id: "op2",
      category: "IMPORTATION CAA",
      subcategory: "",
      volume: { kgs: 0, m3: 0, litre: 0 },
      value: { cif: 0, fob: 0, marchande: 0 },
      occFees: 0,
      dpdVerification: 0,
      result: 0,
    },
    {
      id: "op3",
      category: "EXPORTATION",
      subcategory: "",
      volume: { kgs: 0, m3: 0, litre: 0 },
      value: { cif: 0, fob: 0, marchande: 0 },
      occFees: 0,
      dpdVerification: 0,
      result: 0,
    },
    {
      id: "op4",
      category: "LOCAL PRODUCTION",
      subcategory: "",
      volume: { kgs: 0, m3: 0, litre: 0 },
      value: { cif: 0, fob: 0, marchande: 0 },
      occFees: 0,
      dpdVerification: 0,
      result: 0,
    },
    {
      id: "op5",
      category: "BORDER TRAFFIC",
      subcategory: "",
      volume: { kgs: 0, m3: 0, litre: 0 },
      value: { cif: 0, fob: 0, marchande: 0 },
      occFees: 0,
      dpdVerification: 0,
      result: 0,
    },
    {
      id: "op6",
      category: "LOCAL TRANSACTION",
      subcategory: "",
      volume: { kgs: 0, m3: 0, litre: 0 },
      value: { cif: 0, fob: 0, marchande: 0 },
      occFees: 0,
      dpdVerification: 0,
      result: 0,
    },
  ],
  // 2. Failures
  failures: [
    { id: "f1", name: "Findings", count: 0 },
    { id: "f2", name: "Prevention", count: 0 },
  ],
  // 3. Laboratory
  labAnalysis: [],
  // 4. Metrology
  metrology: [
    { id: "met1", name: "Metrology", count: 0 },
    { id: "met2", name: "Other Services", count: 0 },
  ],
  // 5. Technical Control
  technicalControl: [
    { id: "tc1", name: "Lifting", count: 0 },
    { id: "tc2", name: "Pressure", count: 0 },
    { id: "tc3", name: "Electricity", count: 0 },
    { id: "tc4", name: "Other Services", count: 0 },
  ],
};

export default function Budget() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { sessionDetails } = useSession();
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId?: string }>();
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "staff"
    | "workforce"
    | "movement"
    | "medical"
    | "exploitation"
    | "budget"
  >("dashboard");

  const [appData, setAppData] = useState<AppData>({
    budget: initialBudgetData,
    staff: initialStaffData,
    managementCount: 0,
    salaryMassCDF: 0,
    workforce: initialWorkforceData,
    movements: initialMovementData,
    serviceMissions: {
      performed: { type: "performed", count: 0, cost: 0 },
      received: { type: "received", count: 0, cost: 0 },
    },
    medicalCare: initialMedicalCare,
    transfersKinshasa: [],
    transfersAbroad: [],
    missionCosts: {
      inside: { usd: 0, cdf: 0 },
      abroad: { usd: 0, cdf: 0 },
    },
    divers: [
      { category: "Travel", usd: 0, cdf: 0 },
      { category: "Accommodation", usd: 0, cdf: 0 },
      { category: "Other", usd: 0, cdf: 0 },
    ],
    exploitation: initialExploitationData,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(!!sessionId);
  const [loadedSession, setLoadedSession] = useState<{
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
  } | null>(null);

  // Load session data if sessionId is provided
  useEffect(() => {
    if (sessionId && user?.uid) {
      const loadSession = async () => {
        try {
          const session = await getSession(sessionId);
          if (session && session.userId === user.uid) {
            setAppData((prevData) => ({
              ...prevData,
              staff: session.data.staff,
              managementCount: session.data.managementCount,
              salaryMassCDF: session.data.salaryMassCDF,
              exploitation: session.data.exploitation,
              budget: session.data.budget,
            }));
            setLoadedSession({
              name: session.sessionName,
              description: session.description || "",
              startDate: new Date(session.startDate),
              endDate: new Date(session.endDate),
            });
          } else {
            console.error("Session not found or unauthorized");
            navigate("/");
          }
        } catch (error) {
          console.error("Error loading session:", error);
          navigate("/");
        } finally {
          setIsLoadingSession(false);
        }
      };
      loadSession();
    }
  }, [sessionId, user?.uid, navigate]);

  // Redirect if no session details or session ID
  useEffect(() => {
    if (!sessionDetails && !sessionId) {
      navigate("/");
    }
  }, [sessionDetails, sessionId, navigate]);

  const handleDataChange = (newData: AppData) => {
    setAppData(newData);
    console.log("Data updated:", newData);
  };

  const handleSaveSession = async () => {
    if (!user?.uid) {
      alert(t("User not authenticated"));
      return;
    }

    // Get session details from either loaded session or SessionContext
    let sessionName: string;
    let description: string;
    let startDate: Date;
    let endDate: Date;

    if (loadedSession) {
      sessionName = loadedSession.name;
      description = loadedSession.description;
      startDate = loadedSession.startDate;
      endDate = loadedSession.endDate;
    } else if (sessionDetails) {
      sessionName = sessionDetails.sessionName;
      description = sessionDetails.description;
      startDate = sessionDetails.startDate;
      endDate = sessionDetails.endDate;
    } else {
      alert(
        t(
          "Session details not found. Please start a new session from the dashboard.",
        ),
      );
      return;
    }

    setIsSaving(true);

    try {
      const savedSessionId = await saveSession(
        user.uid,
        sessionName,
        appData,
        startDate,
        endDate,
        description,
        sessionId, // Pass existing sessionId to update instead of creating new
      );

      const message = sessionId
        ? t("Session updated successfully!")
        : t("Session saved successfully!");
      alert(message);

      // If this was a new session from SessionContext, navigate to the saved session
      if (!sessionId && savedSessionId) {
        navigate(`/budget/${savedSessionId}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("Failed to save session");
      alert(errorMessage);
      console.error("Error saving session:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: t('Tab_Dashboard') },
    { id: 'staff', label: t('Tab_Staff') },
    { id: 'workforce', label: t('Tab_Workforce') },
    { id: 'movement', label: t('Tab_Movement') },
    { id: 'medical', label: t('Tab_Medical') },
    { id: 'exploitation', label: t('Tab_Exploitation') },
    { id: 'budget', label: t('Tab_Budget') },
  ] as const;

  if (isLoadingSession) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='flex flex-col items-center gap-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
          <p className='text-gray-600'>{t("Loading session...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 text-gray-900'>
      <nav className='p-4 bg-white shadow border-b border-gray-200'>
        <div className='flex items-center justify-between container mx-auto'>
          <div className='flex items-center gap-6'>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>
                HRMS Management
              </h1>
              {(sessionDetails || sessionId) && (
                <p className='text-xs text-slate-600 mt-0.5'>
                  {sessionDetails?.sessionName || "Loading..."}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate("/")}
              className='px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition'
            >
              {t("← Back to Dashboard")}
            </button>
          </div>
          <div className='flex items-center gap-4'>
            <LanguageSelector />
            <button
              onClick={handleSaveSession}
              disabled={isSaving}
              className='px-4 py-2 bg-gray-900 text-white rounded hover:bg-black transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {isSaving ? (
                <>
                  <span className='animate-spin'>⏳</span>
                  {t("Saving...")}
                </>
              ) : (
                t("Save Session")
              )}
            </button>
            <div className='flex flex-col items-end'>
              <span className='text-sm font-medium'>{user?.displayName}</span>
              <span className='text-xs text-gray-500'>{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
            >
              {t("Logout")}
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs Navigation */}
      <div className='bg-white border-b border-gray-200'>
        <div className='container mx-auto'>
          <div className='flex gap-1 px-4 overflow-x-auto'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
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
        
        {activeTab === 'staff' && (
          <SectionStaff data={appData} onChange={handleDataChange} />
        )}

        {activeTab === "workforce" && (
          <SectionWorkforce data={appData} onChange={handleDataChange} />
        )}

        {activeTab === "movement" && (
          <SectionMovement data={appData} onChange={handleDataChange} />
        )}

        {activeTab === "medical" && (
          <SectionMedical data={appData} onChange={handleDataChange} />
        )}

        {activeTab === "exploitation" && (
          <SectionExploitation
            data={appData}
            onChange={handleDataChange}
            t={t}
          />
        )}

        {activeTab === "budget" && (
          <SectionBudget data={appData} onChange={handleDataChange} />
        )}
      </main>
    </div>
  );
}
