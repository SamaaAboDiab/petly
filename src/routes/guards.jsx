import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/** Only signed-in users; remembers where they were heading. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Only guests (login / register). After signing in, sends users back where they were heading. */
export function GuestRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (isAuthenticated) return <Navigate to={location.state?.from ?? '/app'} replace />;
  return <Outlet />;
}

/** Only admins; everyone else is sent home. Nest inside ProtectedRoute. */
export function AdminRoute() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/app" replace />;
  return <Outlet />;
}
