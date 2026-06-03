import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import {
  LayoutDashboard, Droplets, Activity, Calendar,
  FileText, Pill, User, Users, Bell, Moon, Sun,
  ChevronLeft, ChevronRight, Menu, X, LogOut,
} from 'lucide-react'
import { useAuth, useTheme, useSidebar } from '../context.tsx'
import api from '../services/api.ts'

/* ── Types ──────────────────────────────────────────── */
interface NavItemConfig {
  to: string; label: string; Icon: React.FC<any>; badge?: number; section?: string
}

/* ── Nav config ─────────────────────────────────────── */
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

const NAV_ADMIN = [
  ...NAV_DOCTOR,
]

function getNav(role: string) {
  if (role === 'admin')  return NAV_ADMIN
  if (role === 'doctor') return NAV_DOCTOR
  return NAV_PATIENT
}

/* ── NavItem ────────────────────────────────────────── */
function NavItem({ to, label, Icon, badge, collapsed }: {
  to: string; label: string; Icon: React.FC<any>
  badge?: number; collapsed: boolean
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `vn-nav-item flex items-center gap-3 px-4 py-2.5 rounded-r-lg text-sm font-medium
         transition-colors duration-150 cursor-pointer select-none
         ${isActive
           ? 'active bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
           : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
         }`
      }
    >
      <Icon size={18} className="flex-shrink-0" aria-hidden />
      <span className="vn-nav-label flex-1 overflow-hidden whitespace-nowrap transition-all duration-200">
        {label}
      </span>
      {!!badge && (
        <span className="vn-nav-badge text-[10px] font-semibold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

/* ── Layout ─────────────────────────────────────────── */
export default function Layout() {
  const { user, logout } = useAuth()
  const { dark, toggle: toggleDark } = useTheme()
  const { open, toggle: toggleSidebar, close: closeSidebar } = useSidebar()
  const navigate = useNavigate()
  const overlayRef = useRef<HTMLDivElement>(null)

  const nav = getNav(user?.role || 'patient')

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && open) closeSidebar()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [open, closeSidebar])

  async function handleLogout() {
    try { await api.post('/auth/logout') } catch {}
    logout()
    navigate('/login')
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">

      {/* Mobile overlay backdrop */}
      {isMobile && open && (
        <div
          id="vn-overlay"
          className="show"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ───────────────────────────────── */}
      <aside
        id="vn-sidebar"
        className={`
          ${open ? '' : 'collapsed'}
          flex-shrink-0 flex flex-col
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-700
          overflow-hidden z-50
          md:relative fixed inset-y-0 left-0
          ${!open && isMobile ? '-translate-x-full md:translate-x-0' : ''}
        `}
        style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.06)' }}
        aria-label="Menú principal"
      >
        {/* Header */}
        <div className={`flex items-center min-h-[56px] border-b border-slate-100 dark:border-slate-800 ${open ? 'gap-2.5 px-4' : 'justify-center'}`}>
          {open ? (
            <>
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center flex-shrink-0">
                <Activity size={16} className="text-white" aria-hidden />
              </div>
              <span className="vn-sidebar-title font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap overflow-hidden transition-all duration-200">
                <span className="text-sky-500">Vita</span>Nexo
              </span>
              <button
                onClick={toggleSidebar}
                className="ml-auto w-7 h-7 flex items-center justify-center rounded-md
                           border border-slate-200 dark:border-slate-700 text-slate-400
                           hover:bg-slate-50 dark:hover:bg-slate-800 flex-shrink-0 transition-colors"
                aria-label="Colapsar menú"
              >
                <ChevronLeft size={14} aria-hidden />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center
                         hover:opacity-80 active:opacity-70 transition-opacity"
              aria-label="Expandir menú"
            >
              <Activity size={16} className="text-white" aria-hidden />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto vn-scroll pr-1" aria-label="Navegación">
          {/* Detect doctor section break */}
          {nav.map((item, i) => {
            const showSection = item.section && (i === 0 || !nav[i - 1].section)
            return (
              <div key={item.to}>
                {showSection && (
                  <>
                    <div className="border-t border-slate-100 dark:border-slate-800 mx-3 my-1.5" />
                    <p className="vn-section-label text-[10px] font-semibold uppercase tracking-wider
                                  text-slate-400 dark:text-slate-600 px-4 pt-1 pb-0.5
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

        {/* Footer: dark mode + logout */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-2 space-y-1">
          <button
            onClick={toggleDark}
            title={dark ? 'Modo claro' : 'Modo oscuro'}
            className="vn-footer-btn w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm
                       text-slate-600 dark:text-slate-400
                       hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            {dark
              ? <Sun size={18} className="flex-shrink-0" aria-hidden />
              : <Moon size={18} className="flex-shrink-0" aria-hidden />
            }
            <span className="vn-footer-text whitespace-nowrap overflow-hidden transition-all duration-200">
              {dark ? 'Modo claro' : 'Modo oscuro'}
            </span>
          </button>

          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="vn-footer-btn w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm
                       text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} className="flex-shrink-0" aria-hidden />
            <span className="vn-footer-text whitespace-nowrap overflow-hidden transition-all duration-200">
              Cerrar sesión
            </span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────────── */}
      <div id="vn-main" className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center gap-3 px-4 md:px-6
                           bg-white dark:bg-slate-900
                           border-b border-slate-200 dark:border-slate-700
                           h-14">
          {/* Mobile hamburger */}
          <button
            onClick={toggleSidebar}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-md
                       text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Abrir menú"
          >
            {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>

          <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 truncate" />

          {/* User pill */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800
                          border border-slate-200 dark:border-slate-700
                          rounded-xl px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center
                            text-white text-[10px] font-semibold flex-shrink-0">
              {(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300 hidden sm:block max-w-[120px] truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.email}
            </span>
            <span className="text-[10px] bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300
                             rounded-full px-2 py-0.5 capitalize hidden sm:block">
              {user?.role}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto vn-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
