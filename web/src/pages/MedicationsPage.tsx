import { useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

const DEMO_MEDS = [
  { id: '1', name: 'Metformina 850mg', dose: '1 tableta', frequency: 'Cada 12h (desayuno y cena)', condition: 'Diabetes T2', color: '#0ea5e9', taken: true },
  { id: '2', name: 'Losartán 50mg',    dose: '1 tableta', frequency: 'Cada mañana',                 condition: 'Hipertensión', color: '#ef4444', taken: false },
  { id: '3', name: 'Atorvastatina 20mg', dose: '1 cápsula', frequency: 'En la noche',              condition: 'Dislipidemia', color: '#f59e0b', taken: true },
  { id: '4', name: 'Vitamina D3 2000 UI', dose: '1 cápsula', frequency: 'Con almuerzo',            condition: 'Suplemento',   color: '#6366f1', taken: false },
]

export default function MedicationsPage() {
  const [meds, setMeds] = useState(DEMO_MEDS)

  function toggleTaken(id: string) {
    setMeds(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m))
  }

  const taken = meds.filter(m => m.taken).length

  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">💊 Medicamentos</h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
          Medicamentos activos y recordatorio de dosis diaria
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                      rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Dosis de hoy</p>
          <p className="text-sm font-semibold text-sky-600 dark:text-sky-400">{taken}/{meds.length}</p>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-500"
            style={{ width: `${(taken / meds.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          {taken === meds.length
            ? '✅ ¡Todas las dosis del día completadas!'
            : `${meds.length - taken} dosis pendiente${meds.length - taken > 1 ? 's' : ''}`
          }
        </p>
      </div>

      {/* Med list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {meds.map((med, i) => (
          <div
            key={med.id}
            className={`flex items-center gap-4 px-5 py-4
              ${i < meds.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
          >
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: med.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{med.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {med.dose} · {med.frequency}
              </p>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400
                               rounded-full px-2 py-0.5 mt-1 inline-block">
                {med.condition}
              </span>
            </div>
            <button
              onClick={() => toggleTaken(med.id)}
              aria-label={med.taken ? 'Marcar como no tomado' : 'Marcar como tomado'}
              className="flex-shrink-0 transition-colors"
            >
              {med.taken
                ? <CheckCircle2 size={22} className="text-green-500" aria-hidden />
                : <Circle size={22} className="text-slate-300 dark:text-slate-600" aria-hidden />
              }
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 text-center">
        Solo el médico puede agregar o modificar medicamentos. El paciente solo marca la dosis tomada.
      </p>
    </div>
  )
}
