import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context.tsx'
import api from '../services/api.ts'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.accessToken, data.refreshToken, data.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-sky-50 to-indigo-100
                    dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md
                      border border-slate-100 dark:border-slate-800
                      p-8 sm:p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">🏥 VitaNexo</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Plataforma de Gestión Médica
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Correo electrónico
            </label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-600
                         rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-slate-800
                         text-slate-900 dark:text-slate-100
                         focus:outline-none focus:ring-2 focus:ring-sky-400
                         placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contraseña
            </label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-600
                         rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-slate-800
                         text-slate-900 dark:text-slate-100
                         focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950
                          border border-red-200 dark:border-red-800
                          rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold
                       rounded-lg py-2.5 text-sm transition disabled:opacity-50
                       flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full vn-spin" />
            )}
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          ¿Primera vez?{' '}
          <Link to="/register" className="text-sky-600 dark:text-sky-400 font-medium hover:underline">
            Crear cuenta
          </Link>
        </p>


      </div>
    </div>
  )
}
