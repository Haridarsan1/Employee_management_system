import React from 'react'
import { useTheme, ThemeMode } from '@/contexts/ThemeContext'
import { Sun, Moon, Zap, Sparkles } from 'lucide-react'

interface ThemeSelectorProps {
  className?: string
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme()

  const themes: { mode: ThemeMode; icon: React.ReactNode; label: string; gradient: string }[] = [
    {
      mode: 'light',
      icon: <Sun className="w-5 h-5" />,
      label: 'Light',
      gradient: 'from-yellow-400 to-orange-400'
    },
    {
      mode: 'dark',
      icon: <Moon className="w-5 h-5" />,
      label: 'Dark',
      gradient: 'from-slate-600 to-slate-800'
    },
    {
      mode: 'neon',
      icon: <Zap className="w-5 h-5" />,
      label: 'Neon',
      gradient: 'from-cyan-500 to-purple-600'
    },
    {
      mode: 'midnight',
      icon: <Sparkles className="w-5 h-5" />,
      label: 'Midnight',
      gradient: 'from-purple-600 to-pink-600'
    }
  ]

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {themes.map(({ mode, icon, label, gradient }) => (
        <button
          key={mode}
          onClick={() => setTheme(mode)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            transition-all duration-300 transform hover:scale-105
            ${theme === mode 
              ? `bg-gradient-to-r ${gradient} text-white shadow-lg` 
              : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
            }
          `}
          aria-label={`Switch to ${label} theme`}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}

export const ThemeToggleButton: React.FC = () => {
  const { toggleTheme, theme } = useTheme()

  const getIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-5 h-5" />
      case 'dark': return <Moon className="w-5 h-5" />
      case 'neon': return <Zap className="w-5 h-5" />
      case 'midnight': return <Sparkles className="w-5 h-5" />
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-all duration-300"
      aria-label="Toggle theme"
    >
      {getIcon()}
    </button>
  )
}
