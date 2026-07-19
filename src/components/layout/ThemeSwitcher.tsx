'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Monitor, Sun, Moon, Eye } from 'lucide-react';

export const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    { name: 'system', icon: <Monitor size={16} />, label: 'System' },
    { name: 'light', icon: <Sun size={16} />, label: 'Light' },
    { name: 'dark', icon: <Moon size={16} />, label: 'Dark' },
    { name: 'protanopia', icon: <Eye size={16} className="text-sky-600" />, label: 'Protanopia' },
    { name: 'deuteranopia', icon: <Eye size={16} className="text-blue-600" />, label: 'Deuteranopia' },
    { name: 'tritanopia', icon: <Eye size={16} className="text-red-600" />, label: 'Tritanopia' },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card rounded-md shadow-lg border p-1 flex gap-1">
      {themes.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name)}
          className={`p-2 rounded-md transition-colors flex items-center justify-center ${
            theme === t.name ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          title={t.label}
          aria-label={`Switch to ${t.label} theme`}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
};
