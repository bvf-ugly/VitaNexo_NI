import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context.tsx'
import api from '../services/api.ts'
import Background from '../components/Background.tsx'
import { Heart, Mail, Lock, User, Phone, ArrowRight, CheckCircle2, Info, Stethoscope } from 'lucide-react'

function useInView(ref: React.RefObject<HTMLElement>, threshold = 0.1) {
  const [isInView, setIsInView] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, threshold])
  return isInView
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const heroRef = useRef<HTMLDivElement>(null)
  const heroVisible = useInView(heroRef, 0.2)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres'); return
    }
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('vn_token', data.accessToken)
      localStorage.setItem('vn_refresh', data.refreshToken)
      localStorage.setItem('vn_user', JSON.stringify(data.user))
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar')
    } finally { setLoading(false) }
  }

  const benefits = [
    'Monitoreo de glucosa en tiempo real',
    'Registro de signos vitales',
    'Gestion de citas medicas',
    'Historial clinico accesible',
    'Alertas inteligentes de salud',
    'Conexion directa con tu medico',
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Background />

      <a href="#register-form" className="skip-link">
        Saltar al formulario de registro
      </a>

      <div className="absolute top-20 right-10 w-72 h-72 bg-secondary-300/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-300/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-6">
        <Link to="/login" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 dark:from-asuka-red dark:to-asuka-orange flex items-center justify-center shadow-glow dark:shadow-glow-red">
            <Heart size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold font-heading">
            <span className="text-primary-600 dark:text-asuka-orange">Vita</span>
            <span className="text-secondary-600 dark:text-asuka-red">Nexo</span>
          </span>
        </Link>
        <Link to="/login" className="btn-secondary text-sm">
          Iniciar sesion
        </Link>
      </nav>

      <div className="relative z-10 flex items-center justify-center px-6 lg:px-12 py-12" ref={heroRef}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Benefits */}
          <div className={`transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6 leading-tight font-heading">
              Comienza tu{' '}
              <span className="gradient-text">bienestar</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-lg leading-relaxed">
              Unete a miles de pacientes que ya confian en VitaNexo para gestionar su salud.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {benefits.map((b, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-2xl liquid-glass transition-all duration-500 hover:shadow-liquid dark:hover:shadow-liquid-dark ${heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
                  style={{ transitionDelay: `${300 + i * 80}ms` }}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-500 dark:from-asuka-red dark:to-asuka-orange flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={16} className="text-white" aria-hidden />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form — Liquid Glass */}
          <div className={`transition-all duration-700 delay-200 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="liquid-glass-lg p-8 sm:p-10 rounded-3xl" id="register-form">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 font-heading">
                  Crear cuenta
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Completa tus datos para registrarte
                </p>
              </div>

              <div className="flex items-start gap-3 bg-primary-50/80 dark:bg-asuka-red/10 border border-primary-200/60 dark:border-asuka-red/20 rounded-xl px-4 py-3 mb-6">
                <Info size={18} className="text-primary-600 dark:text-asuka-orange flex-shrink-0 mt-0.5" aria-hidden />
                <p className="text-sm text-primary-700 dark:text-asuka-orange">
                  Esta cuenta sera de <strong>paciente</strong>. Los medicos son anadidos por el equipo clinico.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="input-icon-wrapper">
                    <User size={18} className="input-icon" aria-hidden />
                    <input type="text" value={form.first_name} onChange={set('first_name')} required className="input" placeholder="Nombre" autoComplete="given-name" aria-label="Nombre" />
                  </div>
                  <div className="input-icon-wrapper">
                    <User size={18} className="input-icon" aria-hidden />
                    <input type="text" value={form.last_name} onChange={set('last_name')} required className="input" placeholder="Apellido" autoComplete="family-name" aria-label="Apellido" />
                  </div>
                </div>
                <div className="input-icon-wrapper">
                  <Mail size={18} className="input-icon" aria-hidden />
                  <input type="email" value={form.email} onChange={set('email')} required className="input" placeholder="correo@ejemplo.com" autoComplete="email" aria-label="Correo electronico" />
                </div>
                <div className="input-icon-wrapper">
                  <Phone size={18} className="input-icon" aria-hidden />
                  <input type="tel" value={form.phone} onChange={set('phone')} className="input" placeholder="+505-8000-0000 (opcional)" autoComplete="tel" aria-label="Telefono" />
                </div>
                <div className="input-icon-wrapper">
                  <Lock size={18} className="input-icon" aria-hidden />
                  <input type="password" value={form.password} onChange={set('password')} required className="input" placeholder="Minimo 6 caracteres" autoComplete="new-password" aria-label="Contrasena" />
                </div>

                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-3" role="alert">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-glow w-full group mt-2">
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    <>
                      <span>Crear cuenta</span>
                      <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-2" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
                Ya tienes cuenta?{' '}
                <Link to="/login" className="font-semibold text-primary-600 dark:text-asuka-orange hover:text-primary-700 dark:hover:text-asuka-red transition-colors">
                  Iniciar sesion
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
