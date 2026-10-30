import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import PageLoader from '@/components/feedback/PageLoader';
import ScrollToTop from '@/components/layout/ScrollToTop';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import SplashPage from '@/pages/SplashPage';
import { AdminRoute, GuestRoute, ProtectedRoute } from './guards';

// Code-split every page so the first paint (splash) stays tiny.
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const HomePage = lazy(() => import('@/pages/dashboard/HomePage'));
const CategoriesPage = lazy(() => import('@/pages/dashboard/CategoriesPage'));
const PetDetailsPage = lazy(() => import('@/pages/dashboard/PetDetailsPage'));
const CartPage = lazy(() => import('@/pages/dashboard/CartPage'));
const FavoritesPage = lazy(() => import('@/pages/dashboard/FavoritesPage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/ProfilePage'));
const MessagesPage = lazy(() => import('@/pages/dashboard/MessagesPage'));
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage'));
const HelpPage = lazy(() => import('@/pages/dashboard/HelpPage'));
const AdminPage = lazy(() => import('@/pages/dashboard/AdminPage'));
const OrdersPage = lazy(() => import('@/pages/dashboard/OrdersPage'));
const SellerPage = lazy(() => import('@/pages/dashboard/SellerPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<SplashPage />} />

          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            </Route>
          </Route>

          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<HomePage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="pets/:petId" element={<PetDetailsPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="messages/:conversationId" element={<MessagesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="help" element={<HelpPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="sellers/:sellerId" element={<SellerPage />} />
              <Route element={<AdminRoute />}>
                <Route path="admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
