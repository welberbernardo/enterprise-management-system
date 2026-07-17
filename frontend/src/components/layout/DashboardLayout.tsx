import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import { cn } from '../../utils/helpers';

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed] = useLocalStorage(STORAGE_KEYS.sidebarCollapsed, false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className={cn('transition-all duration-300', collapsed ? 'lg:pl-20' : 'lg:pl-64')}>
        <Header onToggleSidebar={() => setMobileOpen((o) => !o)} />
        <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
