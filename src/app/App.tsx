import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/app/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/app/routes/PublicOnlyRoute';
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage, DatasetsPage } from '@/app/pages';


const ImportPage = lazy(() => import('@/app/pages/ImportPage').then((m) => ({ default: m.ImportPage })));
const DatasetDetailPage = lazy(() =>
  import('@/app/pages/DatasetDetailPage').then((m) => ({ default: m.DatasetDetailPage })),
);

function RouteFallback() {
  return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading…</div>;
}

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
          <Route path="/" element={<Navigate to="/datasets" replace />} />
          <Route
            path="/import"
            element={
              <Suspense fallback={<RouteFallback />}>
                <ImportPage />
              </Suspense>
            }
          />
          <Route path="/datasets" element={<DatasetsPage />} />
          <Route
            path="/datasets/:datasetId"
            element={
              <Suspense fallback={<RouteFallback />}>
                <DatasetDetailPage />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
