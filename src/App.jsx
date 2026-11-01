import { BrowserRouter, useLocation } from 'react-router-dom';
import AppProviders from '@/context/AppProviders';
import ErrorBoundary from '@/components/feedback/ErrorBoundary';
import AppRouter from '@/routes/AppRouter';

function AppContent() {
  const { pathname } = useLocation();

  return (
    <ErrorBoundary resetKey={pathname} fullScreen>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
