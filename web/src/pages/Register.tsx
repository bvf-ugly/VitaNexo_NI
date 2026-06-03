import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, Loader2, Monitor, Moon } from 'lucide-react'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

export default function Register() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const { isDark, toggle } = useThemeStore()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      setError('Nombre, apellido, correo y contraseña son requeridos'); return
    }
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/register', { ...form, email: form.email.trim().toLowerCase() })
      setAuth(data.accessToken, data.refreshToken, data.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrarse')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-sky-400 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.9' viewBox='0 0 60 103.9' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 17.32V51.96L30 69.28L0 51.96V17.32Z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 103.9px',
        }} />
        <div className="text-center text-white relative z-10">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HeartPulse className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold mb-3">VitaNexo</h1>
          <p className="text-lg text-white/80 max-w-sm mx-auto">Únete a la plataforma que cuida tu salud de forma inteligente.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">VitaNexo</span>
            </div>
            <button onClick={toggle} className="ml-auto p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              {isDark ? <Moon className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </button>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Crear cuenta</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Regístrate como paciente</p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-6 border border-red-100 dark:border-red-800">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nombre</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="María"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Apellido</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="García"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Correo electrónico</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@correo.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Teléfono (opcional)</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+505 8888 8888"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contraseña</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
