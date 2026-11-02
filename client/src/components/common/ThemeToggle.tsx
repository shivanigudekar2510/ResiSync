import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-card border border-border/80 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary/40 ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-primary rotate-0 transition-transform duration-300 hover:-rotate-12" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold capitalize">
          {theme} Mode
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
