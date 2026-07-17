import { Link } from 'react-router-dom';
import { ServerCrash, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ServerError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 text-center">
      <div className="p-4 rounded-full bg-danger-100 text-danger-600 dark:bg-danger-900/30 mb-4">
        <ServerCrash className="h-12 w-12" />
      </div>
      <p className="text-6xl font-bold text-danger-600">500</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Internal Server Error</h1>
      <p className="mt-2 text-slate-500 max-w-md">Something went wrong on our end. Please try again later.</p>
      <div className="mt-6 flex gap-3">
        <Button leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => window.location.reload()}>Retry</Button>
        <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 text-white px-4 py-2 text-sm font-medium hover:bg-primary-700">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
