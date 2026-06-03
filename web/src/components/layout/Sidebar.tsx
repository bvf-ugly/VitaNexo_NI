import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Activity, Calendar,
  Bell, User, LogOut, HeartPulse, Monitor, Moon,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useNavigate } from 'react-router-dom'

const links = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/glucose',   icon: Activity,        label: 'Glucosa' },
  { to: '/appointments', icon: Calendar,     label: 'Citas' },
  { to: '/alerts',    icon: Bell,            label: 'Alertas' },
  { to: '/profile',   icon: User,            label: 'Perfil' },
]

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { isDark, toggle } = useThemeStore()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen shrink-0 dark:bg-slate-950 max-lg:hidden">
      <div className="px-6 py-6 border-b border-slate-700 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">VitaNexo</h1>
            <p className="text-xs text-slate-400">Gestión Médica</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800/50'
              }`
            }
          >
            <l.icon className="w-5 h-5" />
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700 dark:border-slate-800 space-y-2">
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors dark:hover:bg-slate-800/50"
        >
          {isDark ? <Moon className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          {isDark ? 'Modo oscuro' : 'Modo claro'}
        </button>
        <div className="px-4 py-2">
          <p className="text-sm font-medium text-white truncate">{user?.first_name} {user?.last_name}</p>
          <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-colors dark:hover:bg-slate-800/50"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
