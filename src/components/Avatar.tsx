import { User } from 'lucide-react';
import type { Profile } from '../types';

interface AvatarProps {
  profile?: Pick<Profile, 'username' | 'avatar_url'> | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

function getColor(username: string) {
  const colors = [
    'from-amber-500 to-orange-600',
    'from-violet-500 to-purple-600',
    'from-teal-500 to-cyan-600',
    'from-rose-500 to-pink-600',
    'from-emerald-500 to-green-600',
    'from-blue-500 to-indigo-600',
  ];
  const idx = username.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function Avatar({ profile, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = sizes[size];

  if (!profile) {
    return (
      <div className={`${sizeClass} rounded-full bg-bg-hover flex items-center justify-center ${className}`}>
        <User className="w-1/2 h-1/2 text-text-muted" />
      </div>
    );
  }

  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.username}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-border ${className}`}
      />
    );
  }

  const color = getColor(profile.username);
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-display font-medium text-white ring-2 ring-border ${className}`}>
      {getInitials(profile.username)}
    </div>
  );
}
