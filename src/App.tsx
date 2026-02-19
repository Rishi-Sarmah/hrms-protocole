import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SessionProvider } from "./contexts/SessionContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Budget from "./pages/Budget";
import RequireAuth from "./components/RequireAuth";
import ChatPanel from "./components/ChatPanel";

/** Renders the ChatPanel only when the user is authenticated */
function AuthenticatedChatPanel() {
  const { user } = useAuth();
  if (!user) return null;
  return <ChatPanel />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SessionProvider>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route
              path='/'
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path='/budget'
              element={
                <RequireAuth>
                  <Budget />
                </RequireAuth>
              }
            />
            <Route
              path='/budget/:sessionId'
              element={
                <RequireAuth>
                  <Budget />
                </RequireAuth>
              }
            />
          </Routes>
          {/* Floating chat panel — visible on all authenticated pages */}
          <AuthenticatedChatPanel />
        </SessionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
