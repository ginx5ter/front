import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useBackground() {
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const bgUrl = isMobile ? profile.bg_mobile_url : profile.bg_desktop_url;

    const root = document.documentElement;
    if (bgUrl) {
      root.style.setProperty('--user-bg', `url(${bgUrl})`);
      root.style.setProperty('--user-bg-active', '1');
    } else {
      root.style.removeProperty('--user-bg');
      root.style.setProperty('--user-bg-active', '0');
    }

    return () => {
      root.style.removeProperty('--user-bg');
      root.style.removeProperty('--user-bg-active');
    };
  }, [profile?.bg_desktop_url, profile?.bg_mobile_url]);
}
