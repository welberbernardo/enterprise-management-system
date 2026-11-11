import { Link } from 'react-router-dom';
import { Boxes, ArrowLeft } from 'lucide-react';

export function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl bg-primary-600 text-white shadow-lg mb-4">
            <Boxes className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Password reset unavailable</h1>
        </div>
        <div className="card p-8">
          <p className="text-slate-600 dark:text-slate-300">
            Password reset links are not supported yet. Contact your system administrator.
            For security, this page does not accept or process reset tokens.
          </p>
        </div>
        <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-primary-600 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </div>
    </div>
  );
}
