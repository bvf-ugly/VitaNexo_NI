import { useEffect, useState } from 'react'
import api from '../services/api.ts'
import { Calendar, Clock, FileText } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  pending: 'badge-warning',
  confirmed: 'badge-primary',
  done: 'badge-success',
  cancelled: 'badge-danger',
}
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  done: 'Realizada',
  cancelled: 'Cancelada',
}

export default function AppointmentsPage() {
  const [appts, setAppts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/appointments')
      .then(({ data }) => setAppts(data))
      .catch(() => setError('No se pudieron cargar las citas.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          <span>Cargando citas...</span>
        </div>
      </div>
    )

  return (
      <div className="w-full max-w-5xl animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">
          <span className="inline-flex items-center gap-2">
            <Calendar size={24} className="text-primary-500" aria-hidden />
            Citas Medicas
          </span>
        </h1>
        <p className="page-subtitle">Historial y proximas citas</p>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-3 mb-6"
          role="alert"
        >
          {error}
        </div>
      )}

      {appts.length === 0 && !error ? (
        <div className="card text-center py-16">
          <Calendar
            size={48}
            className="mx-auto text-slate-300 dark:text-slate-600 mb-3"
            aria-hidden
          />
          <p className="text-slate-400 dark:text-slate-500">
            No hay citas registradas.
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {appts.map((a, i) => (
            <div
              key={a._id}
              className="card hover-lift flex items-center justify-between gap-4"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Calendar
                    size={20}
                    className="text-primary-600 dark:text-primary-400"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                    {a.reason || 'Sin motivo especificado'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock size={14} aria-hidden />
                    {new Date(a.scheduled_at).toLocaleString('es-NI', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {a.notes && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate flex items-center gap-1">
                      <FileText size={12} aria-hidden />
                      {a.notes}
                    </p>
                  )}
                </div>
              </div>
              <span
                className={`badge ${STATUS_STYLES[a.status]} whitespace-nowrap flex-shrink-0`}
              >
                {STATUS_LABELS[a.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
