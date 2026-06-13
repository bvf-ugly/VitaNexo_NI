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
    <aside className={`w-64 flex flex-col min-h-screen shrink-0 max-lg:hidden ${isDark ? 'bg-[#1E293B] text-slate-100' : 'bg-[#4C1D95] text-white'}`}>
      <div className={`px-6 py-6 border-b ${isDark ? 'border-slate-700' : 'border-purple-500'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-primary-600' : 'bg-white/20'}`}>
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">VitaNexo</h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-purple-200'}`}>Gestión Médica</p>
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
                  ? isDark
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'bg-white/20 text-white'
                  : isDark
                    ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                    : 'text-purple-200 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <l.icon className="w-5 h-5" />
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className={`px-3 py-4 border-t space-y-2 ${isDark ? 'border-slate-700' : 'border-purple-500'}`}>
        <button
          onClick={toggle}
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            isDark
              ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
              : 'text-purple-200 hover:bg-white/10 hover:text-white'
          }`}
        >
          {isDark ? <Monitor className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {isDark ? 'Modo claro' : 'Modo oscuro'}
        </button>
        <div className="px-4 py-2">
          <p className="text-sm font-medium text-white truncate">{user?.first_name} {user?.last_name}</p>
          <p className={`text-xs capitalize ${isDark ? 'text-slate-400' : 'text-purple-300'}`}>{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            isDark
              ? 'text-slate-400 hover:bg-slate-700 hover:text-red-400'
              : 'text-purple-200 hover:bg-white/10 hover:text-red-300'
          }`}
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
