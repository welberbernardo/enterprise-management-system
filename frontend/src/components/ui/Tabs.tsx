import { cn } from '../../utils/helpers';
import type { ReactNode } from 'react';

interface TabsProps {
  tabs: { id: string; label: string; icon?: ReactNode; badge?: ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('border-b border-slate-200 dark:border-slate-700', className)}>
      <nav className="flex gap-1 overflow-x-auto -mb-px" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge}
          </button>
        ))}
      </nav>
    </div>
  );
}

interface TabPanelProps {
  active: boolean;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ active, children, className }: TabPanelProps) {
  if (!active) return null;
  return <div className={cn('py-4 animate-fade-in', className)}>{children}</div>;
}
