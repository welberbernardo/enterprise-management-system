import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContextImpl';
import { AuthProvider } from './contexts/AuthContextImpl';
import { NotificationProvider } from './contexts/NotificationContextImpl';
import { getErrorMessage } from './services/api';
import './styles/tailwind.css';
import './styles/index.css';
import './styles/animations.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error));
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
