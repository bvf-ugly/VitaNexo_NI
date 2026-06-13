import { useEffect, useState } from 'react'
import { User, Mail, Phone, Droplets, AlertTriangle, Heart, LogOut, Monitor, Moon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

interface Patient {
  blood_type: string; allergies: string[]; chronic_conditions: string[]
  emergency_contact: { name: string; phone: string; relationship: string }
}

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)

  useEffect(() => {
    api.get('/patients').then(({ data }) => {
      if (data.length) setPatient(data[0])
    }).catch(() => {})
  }, [])

  function handleLogout() {
    api.post('/auth/logout').catch(() => {})
    logout()
    navigate('/login')
  }

  const fields = [
    { icon: Droplets, label: 'Tipo sanguíneo', value: patient?.blood_type || '—' },
    { icon: AlertTriangle, label: 'Alergias', value: patient?.allergies?.join(', ') || 'Ninguna' },
    { icon: Heart, label: 'Condiciones crónicas', value: patient?.chronic_conditions?.join(', ') || 'Ninguna' },
    { icon: User, label: 'Contacto emergencia', value: patient?.emergency_contact?.name || '—' },
    { icon: Phone, label: 'Tel. emergencia', value: patient?.emergency_contact?.phone || '—' },
  ]

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary-500 to-primary-700" />
        <div className="px-6 pb-6 -mt-12">
          <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user?.first_name} {user?.last_name}</h2>
          <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
            <Mail className="w-4 h-4" /> {user?.email}
          </div>
          <span className="inline-block mt-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-full capitalize">{user?.role}</span>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Ficha clínica</h3>
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center gap-3 py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <f.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">{f.label}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer" onClick={toggle}>
        {isDark ? <Moon className="w-5 h-5 text-primary-500" /> : <Monitor className="w-5 h-5 text-primary-500" />}
        <span className="flex-1 font-medium text-slate-900 dark:text-slate-100">Modo {isDark ? 'oscuro' : 'claro'}</span>
        <span className="text-sm text-primary-500">{isDark ? '🌙' : '☀️'}</span>
      </div>

      <button onClick={handleLogout} className="w-full card p-4 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
        <LogOut className="w-5 h-5" />
        <span className="font-semibold">Cerrar sesión</span>
      </button>
    </div>
  )
}
