import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Boxes } from 'lucide-react';
import { NAV_SECTIONS } from './navConfig';
import { useAuth } from '../../hooks/useAuth';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import { cn } from '../../utils/helpers';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { hasPermission } = useAuth();
  const [collapsed, setCollapsed] = useLocalStorage(STORAGE_KEYS.sidebarCollapsed, false);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300',
          collapsed ? 'lg:w-20' : 'lg:w-64',
          'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center gap-2 h-16 px-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="p-2 rounded-lg bg-primary-600 text-white shrink-0">
            <Boxes className="h-6 w-6" />
          </div>
          {!collapsed && (
            <span className="font-bold text-slate-900 dark:text-white text-lg truncate">
              EMS Portal
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_SECTIONS.map((section) => {
            const items = section.items.filter(
              (item) => !item.permission || hasPermission(item.permission),
            );
            if (items.length === 0) return null;
            return (
              <div key={section.group}>
                {!collapsed && (
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {section.label}
                  </p>
                )}
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            collapsed && 'justify-center',
                            isActive
                              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                          )
                        }
                        title={collapsed ? item.label : undefined}
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                            {!collapsed && isActive && (
                              <motion.span
                                layoutId="sidebar-active"
                                className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-600"
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center gap-2 h-12 border-t border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-sm"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!collapsed && 'Collapse'}
        </button>
      </aside>
    </>
  );
}
