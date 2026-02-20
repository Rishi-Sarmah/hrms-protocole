import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import LanguageSelector from "../components/LanguageSelector";
import { SessionDetailsForm } from "../components/SessionDetailsForm";
import {
  getUserSessions,
  deleteSession,
  duplicateSession,
  getSession,
} from "../services/sessionService";
import {
  Trash2,
  Copy,
  Eye,
  BarChart3,
  Users,
  Banknote,
  TrendingUp,
  FileSearch,
  Calculator,
  LayoutDashboard,
  Zap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mermaid } from "../components/Mermaid";
import { analyzeReport } from "../services/aiservice";
import type { SessionListItem, Session } from "../types/session";

export default function Dashboard() {
  const [showAIInsights, setShowAIInsights] = useState(false);
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSessionData, setLoadingSessionData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const loadSessions = async () => {
    if (user?.uid) {
      try {
        setLoading(true);
        const userSessions = await getUserSessions(user.uid);
        setSessions(userSessions);
        setError(null);

        // Auto-select the first (latest) session if available and no session is currently selected
        if (userSessions.length > 0 && !selectedSession) {
          loadSessionData(userSessions[0].id);
        }
      } catch (err) {
        console.error("Error fetching sessions", err);
        setError("Failed to fetch sessions. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadSessionData = async (sessionId: string) => {
    setLoadingSessionData(true);
    try {
      const session = await getSession(sessionId);
      if (session && session.userId === user?.uid) {
        setSelectedSession(session);
      }
    } catch (err) {
      console.error("Error loading session data:", err);
      alert(t("Failed to load session data"));
    } finally {
      setLoadingSessionData(false);
    }
  };

  const handleDeleteSession = async (
    sessionId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!confirm(t("Are you sure you want to delete this session?"))) {
      return;
    }

    try {
      await deleteSession(sessionId);
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
      await loadSessions();
    } catch (err) {
      console.error("Error deleting session", err);
      alert(t("Failed to delete session. Please try again."));
    }
  };

  const handleDuplicateSession = async (
    sessionId: string,
    sessionName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!user?.uid) return;

    const newName = prompt(
      t("Enter name for duplicated session:"),
      `${sessionName} (Copy)`,
    );
    if (!newName) return;

    try {
      await duplicateSession(sessionId, newName, user.uid);
      await loadSessions();
    } catch (err) {
      console.error("Error duplicating session", err);
      alert(t("Failed to duplicate session. Please try again."));
    }
  };

  const handleAIInsights = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      // Load session data if not already loaded or if different session
      let session = selectedSession;
      if (!session || session.id !== sessionId) {
        setLoadingSessionData(true);
        session = await getSession(sessionId);
        if (session && session.userId === user?.uid) {
          setSelectedSession(session);
        } else {
          throw new Error("Session not found or access denied");
        }
        setLoadingSessionData(false);
      }

      // Show AI Insights view and start analysis
      setShowAIInsights(true);
      setAiLoading(true);
      setAiError(null);
      setAiAnalysis(null);

      // Get current language
      const currentLanguage = i18n.language || "en";

      // Call AI service
      const analysis = await analyzeReport(session, currentLanguage);
      setAiAnalysis(analysis);
    } catch (err) {
      console.error("Error generating AI insights:", err);
      setAiError(t("Failed to generate AI insights. Please try again."));
    } finally {
      setAiLoading(false);
    }
  };

  if (showNewSessionForm) {
    return <SessionDetailsForm onClose={() => setShowNewSessionForm(false)} />;
  }

  // Calculate statistics from selected session
  const calculateStats = () => {
    if (!selectedSession) return null;

    const totalPersonnel = selectedSession.data.staff.reduce(
      (sum, row) => sum + row.male + row.female,
      0,
    );

    // Budget Production KPIs
    const productionForecast = selectedSession.data.budget.production.reduce(
      (sum, row) => sum + row.forecast,
      0,
    );
    const productionAchievement = selectedSession.data.budget.production.reduce(
      (sum, row) => sum + row.achievement,
      0,
    );
    const productionVariance = productionAchievement - productionForecast;
    const productionPerformance =
      productionForecast > 0
        ? ((productionAchievement / productionForecast) * 100).toFixed(1)
        : "0";

    // Budget Charges KPIs
    const chargesForecast = selectedSession.data.budget.charges.reduce(
      (sum, row) => sum + row.forecast,
      0,
    );
    const chargesAchievement = selectedSession.data.budget.charges.reduce(
      (sum, row) => sum + row.achievement,
      0,
    );
    const chargesVariance = chargesForecast - chargesAchievement; // Positive is good (under budget)

    // Treasury KPIs
    const treasuryReceiptsForecast =
      selectedSession.data.budget.treasuryReceipts.reduce(
        (sum, row) => sum + row.forecast,
        0,
      );
    const treasuryReceiptsAchievement =
      selectedSession.data.budget.treasuryReceipts.reduce(
        (sum, row) => sum + row.achievement,
        0,
      );
    const treasuryDisbursementsForecast =
      selectedSession.data.budget.treasuryDisbursements.reduce(
        (sum, row) => sum + row.forecast,
        0,
      );
    const treasuryDisbursementsAchievement =
      selectedSession.data.budget.treasuryDisbursements.reduce(
        (sum, row) => sum + row.achievement,
        0,
      );
    const netTreasuryPosition =
      treasuryReceiptsAchievement - treasuryDisbursementsAchievement;

    // Operating margin
    const operatingMargin = productionAchievement - chargesAchievement;

    // Detailed KPI Calculations (like SectionDashboard)
    const getCharge = (id: string) =>
      selectedSession.data.budget.charges.find((c) => c.id === id)
        ?.achievement || 0;

    // Sum of bc1 to bc6 (charges 60-65)
    const charges60to65 = ["bc1", "bc2", "bc3", "bc4", "bc5", "bc6"].reduce(
      (sum, id) => sum + getCharge(id),
      0,
    );

    // V.A. = Production - (60 to 65)
    const va = productionAchievement - charges60to65;

    // Coefficient d'Exploitation = Production / Charges
    const coeffExploitation =
      chargesAchievement !== 0 ? productionAchievement / chargesAchievement : 0;

    // EBE = V.A. - bc7 (charge 66)
    const charge66 = getCharge("bc7");
    const ebe = va - charge66;

    // R.E. = EBE - bc8 (charge 67)
    const charge67 = getCharge("bc8");
    const re = ebe - charge67;

    // Encours Clients = Production - Recettes (tr2)
    const receipts =
      selectedSession.data.budget.treasuryReceipts.find((r) => r.id === "tr2")
        ?.achievement || 0;
    const encoursClients = productionAchievement - receipts;

    // Taux de Recouvrement = (Recettes / Production) * 100
    const recoveryRate =
      productionAchievement !== 0
        ? (receipts / productionAchievement) * 100
        : 0;

    // Productivité = Production / Effectif
    const productivity =
      totalPersonnel !== 0 ? productionAchievement / totalPersonnel : 0;

    // Cout Moyen = Charge 66 / Effectif
    const avgCost = totalPersonnel !== 0 ? charge66 / totalPersonnel : 0;

    // Ratio Encadrement = Effectif / Effectif Dirigeant
    const supervisionRatio =
      selectedSession.data.managementCount !== 0
        ? totalPersonnel / selectedSession.data.managementCount
        : 0;

    // Salaire Moyen = Masse salariale / Effectif
    const avgSalary =
      totalPersonnel !== 0
        ? selectedSession.data.salaryMassCDF / totalPersonnel
        : 0;

    return {
      totalPersonnel,
      managementCount: selectedSession.data.managementCount,
      salaryMass: selectedSession.data.salaryMassCDF,
      productionForecast,
      productionAchievement,
      productionVariance,
      productionPerformance,
      chargesForecast,
      chargesAchievement,
      chargesVariance,
      treasuryReceiptsForecast,
      treasuryReceiptsAchievement,
      treasuryDisbursementsForecast,
      treasuryDisbursementsAchievement,
      netTreasuryPosition,
      operatingMargin,
      va,
      coeffExploitation,
      ebe,
      re,
      encoursClients,
      recoveryRate,
      productivity,
      avgCost,
      supervisionRatio,
      avgSalary,
    };
  };

  const stats = calculateStats();

  if (showAIInsights) {
    return (
      <div className='h-screen bg-gray-50 text-gray-900 flex flex-col'>
        <nav className='p-4 bg-white shadow-lg border-b-2 border-slate-200 shrink-0'>
          <div className='flex items-center justify-between container mx-auto'>
            <div className='flex items-center gap-6'>
              <h1 className='text-lg font-bold text-gray-900'>
                {t("AI Insights")}
              </h1>
            </div>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => {
                  setShowAIInsights(false);
                  setAiAnalysis(null);
                  setAiError(null);
                }}
                className='px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition font-semibold text-sm'
              >
                {t("Back to Dashboard")}
              </button>
              <LanguageSelector />
              <div className='flex flex-col items-end'>
                <span className='text-xs font-medium'>{user?.displayName}</span>
                <span className='text-[10px] text-gray-500'>{user?.email}</span>
              </div>
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt='User'
                  className='w-8 h-8 rounded-full border border-gray-300'
                />
              )}
              <button
                onClick={() => logout()}
                className='px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 border border-red-200 transition'
              >
                {t("Logout")}
              </button>
            </div>
          </div>
        </nav>
        <div className='flex-1 overflow-y-auto p-6'>
          <div className='max-w-5xl mx-auto'>
            {/* Session Info Header */}
            {selectedSession && (
              <div className='bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6 mb-6'>
                <div className='flex items-start gap-4'>
                  <div className='p-3 bg-blue-100 rounded-lg'>
                    <Zap className='w-8 h-8 text-blue-600' />
                  </div>
                  <div className='flex-1'>
                    <h2 className='text-xl font-bold text-slate-800 mb-1'>
                      {selectedSession.sessionName}
                    </h2>
                    {selectedSession.description && (
                      <p className='text-slate-600 text-sm mb-2'>
                        {selectedSession.description}
                      </p>
                    )}
                    <div className='flex gap-4 text-xs text-slate-500'>
                      <span>
                        {t("Period")}:{" "}
                        {new Date(
                          selectedSession.startDate,
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(selectedSession.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Analysis Content */}
            <div className='bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden'>
              <div className='px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b-2 border-slate-200'>
                <h3 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                  <BarChart3 className='w-5 h-5 text-indigo-600' />
                  {t("Executive Summary & Analysis")}
                </h3>
              </div>

              <div className='p-6'>
                {aiLoading && (
                  <div className='flex flex-col items-center justify-center py-12'>
                    <Loader2 className='w-12 h-12 text-blue-500 animate-spin mb-4' />
                    <p className='text-slate-600 text-lg'>
                      {t("Analyzing your session data...")}
                    </p>
                    <p className='text-slate-500 text-sm mt-2'>
                      {t("This may take a few moments")}
                    </p>
                  </div>
                )}

                {aiError && (
                  <div className='flex flex-col items-center justify-center py-12'>
                    <div className='p-4 bg-red-50 rounded-full mb-4'>
                      <AlertCircle className='w-12 h-12 text-red-500' />
                    </div>
                    <p className='text-red-600 text-lg font-semibold mb-2'>
                      {t("Analysis Failed")}
                    </p>
                    <p className='text-slate-600 text-sm text-center max-w-md'>
                      {aiError}
                    </p>
                  </div>
                )}

                {aiAnalysis && !aiLoading && (
                  <div className='prose prose-slate max-w-none'>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          if (match && match[1] === "mermaid") {
                            return <Mermaid chart={String(children).replace(/\n$/, "")} />;
                          }
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {aiAnalysis}
                    </ReactMarkdown>
                  </div>
                )}

                {!aiLoading && !aiError && !aiAnalysis && (
                  <div className='flex flex-col items-center justify-center py-12'>
                    <Zap className='w-12 h-12 text-slate-300 mb-4' />
                    <p className='text-slate-500'>
                      {t("No analysis available")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className='mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg'>
              <div className='flex gap-3'>
                <AlertCircle className='w-5 h-5 text-blue-600 shrink-0 mt-0.5' />
                <div className='text-sm text-slate-700'>
                  <p className='font-semibold mb-1'>{t("About AI Insights")}</p>
                  <p>
                    {t(
                      "This analysis is generated by AI based on your session data. Use it as a supplementary tool for decision-making.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className='h-screen bg-gray-50 text-gray-900 flex flex-col'>
      {/* Header */}
      <nav className='p-4 bg-white shadow-lg border-b-2 border-slate-200 shrink-0'>
        <div className='flex items-center justify-between container mx-auto'>
          <div className='flex items-center gap-6'>
            <h1 className='text-lg font-bold text-gray-900'>
              Standards and Means
            </h1>
          </div>
          <div className='flex items-center gap-4'>
            <LanguageSelector />
            <div className='flex flex-col items-end'>
              <span className='text-xs font-medium'>{user?.displayName}</span>
              <span className='text-[10px] text-gray-500'>{user?.email}</span>
            </div>
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt='User'
                className='w-8 h-8 rounded-full border border-gray-300'
              />
            )}
            <button
              onClick={() => logout()}
              className='px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 border border-red-200 transition'
            >
              {t("Logout")}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Sidebar - Sessions List */}
        <aside className='w-80 bg-white border-r border-slate-200 flex flex-col'>
          <div className='p-4 border-b border-slate-200 shrink-0'>
            <h2 className='text-lg font-semibold text-slate-800 mb-2'>
              {t("Your Sessions")}
            </h2>
            <button
              onClick={() => setShowNewSessionForm(true)}
              className='w-full px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-colors text-sm'
            >
              + {t("New Session")}
            </button>
          </div>

          <div className='flex-1 overflow-y-auto'>
            {loading ? (
              <div className='flex justify-center p-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
              </div>
            ) : error ? (
              <div className='p-4 m-4 text-red-700 bg-red-100 border border-red-200 rounded text-sm'>
                {error}
              </div>
            ) : sessions.length === 0 ? (
              <div className='p-6 text-center'>
                <p className='text-gray-500 text-sm mb-4'>
                  {t("No sessions yet")}
                </p>
              </div>
            ) : (
              <div className='divide-y divide-slate-200'>
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => loadSessionData(session.id)}
                    className={`p-4 cursor-pointer transition hover:bg-slate-50 ${
                      selectedSession?.id === session.id
                        ? "bg-gray-50 border-l-4 border-l-gray-900"
                        : ""
                    }`}
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <h3 className='text-sm font-bold text-slate-800 truncate flex-1'>
                        {session.sessionName}
                      </h3>
                      <div
                        className='flex items-center gap-1 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition'
                        onClick={(e) => handleAIInsights(session.id, e)}
                        title={t("Get AI insights for this session")}
                      >
                        <Zap className='w-4 h-4 text-blue-500 font-bold' />
                        <p className='text-xs text-blue-600 font-bold'>
                          AI insights
                        </p>
                      </div>
                    </div>
                    {session.description && (
                      <p className='text-xs text-slate-600 mb-2 line-clamp-2'>
                        {session.description}
                      </p>
                    )}
                    <div className='text-[10px] text-slate-500 space-y-1'>
                      <div className='flex justify-between'>
                        <span>{t("Period")}:</span>
                        <span>
                          {new Date(session.startDate).toLocaleDateString()} -{" "}
                          {new Date(session.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>{t("Updated")}:</span>
                        <span>
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className='flex gap-1 mt-3'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/budget/${session.id}`);
                        }}
                        className='flex-1 px-2 py-1.5 bg-gray-50 text-gray-900 rounded hover:bg-gray-100 transition text-[10px] font-semibold flex items-center justify-center gap-1'
                      >
                        <FileSearch className='w-3 h-3' />
                        {t("Preview")}
                      </button>

                      <button
                        onClick={(e) =>
                          handleDuplicateSession(
                            session.id,
                            session.sessionName,
                            e,
                          )
                        }
                        className='px-2 py-1.5 bg-gray-50 text-gray-900 rounded hover:bg-gray-100 transition text-[10px]'
                        title={t("Duplicate")}
                      >
                        <Copy className='w-3 h-3' />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className='px-2 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-[10px]'
                        title={t("Delete")}
                      >
                        <Trash2 className='w-3 h-3' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className='flex-1 overflow-y-auto'>
          <div className='container mx-auto p-6'>
            {loadingSessionData ? (
              <div className='flex items-center justify-center h-full'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4'></div>
                  <p className='text-gray-600'>
                    {t("Loading session data...")}
                  </p>
                </div>
              </div>
            ) : !selectedSession ? (
              <div className='flex items-center justify-center h-full'>
                <div className='text-center max-w-md'>
                  <BarChart3 className='w-16 h-16 text-slate-300 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-slate-700 mb-2'>
                    {t("No Session Selected")}
                  </h3>
                  <p className='text-slate-500'>
                    {t(
                      "Select a session from the sidebar to view its details and statistics",
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {/* Session Header */}
                <div className='bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6 mb-6'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <h2 className='text-2xl font-bold text-slate-800 mb-1'>
                        {selectedSession.sessionName}
                      </h2>
                      {selectedSession.description && (
                        <p className='text-slate-600 text-sm mb-3'>
                          {selectedSession.description}
                        </p>
                      )}
                      <div className='flex gap-4 text-sm text-slate-600'>
                        <span>
                          <strong>{t("Period")}:</strong>{" "}
                          {new Date(
                            selectedSession.startDate,
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            selectedSession.endDate,
                          ).toLocaleDateString()}
                        </span>
                        <span>
                          <strong>{t("Updated")}:</strong>{" "}
                          {new Date(
                            selectedSession.updatedAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/budget/${selectedSession.id}`)}
                      className='px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition font-semibold text-sm flex items-center gap-2'
                    >
                      <Eye className='w-4 h-4' />
                      {t("Open Full View")}
                    </button>
                  </div>
                </div>

                {/* Statistics Grid */}
                {stats && (
                  <>
                    {/* Key Metrics - Top Row */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                      <div className='bg-white rounded-xl shadow-lg border-2 border-slate-200 p-5'>
                        <div className='flex items-center justify-between mb-3'>
                          <div className='p-3 bg-gray-100 rounded-lg'>
                            <Users className='w-6 h-6 text-gray-700' />
                          </div>
                        </div>
                        <h3 className='text-sm font-medium text-slate-600 mb-1'>
                          {t("Total Personnel")}
                        </h3>
                        <p className='text-2xl font-bold text-slate-800'>
                          {stats.totalPersonnel}
                        </p>
                      </div>

                      <div className='bg-white rounded-xl shadow-lg border-2 border-slate-200 p-5'>
                        <div className='flex items-center justify-between mb-3'>
                          <div className='p-3 bg-gray-100 rounded-lg'>
                            <Users className='w-6 h-6 text-gray-700' />
                          </div>
                        </div>
                        <h3 className='text-sm font-medium text-slate-600 mb-1'>
                          {t("Management Staff")}
                        </h3>
                        <p className='text-2xl font-bold text-slate-800'>
                          {stats.managementCount}
                        </p>
                      </div>

                      <div className='bg-white rounded-xl shadow-lg border-2 border-slate-200 p-5'>
                        <div className='flex items-center justify-between mb-3'>
                          <div className='p-3 bg-gray-200 rounded-lg'>
                            <Banknote className='w-6 h-6  text-gray-700' />
                          </div>
                        </div>
                        <h3 className='text-sm font-medium text-slate-600 mb-1'>
                          {t("Salary Mass (CDF)")}
                        </h3>
                        <p className='text-2xl font-bold text-slate-800'>
                          {stats.salaryMass.toLocaleString()}
                        </p>
                      </div>

                      <div className='bg-white rounded-xl shadow-lg border-2 border-slate-200 p-5'>
                        <div className='flex items-center justify-between mb-3'>
                          <div
                            className={`p-3 rounded-lg ${
                              stats.operatingMargin >= 0
                                ? "bg-gray-200"
                                : "bg-red-100"
                            }`}
                          >
                            <TrendingUp
                              className={`w-6 h-6 ${
                                stats.operatingMargin >= 0
                                  ? "text-black"
                                  : "text-red-600"
                              }`}
                            />
                          </div>
                        </div>
                        <h3 className='text-sm font-medium text-slate-600 mb-1'>
                          {t("Operating Margin")}
                        </h3>
                        <p
                          className={`text-2xl font-bold ${
                            stats.operatingMargin >= 0
                              ? "text-black"
                              : "text-red-600"
                          }`}
                        >
                          {stats.operatingMargin.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Budget Production KPIs */}
                    <div className='bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6 mb-6'>
                      <h3 className='text-lg font-bold text-slate-800 mb-4 flex items-center gap-2'>
                        <BarChart3 className='w-5 h-5 text-gray-700' />
                        {t("Budget Production Performance")}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                        <div className='p-4 bg-blue-50 rounded-lg'>
                          <p className='text-xs text-slate-600 mb-1'>
                            {t("Forecast")}
                          </p>
                          <p className='text-xl font-bold text-slate-800'>
                            {stats.productionForecast.toLocaleString()}
                          </p>
                        </div>
                        <div className='p-4 bg-green-50 rounded-lg'>
                          <p className='text-xs text-slate-600 mb-1'>
                            {t("Achievement")}
                          </p>
                          <p className='text-xl font-bold text-green-600'>
                            {stats.productionAchievement.toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`p-4 rounded-lg ${
                            stats.productionVariance >= 0
                              ? "bg-green-50"
                              : "bg-red-50"
                          }`}
                        >
                          <p className='text-xs text-slate-600 mb-1'>
                            {t("Variance")}
                          </p>
                          <p
                            className={`text-xl font-bold ${
                              stats.productionVariance >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {stats.productionVariance >= 0 ? "+" : ""}
                            {stats.productionVariance.toLocaleString()}
                          </p>
                        </div>
                        <div className='p-4 bg-purple-50 rounded-lg'>
                          <p className='text-xs text-slate-600 mb-1'>
                            {t("Performance")}
                          </p>
                          <p className='text-xl font-bold text-purple-600'>
                            {stats.productionPerformance}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Budget Charges KPIs */}
                    <div className='bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6 mb-6'>
                      <h3 className='text-lg font-bold text-slate-800 mb-4 flex items-center gap-2'>
                        <Banknote className='w-5 h-5  text-gray-700' />
                        {t("Budget Charges")}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div className='p-4 bg-blue-50 rounded-lg'>
                          <p className='text-xs text-slate-600 mb-1'>
                            {t("Forecast")}
                          </p>
                          <p className='text-xl font-bold text-slate-800'>
                            {stats.chargesForecast.toLocaleString()}
                          </p>
                        </div>
                        <div className='p-4 bg-blue-50 rounded-lg'>
                          <p className='text-xs text-slate-600 mb-1'>
                            {t("Achievement")}
                          </p>
                          <p className='text-xl font-bold text-amber-600'>
                            {stats.chargesAchievement.toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`p-4 rounded-lg ${
                            stats.chargesVariance >= 0
                              ? "bg-green-50"
                              : "bg-red-50"
                          }`}
                        >
                          <p className='text-xs text-slate-600 mb-1'>
                            {t("Savings/Overrun")}
                          </p>
                          <p
                            className={`text-xl font-bold ${
                              stats.chargesVariance >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {stats.chargesVariance >= 0 ? "+" : ""}
                            {stats.chargesVariance.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed KPI Table */}
                    <div className='bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden mb-6'>
                      <div className='px-6 py-3 bg-linear-to-r from-indigo-50 to-slate-50 border-b-2 border-slate-200'>
                        <h3 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                          <LayoutDashboard className='w-5 h-5 text-indigo-600' />
                          {t("Key Performance Indicators")}
                        </h3>
                      </div>
                      <div className='overflow-x-auto'>
                        <table className='w-full text-left border-collapse text-xs'>
                          <thead className='bg-linear-to-r from-slate-100 to-slate-50'>
                            <tr className='border-b-2 border-slate-300'>
                              <th className='px-3 py-2 font-semibold text-slate-700 w-1/3 border-r border-slate-200'>
                                {t("Dashboard_Indicator")}
                              </th>
                              <th className='px-3 py-2 font-semibold text-slate-600 w-1/3 border-r border-slate-200'>
                                {t("Dashboard_Formula")}
                              </th>
                              <th className='px-3 py-2 font-bold text-slate-800 text-right w-1/3'>
                                {t("Dashboard_Value")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className='border-b border-slate-200 hover:bg-indigo-50/30 transition-all'>
                              <td className='px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-200'>
                                {t("dashboard_lbl_total_workforce")}
                              </td>
                              <td className='px-3 py-2.5 text-slate-600 border-r border-slate-200'>
                                <div className='flex items-center gap-2'>
                                  <Calculator
                                    size={12}
                                    className='text-slate-400'
                                  />
                                  <span>{t("dashboard_fml_total_workforce")}</span>
                                </div>
                              </td>
                              <td className='px-3 py-2.5 text-right font-mono font-bold text-indigo-700'>
                                {stats.totalPersonnel.toLocaleString()}
                              </td>
                            </tr>
                            <tr className='border-b border-slate-200 hover:bg-indigo-50/30 transition-all'>
                              <td className='px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-200'>
                                {t("dashboard_lbl_va")}
                              </td>
                              <td className='px-3 py-2.5 text-slate-600 border-r border-slate-200'>
                                <div className='flex items-center gap-2'>
                                  <Calculator
                                    size={12}
                                    className='text-slate-400'
                                  />
                                  <span>
                                    {t("dashboard_fml_va")}
                                  </span>
                                </div>
                              </td>
                              <td className='px-3 py-2.5 text-right font-mono font-bold text-indigo-700'>
                                {stats.va.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                            <tr className='border-b border-slate-200 hover:bg-indigo-50/30 transition-all'>
                              <td className='px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-200'>
                                {t("dashboard_lbl_coeff")}
                              </td>
                              <td className='px-3 py-2.5 text-slate-600 border-r border-slate-200'>
                                <div className='flex items-center gap-2'>
                                  <Calculator
                                    size={12}
                                    className='text-slate-400'
                                  />
                                  <span>{t("dashboard_fml_coeff")}</span>
                                </div>
                              </td>
                              <td className='px-3 py-2.5 text-right font-mono font-bold text-indigo-700'>
                                {stats.coeffExploitation.toFixed(2)}
                              </td>
                            </tr>
                            <tr className='border-b border-slate-200 hover:bg-indigo-50/30 transition-all'>
                              <td className='px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-200'>
                                {t("dashboard_lbl_ebe")}
                              </td>
                              <td className='px-3 py-2.5 text-slate-600 border-r border-slate-200'>
                                <div className='flex items-center gap-2'>
                                  <Calculator
                                    size={12}
                                    className='text-slate-400'
                                  />
                                  <span>{t("dashboard_fml_ebe")}</span>
                                </div>
                              </td>
                              <td className='px-3 py-2.5 text-right font-mono font-bold text-indigo-700'>
                                {stats.ebe.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                            <tr className='border-b border-slate-200 hover:bg-indigo-50/30 transition-all'>
                              <td className='px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-200'>
                                {t("dashboard_lbl_re")}
                              </td>
                              <td className='px-3 py-2.5 text-slate-600 border-r border-slate-200'>
                                <div className='flex items-center gap-2'>
                                  <Calculator
                                    size={12}
                                    className='text-slate-400'
                                  />
                                  <span>{t("dashboard_fml_re")}</span>
                                </div>
                              </td>
                              <td className='px-3 py-2.5 text-right font-mono font-bold text-indigo-700'>
                                {stats.re.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                            <tr className='border-b border-slate-200 hover:bg-indigo-50/30 transition-all'>
                              <td className='px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-200'>
                                {t("dashboard_lbl_encours")}
                              </td>
                              <td className='px-3 py-2.5 text-slate-600 border-r border-slate-200'>
                                <div className='flex items-center gap-2'>
                                  <Calculator
                                    size={12}
                                    className='text-slate-400'
                                  />
                                  <span>{t("dashboard_fml_encours")}</span>
                                </div>
                              </td>
                              <td className='px-3 py-2.5 text-right font-mono font-bold text-indigo-700'>
                                {stats.encoursClients.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                            <tr className='border-b border-slate-200 hover:bg-indigo-50/30 transition-all'>
                              <td className='px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-200'>
                                {t("dashboard_lbl_recovery")}
                              </td>
                              <td className='px-3 py-2.5 text-slate-600 border-r border-slate-200'>
                                <div className='flex items-center gap-2'>
                                  <Calculator
                                    size={12}
                                    className='text-slate-400'
                                  />
                                  <span>
                                    {t("dashboard_fml_recovery")}
                                  </span>
                                </div>
                              </td>
                              <td className='px-3 py-2.5 text-right font-mono font-bold text-indigo-700'>
                                {stats.recoveryRate.toFixed(2)}%
                              </td>
                            </tr>
                            <tr className='border-b border-slate-200 hover:bg-indigo-50/30 transition-all'>
                              <td className='px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-200'>
                                {t("dashboard_lbl_productivity")}
                              </td>
                              <td className='px-3 py-2.5 text-slate-600 border-r border-slate-200'>
                                <div className='flex items-center gap-2'>
                                  <Calculator
                                    size={12}
                                    className='text-slate-400'
                                  />
                                  <span>{t("dashboard_fml_productivity")}</span>
                                </div>
                              </td>
                              <td className='px-3 py-2.5 text-right font-mono font-bold text-indigo-700'>
                                {stats.productivity.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                            <tr className='border-b border-slate-200 hover:bg-indigo-50/30 transition-all'>
                              <td className='px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-200'>
                                {t("dashboard_lbl_avg_cost")}
                              </td>
                              <td className='px-3 py-2.5 text-slate-600 border-r border-slate-200'>
                                <div className='flex items-center gap-2'>
                                  <Calculator
                                    size={12}
                                    className='text-slate-400'
                                  />
                                  <span>{t("dashboard_fml_avg_cost")}</span>
                                </div>
                              </td>
                              <td className='px-3 py-2.5 text-right font-mono font-bold text-indigo-700'>
                                {stats.avgCost.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                            <tr className='border-b border-slate-200 hover:bg-indigo-50/30 transition-all'>
                              <td className='px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-200'>
                                {t("dashboard_lbl_supervision")}
                              </td>
                              <td className='px-3 py-2.5 text-slate-600 border-r border-slate-200'>
                                <div className='flex items-center gap-2'>
                                  <Calculator
                                    size={12}
                                    className='text-slate-400'
                                  />
                                  <span>{t("dashboard_fml_supervision")}</span>
                                </div>
                              </td>
                              <td className='px-3 py-2.5 text-right font-mono font-bold text-indigo-700'>
                                {stats.supervisionRatio.toFixed(2)}
                              </td>
                            </tr>
                            <tr className='border-b border-slate-200 hover:bg-indigo-50/30 transition-all'>
                              <td className='px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-200'>
                                {t("dashboard_lbl_avg_salary")}
                              </td>
                              <td className='px-3 py-2.5 text-slate-600 border-r border-slate-200'>
                                <div className='flex items-center gap-2'>
                                  <Calculator
                                    size={12}
                                    className='text-slate-400'
                                  />
                                  <span>{t("dashboard_fml_avg_salary")}</span>
                                </div>
                              </td>
                              <td className='px-3 py-2.5 text-right font-mono font-bold text-indigo-700'>
                                {stats.avgSalary.toLocaleString("fr-FR", {
                                  style: "currency",
                                  currency: "CDF",
                                })}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className='m-4 p-4 bg-linear-to-r from-yellow-50 to-orange-50 text-slate-700 text-xs rounded-lg border-2 border-yellow-300 shadow-sm'>
                        <strong className='text-yellow-800'>{t("Dashboard_Note")}</strong> {t("Dashboard_Note_Text")}
                        {' '}{t("Dashboard_Note_Instruction")}
                      </div>
                    </div>

                    {/* Treasury Position */}
                    <div className='bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6 mb-6'>
                      <h3 className='text-lg font-bold text-slate-800 mb-4 flex items-center gap-2'>
                        <TrendingUp className='w-5 h-5 text-black' />
                        {t("Treasury Position")}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div className='p-4 bg-green-50 rounded-lg'>
                          <p className='text-xs text-slate-600 mb-1'>
                            {t("Receipts")}
                          </p>
                          <p className='text-sm text-slate-500 mb-1'>
                            {t("Forecast")}:{" "}
                            {stats.treasuryReceiptsForecast.toLocaleString()}
                          </p>
                          <p className='text-xl font-bold text-green-600'>
                            {stats.treasuryReceiptsAchievement.toLocaleString()}
                          </p>
                        </div>
                        <div className='p-4 bg-red-50 rounded-lg'>
                          <p className='text-xs text-slate-600 mb-1'>
                            {t("Disbursements")}
                          </p>
                          <p className='text-sm text-slate-500 mb-1'>
                            {t("Forecast")}:{" "}
                            {stats.treasuryDisbursementsForecast.toLocaleString()}
                          </p>
                          <p className='text-xl font-bold text-red-600'>
                            {stats.treasuryDisbursementsAchievement.toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`p-4 rounded-lg ${
                            stats.netTreasuryPosition >= 0
                              ? "bg-green-50"
                              : "bg-red-50"
                          }`}
                        >
                          <p className='text-xs text-slate-600 mb-1'>
                            {t("Net Position")}
                          </p>
                          <p
                            className={`text-2xl font-bold ${
                              stats.netTreasuryPosition >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {stats.netTreasuryPosition >= 0 ? "+" : ""}
                            {stats.netTreasuryPosition.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
