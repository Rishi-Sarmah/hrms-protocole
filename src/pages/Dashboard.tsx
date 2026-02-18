import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import LanguageSelector from "../components/LanguageSelector";

interface Report {
  id: string;
  filename: string;
  createdAt: string;
  indicators: unknown;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await axios.get(
            "http://localhost:3000/api/reports",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setReports(response.data || []);
          setError(null);
        } catch (err) {
          console.error("Error fetching reports", err);
          setError("Failed to fetch reports. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReports();
  }, [user]);

  return (
    <div className='min-h-screen bg-gray-50 text-gray-900'>
      <nav className='p-4 bg-white rounded-xl shadow-lg border-2 border-slate-200'>
        <div className='flex items-center justify-between container mx-auto'>
          <div className='flex items-center gap-6'>
            <h1 className='text-lg font-bold text-blue-600'>
              {t("Protocole Dashboard")}
            </h1>
            <button
              onClick={() => navigate("/budget")}
              className='px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded transition'
            >
              {t("Budget Management")}
            </button>
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

      <main className='container mx-auto p-4 mt-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>{t("Your Reports")}</h2>
        </div>

        {loading ? (
          <div className='flex justify-center p-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        ) : error ? (
          <div className='p-3 text-red-700 bg-red-100 border border-red-200 rounded text-xs'>
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div className='p-6 text-center bg-white rounded shadow-sm border border-gray-200 text-xs'>
            <p className='text-gray-500'>{t("No reports found.")}</p>
          </div>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {reports.map((report) => (
              <div
                key={report.id}
                className='p-4 bg-white rounded-xl shadow-lg border-2 border-slate-200 hover:shadow-xl transition text-xs'
              >
                <div className='flex justify-between items-start mb-2'>
                  <h3
                    className='text-sm font-bold truncate pr-2'
                    title={report.filename}
                  >
                    {report.filename}
                  </h3>
                </div>
                <p className='text-[11px] text-gray-400 mb-3'>
                  {new Date(report.createdAt).toLocaleString()}
                </p>
                <div className='mt-2'>
                  <pre className='p-2 text-[11px] bg-gray-50 rounded border border-gray-100 overflow-auto max-h-40'>
                    {JSON.stringify(report.indicators, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
