import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { AuthPage } from './pages/AuthPage';
import { TasksPage } from './pages/TasksPage';
import { ProfilePage } from './pages/ProfilePage';
import { useBackground } from './hooks/useBackground';

function AppLayout() {
  useBackground();

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="flex-1 md:ml-60">
        <Routes>
          <Route path="/my-tasks" element={
            <TasksPage
              visibility="personal"
              title="Мои задачи"
              subtitle="Личные задачи, видны только тебе"
            />
          } />
          <Route path="/shared-tasks" element={
            <TasksPage
              visibility="shared"
              title="Общие задачи"
              subtitle="Задачи для вас обоих"
            />
          } />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/my-tasks" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/my-tasks" replace /> : <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
          <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
