import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 text-center">
      <p className="text-8xl font-bold text-primary-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h1>
      <p className="mt-2 text-slate-500">The page you are looking for does not exist.</p>
      <div className="mt-6 flex gap-3">
        <Button leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => window.history.back()}>Go Back</Button>
        <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 text-white px-4 py-2 text-sm font-medium hover:bg-primary-700">
          <Home className="h-4 w-4" /> Dashboard
        </Link>
      </div>
    </div>
  );
}
