import { useLocation } from 'react-router-dom'
import { Bell, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useThemeStore } from '../../store/themeStore'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Activity, Calendar,
  Bell as BellIcon, User, HeartPulse, Monitor, Moon,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/glucose': 'Glucosa',
  '/appointments': 'Citas',
  '/alerts': 'Alertas',
  '/profile': 'Perfil',
}

const mobileLinks = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/glucose',   icon: Activity,        label: 'Glucosa' },
  { to: '/appointments', icon: Calendar,     label: 'Citas' },
  { to: '/alerts',    icon: BellIcon,        label: 'Alertas' },
  { to: '/profile',   icon: User,            label: 'Perfil' },
]

export default function Header() {
  const { pathname } = useLocation()
  const title = titles[pathname] || 'VitaNexo'
  const [mobileMenu, setMobileMenu] = useState(false)
  const { isDark, toggle } = useThemeStore()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-100 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Bienvenido a tu panel de salud</p>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          <button
            onClick={toggle}
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark ? <Moon className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </button>
          <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center font-bold text-sm">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileMenu(false)}>
          <div className="w-64 bg-white dark:bg-slate-900 h-full p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100">VitaNexo</h2>
                <p className="text-xs text-slate-400">{user?.first_name} {user?.last_name}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {mobileLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setMobileMenu(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <l.icon className="w-5 h-5" />
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </>
  )
}
