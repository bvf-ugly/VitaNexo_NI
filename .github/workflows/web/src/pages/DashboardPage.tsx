import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity, Droplets, Calendar, TrendingUp, AlertCircle,
  ArrowRight, Pill, FileText, Bell, Clock, ChevronRight, Sparkles,
} from 'lucide-react'
import { useAuth } from '../context.tsx'
import api, { getMyPatientId } from '../services/api.ts'

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

function StatCard({ label, value, sub, color, icon: Icon, delay = 0 }: {
  label: string; value: string; sub?: string; color: string; icon: React.FC<any>; delay?: number
}) {
  return (
    <div
      className="liquid-card hover-lift group transition-all duration-700"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color.includes('primary') ? 'bg-primary-100 dark:bg-primary-900/30' : color.includes('amber') ? 'bg-amber-100 dark:bg-amber-900/30' : color.includes('emerald') ? 'bg-secondary-100 dark:bg-secondary-900/30' : 'bg-primary-100 dark:bg-primary-900/30'}`}>
          <Icon size={22} className={`${color.includes('primary') ? 'text-primary-600 dark:text-primary-400' : color.includes('amber') ? 'text-amber-600 dark:text-amber-400' : color.includes('emerald') ? 'text-secondary-600 dark:text-secondary-400' : 'text-primary-600 dark:text-primary-400'}`} aria-hidden />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-heading">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function QuickLink({ to, label, icon: Icon, color, delay = 0 }: {
  to: string; label: string; icon: React.FC<any>; color: string; delay?: number
}) {
  return (
    <Link
      to={to}
      className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-500 hover:shadow-liquid dark:hover:shadow-liquid-dark hover:-translate-y-1 ${
        color === 'primary'
          ? 'bg-primary-50/50 dark:bg-primary-950/30 border-primary-200/60 dark:border-primary-800/40 hover:border-primary-300 dark:hover:border-primary-700'
          : color === 'secondary'
          ? 'bg-secondary-50/50 dark:bg-secondary-950/30 border-secondary-200/60 dark:border-secondary-800/40 hover:border-secondary-300 dark:hover:border-secondary-700'
          : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/40 hover:border-amber-300 dark:hover:border-amber-700'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
        color === 'primary' ? 'bg-primary-100 dark:bg-primary-900/40' :
        color === 'secondary' ? 'bg-secondary-100 dark:bg-secondary-900/40' :
        'bg-amber-100 dark:bg-amber-900/40'
      }`}>
        <Icon size={20} className={`${
          color === 'primary' ? 'text-primary-600 dark:text-primary-400' :
          color === 'secondary' ? 'text-secondary-600 dark:text-secondary-400' :
          'text-amber-600 dark:text-amber-400'
        }`} aria-hidden />
      </div>
      <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <ChevronRight size={16} className="text-slate-400 group-hover:text-primary-500 dark:group-hover:text-asuka-orange transition-all duration-300 group-hover:translate-x-1" aria-hidden />
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const statsRef = useRef<HTMLDivElement>(null)
  const quickRef = useRef<HTMLDivElement>(null)
  const statsVisible = useInView(statsRef, 0.1)
  const quickVisible = useInView(quickRef, 0.1)

  useEffect(() => {
    if (user?.role === 'patient') {
      getMyPatientId()
        .then(pid => pid ? api.get(`/glucose/patient/${pid}/stats`) : null)
        .then(r => r && setStats(r.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  const firstName = user?.first_name || user?.email?.split('@')[0] || 'Usuario'

  return (
    <div className="w-full max-w-7xl">
      {/* Header — Liquid Glass */}
      <div className="relative mb-8 p-6 sm:p-8 rounded-3xl liquid-glass-lg overflow-hidden">
        <div className="absolute top-4 right-4 opacity-20">
          <Sparkles size={48} className="text-primary-500 dark:text-asuka-orange" />
        </div>
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 dark:from-asuka-red/20 dark:to-asuka-orange/20 rounded-full blur-2xl" />
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2 font-heading relative z-10">
          Bienvenido, <span className="gradient-text">{firstName}</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 relative z-10">
          Panel principal &middot; {new Date().toLocaleDateString('es-NI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div ref={statsRef}>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-36 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 transition-all duration-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <StatCard label="Rol actual" value={user?.role || '—'} color="border-primary-200/60 dark:border-primary-800/40 bg-primary-50/50 dark:bg-primary-950/30" icon={Activity} delay={0} />
            <StatCard label="Glucosa prom." value={stats ? `${stats.avg_mgdl} mg/dL` : '—'} sub="30 dias" color="border-amber-200/60 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/30" icon={Droplets} delay={100} />
            <StatCard label="En rango" value={stats ? `${stats.in_range_pct}%` : '—'} sub="70-180 mg/dL" color="border-secondary-200/60 dark:border-secondary-800/40 bg-secondary-50/50 dark:bg-secondary-950/30" icon={TrendingUp} delay={200} />
            <StatCard label="Lecturas" value={stats ? String(stats.count) : '—'} sub="registradas" color="border-primary-200/60 dark:border-primary-800/40 bg-primary-50/50 dark:bg-primary-950/30" icon={Calendar} delay={300} />
          </div>
        )}
      </div>

      {/* Quick access + Reminders */}
      <div ref={quickRef} className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-700 ${quickVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="liquid-card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 dark:from-asuka-red dark:to-asuka-orange flex items-center justify-center shadow-glow dark:shadow-glow-red">
              <Activity size={18} className="text-white" aria-hidden />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm font-heading">Acceso rapido</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickLink to="/glucose" label="Registrar glucosa" icon={Droplets} color="primary" delay={0} />
            <QuickLink to="/vitals" label="Signos vitales" icon={Activity} color="secondary" delay={50} />
            <QuickLink to="/appointments" label="Mis citas" icon={Calendar} color="amber" delay={100} />
            <QuickLink to="/medications" label="Medicamentos" icon={Pill} color="primary" delay={150} />
          </div>
        </div>

        <div className="liquid-card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-glow">
              <AlertCircle size={18} className="text-white" aria-hidden />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm font-heading">Recordatorios</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl liquid-glass transition-all duration-300 hover:shadow-liquid dark:hover:shadow-liquid-dark">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Medir glucosa en ayunas</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <Clock size={12} aria-hidden /> Manana
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl liquid-glass transition-all duration-300 hover:shadow-liquid dark:hover:shadow-liquid-dark">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Tomar Losartan</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <Clock size={12} aria-hidden /> Pendiente hoy
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl liquid-glass transition-all duration-300 hover:shadow-liquid dark:hover:shadow-liquid-dark">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-500 dark:bg-asuka-orange mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Cita con Dr. Mendez</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <Calendar size={12} aria-hidden /> 10 de junio
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
