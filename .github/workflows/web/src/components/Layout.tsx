import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard, Droplets, Activity, Calendar,
  FileText, Pill, User, Users, Bell, Moon, Sun,
  ChevronLeft, Menu, LogOut, Heart, Stethoscope,
} from 'lucide-react'
import { useAuth, useTheme, useSidebar } from '../context.tsx'
import api, { IS_DEMO } from '../services/api.ts'
import Background from './Background.tsx'

interface NavItemConfig {
  to: string; label: string; Icon: React.FC<any>; badge?: number; section?: string
}

const NAV_PATIENT: NavItemConfig[] = [
  { to: '/',             label: 'Dashboard',      Icon: LayoutDashboard },
  { to: '/glucose',      label: 'Glucosa',         Icon: Droplets },
  { to: '/vitals',       label: 'Signos Vitales',  Icon: Activity,  badge: 0 },
  { to: '/appointments', label: 'Citas',           Icon: Calendar },
  { to: '/medications',  label: 'Medicamentos',    Icon: Pill },
  { to: '/record',       label: 'Expediente',      Icon: FileText },
  { to: '/alerts',       label: 'Alertas',         Icon: Bell },
  { to: '/profile',      label: 'Mi Perfil',       Icon: User },
]

const NAV_DOCTOR: NavItemConfig[] = [
  ...NAV_PATIENT,
  { to: '/patients',     label: 'Mis Pacientes',   Icon: Users,    section: 'Doctor' },
]

const NAV_ADMIN = [...NAV_DOCTOR]

function getNav(role: string) {
  if (role === 'admin')  return NAV_ADMIN
  if (role === 'doctor') return NAV_DOCTOR
  return NAV_PATIENT
}

