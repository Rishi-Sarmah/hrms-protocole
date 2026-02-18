import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Budget from './pages/Budget';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/budget"
            element={
              <RequireAuth>
                <Budget />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
