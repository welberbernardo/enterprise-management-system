import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';
import { useTheme } from '../../hooks/useTheme';
import { Boxes, Moon, Sun } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [logo] = useState<string>('/logo.svg');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-slate-800 shadow text-slate-600 dark:text-slate-300"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl bg-primary-600 text-white shadow-lg mb-4">
            <img src={logo} alt="Logo" className="h-10 w-10" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <Boxes className="h-10 w-10 hidden" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Enterprise Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your account</p>
        </div>

        <div className="card p-8 animate-slide-up">
          <LoginForm onSuccess={() => navigate('/dashboard')} />
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}
