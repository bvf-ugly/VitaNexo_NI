import { createContext, useContext, useEffect, useState, useCallback } from 'react'

/* ── Types ─────────────────────────────────────────── */
interface AuthCtx {
  token: string | null
  user:  any | null
  login:  (token: string, refresh: string, user: any) => void
  logout: () => void
}

interface ThemeCtx {
  dark: boolean
  toggle: () => void
}

interface SidebarCtx {
  open: boolean
  toggle: () => void
  close: () => void
}

/* ── Auth ───────────────────────────────────────────── */
const AuthContext = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem('vn_token'))
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('vn_user') || 'null') } catch { return null }
  })

  const login = useCallback((t: string, r: string, u: any) => {
    localStorage.setItem('vn_token',   t)
    localStorage.setItem('vn_refresh', r)
    localStorage.setItem('vn_user',    JSON.stringify(u))
    setToken(t); setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('vn_token')
    localStorage.removeItem('vn_refresh')
    localStorage.removeItem('vn_user')
    setToken(null); setUser(null)
  }, [])

  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

/* ── Theme ──────────────────────────────────────────── */
const ThemeContext = createContext<ThemeCtx>({} as ThemeCtx)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => localStorage.getItem('vn_dark') === 'true')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    localStorage.setItem('vn_dark', String(dark))
  }, [dark])

  const toggle = useCallback(() => setDark(d => !d), [])

  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)

/* ── Sidebar ────────────────────────────────────────── */
const SidebarContext = createContext<SidebarCtx>({} as SidebarCtx)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const getDefault = () => {
    if (window.innerWidth < 1024) return false
    const stored = localStorage.getItem('vn_sidebar_open')
    if (stored !== null) return stored === 'true'
    return true
  }
  const [open, setOpen] = useState(getDefault)

  const toggle = useCallback(() => {
    setOpen(v => {
      const next = !v
      localStorage.setItem('vn_sidebar_open', String(next))
      return next
    })
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    localStorage.setItem('vn_sidebar_open', 'false')
  }, [])

  return <SidebarContext.Provider value={{ open, toggle, close }}>{children}</SidebarContext.Provider>
}

export const useSidebar = () => useContext(SidebarContext)
