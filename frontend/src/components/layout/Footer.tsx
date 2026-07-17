import { APP_NAME } from '../../utils/constants';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-sm text-slate-500 dark:text-slate-400">
      Â© {year} {APP_NAME}. All rights reserved.
    </footer>
  );
}
