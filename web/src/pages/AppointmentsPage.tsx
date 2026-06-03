import { useEffect, useState } from 'react'
import api from '../services/api.ts'

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  confirmed: 'bg-sky-100    text-sky-700    dark:bg-sky-900/40    dark:text-sky-300',
  done:      'bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-300',
  cancelled: 'bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-300',
}
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmada', done: 'Realizada', cancelled: 'Cancelada',
}

export default function AppointmentsPage() {
  const [appts,   setAppts]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.get('/appointments')
      .then(({ data }) => setAppts(data))
      .catch(() => setError('No se pudieron cargar las citas.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-8 flex items-center gap-3 text-slate-400">
      <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full vn-spin" />
      Cargando citas...
    </div>
  )

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">📅 Citas Médicas</h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Historial y próximas citas</p>
      </div>

      {error && (
        <p className="text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800
                      rounded-lg px-4 py-3 text-sm mb-4">{error}</p>
      )}

      {appts.length === 0 && !error ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                        rounded-xl p-10 text-center text-slate-400">
          No hay citas registradas.
        </div>
      ) : (
        <div className="space-y-3">
          {appts.map(a => (
            <div key={a._id}
                 className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                            rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                  {a.reason || 'Sin motivo especificado'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {new Date(a.scheduled_at).toLocaleString('es-NI', {
                    weekday: 'long', year: 'numeric', month: 'long',
                    day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
                {a.notes && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">{a.notes}</p>
                )}
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0
                               ${STATUS_STYLES[a.status]}`}>
                {STATUS_LABELS[a.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
