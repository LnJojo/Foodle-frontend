import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import "./App.css";
import GroupDetailPage from "./pages/GroupDetailPage";
import { AuthProvider } from "@/contexts/AuthContext";
import CompetitionDetailPage from "./pages/CompetitionDetailPage";
import GroupInvitationPage from "./pages/GroupInvitationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import CheckEmailPage from "./pages/CheckEmailPage";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "sonner";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email/:key" element={<VerifyEmailPage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />

          {/* Route d'invitation - disponible publiquement mais redirige vers login si nécessaire */}
          <Route
            path="/invite/:invitationId"
            element={<GroupInvitationPage />}
          />

          {/* Routes privées qui nécessitent une authentification */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/groups/:id"
            element={
              <PrivateRoute>
                <GroupDetailPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/competitions/:id"
            element={
              <PrivateRoute>
                <CompetitionDetailPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
