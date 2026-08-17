import { FitMeToasterProvider } from '@/components/ui/FitMeToaster';
import { SeasonProvider } from '@/lib/SeasonContext.jsx';
import { LanguageProvider } from '@/lib/i18n.jsx';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppShell from '@/components/layout/AppShell';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import Wardrobe from '@/pages/Wardrobe';
import LookGenerator from '@/pages/LookGenerator';
import Market from '@/pages/Market';
import Sell from '@/pages/Sell';
import CalendarPage from '@/pages/CalendarPage';
import Profile from '@/pages/Profile';

const FullScreenLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated, authError } = useAuth();

  if (isLoadingAuth) return <FullScreenLoader />;

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      {isAuthenticated ? (
        <>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/wardrobe" element={<Wardrobe />} />
            <Route path="/look" element={<LookGenerator />} />
            <Route path="/lookgenerator" element={<LookGenerator />} />
            <Route path="/market" element={<Market />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/calendarpage" element={<CalendarPage />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <SeasonProvider>
        <LanguageProvider>
        <FitMeToasterProvider>
            <Router>
              <AuthenticatedApp />
            </Router>
          </FitMeToasterProvider>
          </LanguageProvider>
          </SeasonProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App