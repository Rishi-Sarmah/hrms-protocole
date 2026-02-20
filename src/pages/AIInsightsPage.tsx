import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import LanguageSelector from "../components/LanguageSelector";
import { getSession, updateSession } from "../services/sessionService";
import { analyzeReport } from "../services/aiservice";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Zap,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mermaid } from "../components/Mermaid";
import type { Session } from "../types/session";

export default function AIInsightsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId && user?.uid) {
      loadSession(sessionId);
    }
  }, [sessionId, user]);

  const loadSession = async (id: string) => {
    try {
      setLoading(true);
      const sessionData = await getSession(id);
      
      if (!sessionData) {
        setError(t("Session not found"));
        return;
      }
      
      if (sessionData.userId !== user?.uid) {
        setError(t("Access denied"));
        return;
      }

      setSession(sessionData);

      // Check for cached analysis
      if (sessionData.aiAnalysis) {
        setAiAnalysis(sessionData.aiAnalysis);
      } else {
        // No cache, generate automatically
        generateInsights(sessionData);
      }
    } catch (err) {
      console.error("Error loading session:", err);
      setError(t("Failed to load session data"));
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async (currentSession: Session, forceRefresh = false) => {
    if (aiLoading) return;

    try {
      setAiLoading(true);
      setAiError(null);
      
      // If forcing refresh, clear current analysis
      if (forceRefresh) {
        setAiAnalysis(null);
      }

      const currentLanguage = i18n.language || "en";
      const analysis = await analyzeReport(currentSession, currentLanguage);
      
      setAiAnalysis(analysis);

      // Cache the result
      await updateSession(currentSession.id, {
        aiAnalysis: analysis,
        aiAnalysisLanguage: currentLanguage,
      });

      // Update local session state to reflect the change
      setSession((prev) => 
        prev ? { ...prev, aiAnalysis: analysis, aiAnalysisLanguage: currentLanguage } : null
      );

    } catch (err) {
      console.error("Error generating AI insights:", err);
      setAiError(t("Failed to generate AI insights. Please try again."));
    } finally {
      setAiLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (session) {
      generateInsights(session, true);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">{t("Error")}</h2>
        <p className="text-gray-600 mb-6">{error || t("Session not found")}</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {t("Back to Dashboard")}
        </button>
      </div>
    );
  }

  return (
    <div className='h-screen bg-gray-50 text-gray-900 flex flex-col'>
      {/* Header */}
      <nav className='p-4 bg-white shadow-lg border-b-2 border-slate-200 shrink-0'>
        <div className='flex items-center justify-between container mx-auto'>
          <button
            onClick={() => navigate("/")}
            className='px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition border border-gray-300 flex items-center gap-1'
          >
            <ArrowLeft className='w-4 h-4' />
            {t("Back to Dashboard")}
          </button>
          
          <div className='flex items-center gap-3'>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className='text-lg font-bold text-gray-900'>
              {t("AI Insights")}: <span className="font-normal text-slate-600">{session.sessionName}</span>
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
      <div className='flex-1 overflow-y-auto p-6'>
        <div className='max-w-5xl mx-auto'>
          
          {/* Controls & Status */}
          <div className="flex justify-end mb-4">
             <button
                onClick={handleRegenerate}
                disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <RefreshCw className={`w-4 h-4 ${aiLoading ? "animate-spin" : ""}`} />
                {aiLoading ? t("Analyzing...") : t("Regenerate Analysis")}
             </button>
          </div>

          {/* AI Analysis Content */}
          <div className='bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden min-h-[500px]'>
            <div className='px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b-2 border-slate-200 flex justify-between items-center'>
              <h3 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                <BarChart3 className='w-5 h-5 text-indigo-600' />
                {t("Executive Summary & Analysis")}
              </h3>
              {session.aiAnalysisLanguage && (
                 <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    {session.aiAnalysisLanguage === 'fr' ? 'Français' : 'English'}
                 </span>
              )}
            </div>

            <div className='p-8'>
              {aiLoading && !aiAnalysis && (
                <div className='flex flex-col items-center justify-center py-20'>
                  <Loader2 className='w-12 h-12 text-blue-500 animate-spin mb-4' />
                  <p className='text-slate-600 text-lg font-medium'>
                    {t("Analyzing your session data")}
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
                  <button 
                    onClick={() => generateInsights(session, true)}
                    className="mt-4 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition text-sm"
                  >
                    {t("Try Again")}
                  </button>
                </div>
              )}

              {aiAnalysis && (
                <div className={`prose prose-slate max-w-none ${aiLoading ? 'opacity-50' : ''}`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        if (match && match[1] === "mermaid") {
                          return (
                            <Mermaid
                              chart={String(children).replace(/\n$/, "")}
                            />
                          );
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
                  <button
                    onClick={() => generateInsights(session)}
                    className="mt-4 text-blue-600 hover:underline"
                  >
                    {t("Generate Analysis")}
                  </button>
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
                    "This analysis is generated by AI based on your session data Use it as a supplementary tool for decision-making",
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
