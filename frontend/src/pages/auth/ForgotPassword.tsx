import { Link } from 'react-router-dom';
import { Boxes, ArrowLeft } from 'lucide-react';

export function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl bg-primary-600 text-white shadow-lg mb-4">
            <Boxes className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Password recovery unavailable</h1>
        </div>
        <div className="card p-8">
          <p className="text-slate-600 dark:text-slate-300">
            Self-service password recovery is not yet configured. Contact your system administrator
            to regain access. No recovery email will be sent from this page.
          </p>
        </div>
        <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-primary-600 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </div>
    </div>
  );
}
