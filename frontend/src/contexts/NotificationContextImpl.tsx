import { useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { NotificationContext } from './NotificationContext';
import type { NotificationContextType } from './NotificationContext';
import { useTheme } from '../hooks/useTheme';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { theme } = useTheme();

  const value = useMemo<NotificationContextType>(
    () => ({
      success: (message, opts) => toast.success(message, opts),
      error: (message, opts) => toast.error(message, opts),
      info: (message, opts) => toast(message, opts),
      warning: (message, opts) => toast(message, { ...opts, icon: 'âš ï¸' }),
    }),
    [],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#1e293b' : '#ffffff',
            color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
            border: '1px solid ' + (theme === 'dark' ? '#334155' : '#e2e8f0'),
          },
        }}
      />
    </NotificationContext.Provider>
  );
}
