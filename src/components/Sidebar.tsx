import { NavLink, useNavigate } from 'react-router-dom';
import { CheckSquare, Users, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './Avatar';

const navItems = [
  { to: '/my-tasks',     icon: CheckSquare, label: 'Мои задачи' },
  { to: '/shared-tasks', icon: Users,       label: 'Общие задачи' },
  { to: '/profile',      icon: User,        label: 'Профиль' },
];

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen glass-strong border-r border-border fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="font-display text-xl text-text-primary tracking-tight">TaskPlanner</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent/15 text-accent border border-accent/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-border">
          <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all duration-200 group">
            <Avatar profile={profile} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{profile?.username || 'User'}</p>
              <p className="text-xs text-text-muted truncate">Профиль</p>
            </div>
          </NavLink>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg text-sm text-text-muted hover:text-urgency-critical hover:bg-urgency-critical/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border px-2 py-2 flex items-center justify-around">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                isActive ? 'text-accent' : 'text-text-muted'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-xs text-text-muted"
        >
          <LogOut className="w-5 h-5" />
          <span>Выйти</span>
        </button>
      </nav>
    </>
  );
}
