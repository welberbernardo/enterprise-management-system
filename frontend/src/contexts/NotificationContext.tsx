import { createContext } from 'react';
import type { ToastOptions } from 'react-hot-toast';

export interface NotificationContextType {
  success: (message: string, opts?: ToastOptions) => void;
  error: (message: string, opts?: ToastOptions) => void;
  info: (message: string, opts?: ToastOptions) => void;
  warning: (message: string, opts?: ToastOptions) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
