import { useState } from 'react'
import { CheckCircle2, Circle, Pill } from 'lucide-react'

const DEMO_MEDS = [
  { id: '1', name: 'Metformina 850mg', dose: '1 tableta', frequency: 'Cada 12h (desayuno y cena)', condition: 'Diabetes T2', color: 'primary', taken: true },
  { id: '2', name: 'Losartan 50mg',    dose: '1 tableta', frequency: 'Cada manana',                 condition: 'Hipertension', color: 'red', taken: false },
  { id: '3', name: 'Atorvastatina 20mg', dose: '1 capsula', frequency: 'En la noche',              condition: 'Dislipidemia', color: 'amber', taken: true },
  { id: '4', name: 'Vitamina D3 2000 UI', dose: '1 capsula', frequency: 'Con almuerzo',            condition: 'Suplemento',   color: 'secondary', taken: false },
]

export default function MedicationsPage() {
  const [meds, setMeds] = useState(DEMO_MEDS)

  function toggleTaken(id: string) {
    setMeds(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m))
  }

  const taken = meds.filter(m => m.taken).length

  return (
      <div className="w-full max-w-4xl animate-fade-in">
      {/* Header — Persistent */}
      <div className="page-header">
        <h1 className="page-title">
          <span className="inline-flex items-center gap-2">
            <Pill size={24} className="text-primary-500" aria-hidden />
            Medicamentos
          </span>
        </h1>
        <p className="page-subtitle">
          Medicamentos activos y recordatorio de dosis diaria
        </p>
      </div>

      {/* Progress */}
      <div className="card mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 font-heading">Dosis de hoy</p>
          <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{taken}/{meds.length}</p>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500 ease-smooth"
            style={{ width: `${(taken / meds.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          {taken === meds.length
            ? 'Todas las dosis del dia completadas'
            : `${meds.length - taken} dosis pendiente${meds.length - taken > 1 ? 's' : ''}`
          }
        </p>
      </div>

      {/* Med list */}
      <div className="card overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {meds.map((med, i) => (
          <div
            key={med.id}
            className={`flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 hover-lift
              ${i < meds.length - 1 ? 'border-b border-slate-100/80 dark:border-slate-700/50' : ''}`}
          >
            <div className={`w-3 h-3 rounded-full flex-shrink-0 bg-${med.color}-500`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{med.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {med.dose} &middot; {med.frequency}
              </p>
              <span className="badge badge-primary mt-1.5 text-[10px]">
                {med.condition}
              </span>
            </div>
            <button
              onClick={() => toggleTaken(med.id)}
              aria-label={med.taken ? 'Marcar como no tomado' : 'Marcar como tomado'}
              className="flex-shrink-0 transition-all duration-200 hover:scale-110 cursor-pointer"
            >
              {med.taken
                ? <CheckCircle2 size={24} className="text-emerald-500" aria-hidden />
                : <Circle size={24} className="text-slate-300 dark:text-slate-600" aria-hidden />
              }
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 text-center">
        Solo el medico puede agregar o modificar medicamentos. El paciente solo marca la dosis tomada.
      </p>
    </div>
  )
}
