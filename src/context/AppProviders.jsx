import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { ChatProvider } from './ChatContext';
import { FavoritesProvider } from './FavoritesContext';
import { NotificationProvider } from './NotificationContext';
import { SocketProvider } from './SocketContext';
import { ThemeProvider } from './ThemeContext';
import { ToastProvider } from './ToastContext';

/** Single place to compose global providers — add new ones here. */
export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <ChatProvider>
                <FavoritesProvider>
                  <CartProvider>{children}</CartProvider>
                </FavoritesProvider>
              </ChatProvider>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
