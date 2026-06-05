import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, useTheme } from '../context.tsx'
import api, { IS_DEMO } from '../services/api.ts'
import Background from '../components/Background.tsx'
import { Heart, Mail, Lock, ArrowRight, Activity, Shield, Clock, Stethoscope, Sparkles, ChevronDown, Zap, TrendingUp } from 'lucide-react'

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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()

  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const heroVisible = useInView(heroRef, 0.2)
  const featuresVisible = useInView(featuresRef, 0.1)
  const statsVisible = useInView(statsRef, 0.1)
  const ctaVisible = useInView(ctaRef, 0.2)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (IS_DEMO) {
        const demoUser = {
          _id: 'demo-user-001',
          email: email || 'demo@vitanexo.com',
          first_name: 'Usuario',
          last_name: 'Demo',
          role: 'patient',
        }
        login('demo-token', 'demo-refresh', demoUser)
        navigate('/')
      } else {
        const { data } = await api.post('/auth/login', { email, password })
        login(data.accessToken, data.refreshToken, data.user)
        navigate('/')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesion')
    } finally { setLoading(false) }
  }

  const features = [
    { icon: Activity, title: 'Monitoreo en tiempo real', desc: 'Glucosa, presion arterial y signos vitales actualizados al instante', color: 'from-primary-500 to-blue-400' },
    { icon: Shield, title: 'Datos seguros', desc: 'Encriptacion de extremo a extremo para proteger tu informacion medica', color: 'from-secondary-500 to-green-400' },
    { icon: Clock, title: 'Historial completo', desc: 'Todo tu expediente medico accesible desde cualquier dispositivo', color: 'from-primary-600 to-secondary-500' },
    { icon: Zap, title: 'Alertas inteligentes', desc: 'Notificaciones automaticas cuando tus valores estan fuera de rango', color: 'from-blue-500 to-cyan-400' },
    { icon: TrendingUp, title: 'Graficas detalladas', desc: 'Visualiza tendencias y progresos con graficas interactivas', color: 'from-indigo-500 to-primary-400' },
    { icon: Stethoscope, title: 'Conexion medica', desc: 'Coordina citas y comunicate directamente con tu medico', color: 'from-secondary-600 to-primary-500' },
  ]

  const steps = [
    { num: '01', title: 'Registrate', desc: 'Crea tu cuenta de paciente en segundos', icon: Heart },
    { num: '02', title: 'Ingresa datos', desc: 'Registra tus signos vitales y glucosa', icon: Activity },
    { num: '03', title: 'Monitorea', desc: 'Visualiza tu progreso con graficas detalladas', icon: TrendingUp },
    { num: '04', title: 'Conectate', desc: 'Coordina citas con tu medico de confianza', icon: Stethoscope },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Background />

      <a href="#login-form" className="skip-link">
        Saltar al formulario de inicio de sesion
      </a>

      {/* HERO SECTION */}
      <section className="min-h-screen flex flex-col relative" ref={heroRef}>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-300/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-primary-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />

        {/* Navbar */}
        <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow dark:from-asuka-red dark:to-asuka-orange dark:shadow-glow-red">
              <Heart size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold font-heading">
              <span className="text-primary-600 dark:text-asuka-orange">Vita</span>
              <span className="text-secondary-600 dark:text-asuka-red">Nexo</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-asuka-orange transition-colors">Caracteristicas</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-asuka-orange transition-colors">Como funciona</a>
            <Link to="/register" className="btn-secondary text-sm">Crear cuenta</Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12 relative z-10">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className={`transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-asuka-red/10 text-primary-700 dark:text-asuka-orange text-sm font-medium mb-6">
                <Sparkles size={16} />
                <span>Plataforma de gestion medica</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-slate-100 mb-6 leading-tight font-heading">
                Tu salud en{' '}
                <span className="gradient-text">buenas manos</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
                Monitorea tu glucosa, presion arterial y signos vitales. Conectate con tu medico y lleva el control de tu salud de forma inteligente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary text-base group">
                  <span>Comenzar ahora</span>
                  <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-2" />
                </Link>
                <a href="#features" className="btn-secondary text-base">
                  Conocer mas
                </a>
              </div>
            </div>

            {/* Right: Login Form — Liquid Glass */}
            <div className={`transition-all duration-700 delay-200 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="liquid-glass-lg p-8 sm:p-10 rounded-3xl" id="login-form">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 font-heading">
                    Bienvenido de nuevo
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Inicia sesion para acceder a tu cuenta
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="input-icon-wrapper">
                    <Mail size={18} className="input-icon" aria-hidden />
                    <input
                      type="email" required value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input"
                      placeholder="usuario@ejemplo.com"
                      autoComplete="email"
                      aria-label="Correo electronico"
                    />
                  </div>
                  <div className="input-icon-wrapper">
                    <Lock size={18} className="input-icon" aria-hidden />
                    <input
                      type="password" required value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input"
                      placeholder="Tu contrasena"
                      autoComplete="current-password"
                      aria-label="Contrasena"
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-3" role="alert">
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn-glow w-full group">
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Ingresando...</span>
                      </>
                    ) : (
                      <>
                        <span>Iniciar sesion</span>
                        <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-2" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
                  Primera vez?{' '}
                  <Link to="/register" className="font-semibold text-primary-600 dark:text-asuka-orange hover:text-primary-700 dark:hover:text-asuka-red transition-colors">
                    Crear cuenta
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={24} className="text-slate-400" />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="section-divider py-24 px-6 lg:px-12 relative" ref={featuresRef}>
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4 font-heading">
              Todo lo que necesitas en{' '}
              <span className="gradient-text">un solo lugar</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Herramientas disenadas para que tomes el control de tu salud de forma sencilla y efectiva.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className={`liquid-card p-7 hover-lift group transition-all duration-700 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg group-hover:shadow-glow dark:group-hover:shadow-glow-red transition-shadow duration-300`}>
                  <f.icon size={24} className="text-white" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 font-heading">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="py-16 px-6 lg:px-12 relative" ref={statsRef}>
        <div className={`max-w-5xl mx-auto liquid-glass-lg rounded-3xl p-8 sm:p-12 transition-all duration-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold gradient-text font-heading">10K+</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Pacientes activos</p>
            </div>
            <div>
              <p className="text-4xl font-bold gradient-text font-heading">500+</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Medicos conectados</p>
            </div>
            <div>
              <p className="text-4xl font-bold gradient-text font-heading">99.9%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Disponibilidad</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section-divider py-24 px-6 lg:px-12 relative bg-gradient-to-b from-transparent via-primary-50/50 to-transparent dark:via-asuka-red/5" ref={ctaRef}>
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4 font-heading">
              <span className="gradient-text">Simple</span> de usar
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              En solo 4 pasos comienzas a monitorear tu salud de forma efectiva.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`relative transition-all duration-700 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="liquid-card p-6 text-center hover-lift h-full">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-glow dark:shadow-glow-red ${dark ? 'bg-gradient-to-br from-asuka-red to-asuka-orange' : 'bg-gradient-to-br from-primary-500 to-secondary-500'}`}>
                    <s.icon size={28} className="text-white" aria-hidden />
                  </div>
                  <div className="text-4xl font-bold gradient-text/30 mb-3 font-heading">{s.num}</div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 font-heading">{s.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-300 to-secondary-300 dark:from-asuka-red/30 dark:to-asuka-orange/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 lg:px-12 border-t border-primary-100/50 dark:border-asuka-red/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope size={20} className="text-primary-500 dark:text-asuka-orange" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              VitaNexo &copy; {new Date().getFullYear()}
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Plataforma de gestion medica. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
