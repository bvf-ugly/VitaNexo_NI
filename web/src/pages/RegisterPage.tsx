import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context.tsx'
import api from '../services/api.ts'

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', phone: '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres'); return
    }
    setLoading(true); setError('')
    try {
      // El backend siempre asigna role=patient, no importa qué se envíe
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('vn_token',   data.accessToken)
      localStorage.setItem('vn_refresh', data.refreshToken)
      localStorage.setItem('vn_user',    JSON.stringify(data.user))
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-sky-600">🏥 VitaNexo</h1>
          <p className="text-slate-500 mt-1 text-sm">Crear cuenta de paciente</p>
        </div>

        {/* Aviso explícito de rol */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 text-sm text-blue-700">
          🩺 Esta cuenta será de <strong>paciente</strong>. Los médicos y administradores son añadidos por el equipo clínico.
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { k: 'first_name', label: 'Nombre',    type: 'text',     ph: 'María' },
            { k: 'last_name',  label: 'Apellido',  type: 'text',     ph: 'García' },
            { k: 'email',      label: 'Correo',    type: 'email',    ph: 'maria@ejemplo.com' },
            { k: 'phone',      label: 'Teléfono (opcional)', type: 'tel', ph: '+505-8000-0000' },
            { k: 'password',   label: 'Contraseña (mín. 6 chars)', type: 'password', ph: '••••••••' },
          ].map(({ k, label, type, ph }) => (
            <div key={k}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input
                type={type} value={(form as any)[k]}
                onChange={set(k)}
                required={k !== 'phone'}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder={ph}
              />
            </div>
          ))}

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg py-2.5 text-sm transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-sky-600 font-medium hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}
