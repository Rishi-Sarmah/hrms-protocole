import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Report {
  id: string;
  filename: string;
  createdAt: string;
  indicators: any;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await axios.get('http://localhost:3000/api/reports', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setReports(response.data);
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="p-4 bg-white shadow border-b border-gray-200">
        <div className="flex items-center justify-between container mx-auto">
          <h1 className="text-xl font-bold text-blue-600">Protocole Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-sm font-medium">{user?.displayName}</span>
                <span className="text-xs text-gray-500">{user?.email}</span>
            </div>
            {user?.photoURL && (
                <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-gray-300" />
            )}
            <button
              onClick={() => logout()}
              className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100 border border-red-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 mt-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Your Reports</h2>
            {/* Add create button here if needed */}
        </div>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
            <div className="p-4 text-red-700 bg-red-100 border border-red-200 rounded">
                {error}
            </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center bg-white rounded shadow-sm border border-gray-200">
            <p className="text-gray-500">No reports found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <div key={report.id} className="p-5 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold truncate pr-2" title={report.filename}>{report.filename}</h3>
                </div>
                <p className="text-xs text-gray-400 mb-4">{new Date(report.createdAt).toLocaleString()}</p>
                <div className="mt-2">
                  <pre className="p-3 text-xs bg-gray-50 rounded border border-gray-100 overflow-auto max-h-40">
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
