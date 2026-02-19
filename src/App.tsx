import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SessionProvider } from "./contexts/SessionContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Budget from "./pages/Budget";
import RequireAuth from "./components/RequireAuth";

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
        </SessionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