function NavItem({ to, label, Icon, badge, collapsed }: {
  to: string; label: string; Icon: React.FC<any>; badge?: number; collapsed: boolean
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `vn-nav-item nav-item ${isActive ? 'active' : ''}`
      }
    >
      <Icon size={20} className="flex-shrink-0" aria-hidden />
      <span className="vn-nav-label flex-1 overflow-hidden whitespace-nowrap">
        {label}
      </span>
      {!!badge && (
        <span className="vn-nav-badge badge-primary text-[10px] px-1.5 py-0.5">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const { dark, toggle: toggleDark } = useTheme()
  const { open, toggle: toggleSidebar, close: closeSidebar } = useSidebar()
  const navigate = useNavigate()
  const mainRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const nav = getNav(user?.role || 'patient')

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile && open) closeSidebar()
  }, [navigate])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && open) closeSidebar()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [open, closeSidebar])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(mainRef.current ? mainRef.current.scrollTop > 20 : false)
    }
    const el = mainRef.current
    if (el) el.addEventListener('scroll', handleScroll)
    return () => el?.removeEventListener('scroll', handleScroll)
  }, [])

  async function handleLogout() {
    if (!IS_DEMO) {
      try { await api.post('/auth/logout') } catch {}
    }
    logout()
    navigate('/login')
  }

  const sidebarWidth = open ? 260 : 72

  return (
    <>
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <Background />

      {isMobile && open && (
        <div className="vn-overlay" onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* SIDEBAR — Liquid Glass */}
      <aside
        id="vn-sidebar"
        className={`
          ${open ? '' : 'collapsed'}
          fixed top-4 left-4 bottom-4 z-50
          flex flex-col
          liquid-sidebar
          rounded-3xl
          overflow-hidden
          transition-all duration-300 ease-smooth
          ${isMobile && !open ? '-translate-x-full' : 'translate-x-0'}
        `}
        aria-label="Menu principal"
      >
        {/* Header */}
        <div className={`flex items-center min-h-[72px] border-b border-white/20 dark:border-white/5 ${open ? 'gap-3 px-5' : 'justify-center px-3'}`}>
          {open ? (
            <>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-glow animate-pulse-glow ${dark ? 'bg-gradient-to-br from-asuka-red to-asuka-orange' : 'bg-gradient-to-br from-primary-500 to-secondary-500'}`}>
                <Heart size={20} className="text-white" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <span className="vn-sidebar-title font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap block font-heading text-lg">
                  Vita<span className="gradient-text">Nexo</span>
                </span>
              </div>
              <button
                onClick={toggleSidebar}
                className="w-8 h-8 flex items-center justify-center rounded-xl
                           text-slate-400 hover:text-primary-600 dark:hover:text-asuka-orange
                           hover:bg-primary-50/80 dark:hover:bg-asuka-red/10
                           flex-shrink-0 transition-all duration-200"
                aria-label="Colapsar menu"
              >
                <ChevronLeft size={18} aria-hidden />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center
                         hover:from-primary-600 hover:to-secondary-600 active:scale-95
                         transition-all duration-200 shadow-glow hover:shadow-glow-lg ${dark ? 'bg-gradient-to-br from-asuka-red to-asuka-orange' : 'bg-gradient-to-br from-primary-500 to-secondary-500'}`}
              aria-label="Expandir menu"
            >
              <Stethoscope size={20} className="text-white" aria-hidden />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto px-3" aria-label="Navegacion">
          {nav.map((item, i) => {
            const showSection = item.section && (i === 0 || !nav[i - 1].section)
            return (
              <div key={item.to}>
                {showSection && (
                  <>
                    <div className="border-t border-white/20 dark:border-white/5 mx-2 my-3" />
                    <p className="vn-section-label text-[10px] font-semibold uppercase tracking-wider
                                  text-slate-400 dark:text-slate-500 px-3 pt-1 pb-1.5
                                  whitespace-nowrap overflow-hidden transition-all duration-200">
                      {item.section}
                    </p>
                  </>
                )}
                <NavItem
                  to={item.to}
                  label={item.label}
                  Icon={item.Icon}
                  badge={item.badge}
                  collapsed={!open}
                />
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/20 dark:border-white/5 p-3 space-y-1">
          <button
            onClick={toggleDark}
            title={dark ? 'Modo claro' : 'Modo oscuro'}
            className="vn-footer-btn nav-item w-full"
            aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            {dark
              ? <Sun size={20} className="flex-shrink-0" aria-hidden />
              : <Moon size={20} className="flex-shrink-0" aria-hidden />
            }
            <span className="vn-footer-text whitespace-nowrap overflow-hidden transition-all duration-200">
              {dark ? 'Modo claro' : 'Modo oscuro'}
            </span>
          </button>

          <button
            onClick={handleLogout}
            title="Cerrar sesion"
            className="vn-footer-btn nav-item w-full text-red-500 hover:bg-red-50/80 dark:hover:bg-red-950/40 hover:text-red-600"
            aria-label="Cerrar sesion"
          >
            <LogOut size={20} className="flex-shrink-0" aria-hidden />
            <span className="vn-footer-text whitespace-nowrap overflow-hidden transition-all duration-200">
              Cerrar sesion
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN — Full width responsive */}
      <div
        className="flex flex-col flex-1 min-h-screen overflow-hidden transition-all duration-300 ease-smooth"
        style={{ marginLeft: isMobile ? 0 : `${sidebarWidth + 16}px` }}
      >
        {/* Top bar — Liquid Glass Header */}
        <header className={`liquid-header flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-3
                           rounded-2xl mx-4 mt-4 mb-2
                           transition-all duration-300 ease-smooth
                           ${scrolled ? 'shadow-liquid-lg dark:shadow-liquid-dark-lg' : 'shadow-liquid dark:shadow-liquid-dark'}`}>
          <button
            onClick={toggleSidebar}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl
                       text-slate-500 hover:bg-primary-50/80 dark:hover:bg-asuka-red/10 transition-colors duration-200"
            aria-label="Abrir menu"
          >
            <Menu size={20} aria-hidden />
          </button>

          {!isMobile && !open && <div className="w-2" />}

          <span className="flex-1" />

          <div className="flex items-center gap-2.5 liquid-glass
                          rounded-2xl px-3 py-2 transition-all duration-300 hover:shadow-liquid dark:hover:shadow-liquid-dark">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                            text-white text-xs font-bold flex-shrink-0 shadow-sm ${dark ? 'bg-gradient-to-br from-asuka-red to-asuka-orange' : 'bg-gradient-to-br from-primary-400 to-secondary-500'}`}>
              {(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.email}
              </span>
              <span className="text-[10px] text-primary-600 dark:text-asuka-orange capitalize font-medium">
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page content — Fluid container for all resolutions */}
        <main
          id="main-content"
          ref={mainRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 vn-page-enter"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </>
  )
}
