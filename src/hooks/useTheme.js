import { useState, useEffect } from 'react';

const STORAGE_KEY = 'spamlens-theme';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem(STORAGE_KEY) || 'dark';
    return 'dark';
  });

  // Controls the spin animation on the icon
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setIsSpinning(true);
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    setTimeout(() => setIsSpinning(false), 400); // Reset after CSS animation ends
  };

  const iconClass = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';

  return { theme, toggleTheme, iconClass, isSpinning };
}