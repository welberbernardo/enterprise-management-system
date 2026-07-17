import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Moon, Search, Sun, UserCircle, LogOut, Settings } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: '1', text: 'New order #ORD-1042 received', time: '2m ago' },
    { id: '2', text: 'Invoice INV-333 is overdue', time: '1h ago' },
    { id: '3', text: 'Low stock: Product SKU-992', time: '3h ago' },
  ];

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 h-16 px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden md:block flex-1 max-w-md">
        <Input placeholder="Search anything..." leftIcon={<Search className="h-4 w-4" />} />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg animate-scale-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <span className="font-semibold text-slate-900 dark:text-white">Notifications</span>
                <Badge variant="danger" dot>
                  {notifications.length}
                </Badge>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <p className="text-sm text-slate-700 dark:text-slate-200">{n.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Dropdown
          trigger={
            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <Avatar name={user?.fullName ?? 'User'} src={user?.avatar} size="sm" />
              <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200">
                {user?.fullName}
              </span>
            </button>
          }
          items={[
            { label: 'Profile', icon: <UserCircle className="h-4 w-4" />, onClick: () => navigate('/profile') },
            { label: 'Settings', icon: <Settings className="h-4 w-4" />, onClick: () => navigate('/settings') },
            {
              label: 'Logout',
              icon: <LogOut className="h-4 w-4" />,
              danger: true,
              onClick: () => {
                logout();
                notify.success('Logged out successfully');
                navigate('/login');
              },
            },
          ]}
        />
      </div>
    </header>
  );
}
