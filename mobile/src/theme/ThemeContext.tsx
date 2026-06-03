import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { lightColors, darkColors, ThemeColors } from './colors'

const THEME_KEY = '@vitanexo_theme'

interface ThemeContextType {
  isDark: boolean
  colors: ThemeColors
  toggle: () => void
}

const defaultCtx = { isDark: false, colors: lightColors, toggle: () => {} }
const ThemeContext = createContext<ThemeContextType>(defaultCtx)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme()
  const [isDark, setIsDark] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((v) => {
        if (v === 'dark') setIsDark(true)
        else if (v === 'light') setIsDark(false)
        else setIsDark(system === 'dark')
      })
      .catch(() => setIsDark(system === 'dark'))
      .finally(() => setReady(true))
  }, [system])

  function toggle() {
    setIsDark((prev) => {
      AsyncStorage.setItem(THEME_KEY, prev ? 'light' : 'dark').catch(() => {})
      return !prev
    })
  }

  if (!ready) {
    return (
      <ThemeContext.Provider value={{ isDark: false, colors: lightColors, toggle }}>
        {children}
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
