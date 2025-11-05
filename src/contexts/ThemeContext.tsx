import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'neon' | 'midnight'

interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('app-theme') as ThemeMode
    if (saved && ['light', 'dark', 'neon', 'midnight'].includes(saved)) {
      return saved
    }
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'neon', 'midnight')
    
    // Add current theme class
    root.classList.add(theme)
    
    // Save to localStorage
    localStorage.setItem('app-theme', theme)
    
    // Apply theme-specific CSS variables
    applyThemeVariables(theme)
  }, [theme])

  const applyThemeVariables = (currentTheme: ThemeMode) => {
    const root = document.documentElement
    
    switch (currentTheme) {
      case 'light':
        root.style.setProperty('--primary', '59 130 246') // blue-500
        root.style.setProperty('--background', '255 255 255')
        root.style.setProperty('--foreground', '15 23 42') // slate-900
        root.style.setProperty('--card', '249 250 251') // gray-50
        root.style.setProperty('--accent', '139 92 246') // violet-500
        break
      case 'dark':
        root.style.setProperty('--primary', '96 165 250') // blue-400
        root.style.setProperty('--background', '15 23 42') // slate-900
        root.style.setProperty('--foreground', '248 250 252') // slate-50
        root.style.setProperty('--card', '30 41 59') // slate-800
        root.style.setProperty('--accent', '167 139 250') // violet-400
        break
      case 'neon':
        root.style.setProperty('--primary', '34 211 238') // cyan-500
        root.style.setProperty('--background', '10 10 20')
        root.style.setProperty('--foreground', '255 255 255')
        root.style.setProperty('--card', '20 20 40')
        root.style.setProperty('--accent', '249 115 22') // orange-500
        break
      case 'midnight':
        root.style.setProperty('--primary', '147 51 234') // purple-600
        root.style.setProperty('--background', '0 0 0')
        root.style.setProperty('--foreground', '229 231 235') // gray-200
        root.style.setProperty('--card', '17 24 39') // gray-900
        root.style.setProperty('--accent', '236 72 153') // pink-500
        break
    }
  }

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    const themes: ThemeMode[] = ['light', 'dark', 'neon', 'midnight']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
