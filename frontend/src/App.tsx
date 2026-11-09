import { Navigate, Route, Routes } from "react-router-dom";
import { useSession } from "./api/hooks.ts";
import Layout from "./components/Layout.tsx";
import SetupPage from "./pages/SetupPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import VaultPage from "./pages/VaultPage.tsx";
import DetailPage from "./pages/DetailPage.tsx";
import AddPage from "./pages/AddPage.tsx";
import EditPage from "./pages/EditPage.tsx";

// Gate for the authenticated area. Redirects to setup/login as needed.
function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = useSession();
  if (session.isLoading) {
    return (
      <div className="center-screen">
        <p className="muted">Loading…</p>
      </div>
    );
  }
  if (!session.data?.setupComplete) return <Navigate to="/setup" replace />;
  if (!session.data?.authenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<VaultPage />} />
        <Route path="/new" element={<AddPage />} />
        <Route path="/c/:id" element={<DetailPage />} />
        <Route path="/c/:id/edit" element={<EditPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
