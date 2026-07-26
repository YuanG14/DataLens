import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/app/routes/PublicOnlyRoute';
import {
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  DashboardPage,
  ImportPage,
} from '@/app/pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Logged-in users get redirected away from these three. */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Not public-only: a valid recovery link legitimately creates a
            session, and PublicOnlyRoute would incorrectly bounce that user
            away before they can set a new password. */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Logged-out users get redirected to /login. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/import" element={<ImportPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
