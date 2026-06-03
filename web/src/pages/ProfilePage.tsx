import { useEffect, useState } from 'react'
import { useAuth } from '../context.tsx'
import api, { getMyPatientId } from '../services/api.ts'

export default function ProfilePage() {
  const { user } = useAuth()
  const [patient, setPatient] = useState<any>(null)
  const [form, setForm]       = useState({ phone: '', address: '', ec_name: '', ec_phone: '', ec_rel: '' })
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState<{ text: string; ok: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyPatientId()
      .then(pid => {
        if (!pid) return null
        return api.get(`/patients/${pid}`).then(r => r.data)
      })
      .then(p => {
        if (p) {
          setPatient(p)
          setForm({
            phone:    p.user_id?.phone || '',
            address:  p.address       || '',
            ec_name:  p.emergency_contact?.name         || '',
            ec_phone: p.emergency_contact?.phone        || '',
            ec_rel:   p.emergency_contact?.relationship || '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!patient) return
    setSaving(true); setMsg(null)
    try {
      await api.put(`/patients/${patient._id}/profile`, {
        phone:   form.phone,
        address: form.address,
        emergency_contact: {
          name: form.ec_name, phone: form.ec_phone, relationship: form.ec_rel,
        },
      })
      setMsg({ text: '✅ Perfil actualizado correctamente', ok: true })
    } catch (err: any) {
      setMsg({ text: '❌ ' + (err.response?.data?.error || 'Error al guardar'), ok: false })
    } finally { setSaving(false) }
  }

  const inputCls = `w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2
                    text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                    focus:outline-none focus:ring-2 focus:ring-sky-400`
  const readonlyCls = `${inputCls} opacity-60 cursor-not-allowed`
  const labelCls = 'block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1'
  const card = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5'

  if (loading) return (
    <div className="p-8 flex items-center gap-3 text-slate-400">
      <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full vn-spin" />
      Cargando perfil...
    </div>
  )

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">👤 Mi Perfil</h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
          Actualiza tus datos personales y contacto de emergencia
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Editable form */}
        <div className={card}>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-4">
            Datos que puedes editar
          </h3>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className={labelCls}>Teléfono</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className={inputCls} placeholder="+505 8888-0000" />
            </div>
            <div>
              <label className={labelCls}>Dirección</label>
              <input type="text" value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className={inputCls} placeholder="Managua, Nicaragua" />
            </div>

            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 pt-2">
              Contacto de emergencia
            </p>
            <div>
              <label className={labelCls}>Nombre</label>
              <input type="text" value={form.ec_name}
                onChange={e => setForm(f => ({ ...f, ec_name: e.target.value }))}
                className={inputCls} placeholder="Nombre del contacto" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Teléfono</label>
                <input type="tel" value={form.ec_phone}
                  onChange={e => setForm(f => ({ ...f, ec_phone: e.target.value }))}
                  className={inputCls} placeholder="+505 7777-0000" />
              </div>
              <div>
                <label className={labelCls}>Parentesco</label>
                <input type="text" value={form.ec_rel}
                  onChange={e => setForm(f => ({ ...f, ec_rel: e.target.value }))}
                  className={inputCls} placeholder="Esposo/a, hijo/a..." />
              </div>
            </div>

            {msg && (
              <p className={`text-sm px-3 py-2 rounded-lg border
                ${msg.ok
                  ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                }`}>
                {msg.text}
              </p>
            )}

            <button type="submit" disabled={saving}
              className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-5 py-2
                         text-sm font-medium transition disabled:opacity-50
                         flex items-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full vn-spin" />}
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        {/* Clinical data — read only */}
        <div className={card}>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1">
            Datos clínicos
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
            Solo el médico puede modificar estos campos.
          </p>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Tipo de sangre</label>
              <input readOnly value={patient?.blood_type || '—'} className={readonlyCls} />
            </div>
            <div>
              <label className={labelCls}>Condiciones crónicas</label>
              <input readOnly value={(patient?.chronic_conditions || []).join(', ') || 'Ninguna'} className={readonlyCls} />
            </div>
            <div>
              <label className={labelCls}>Alergias</label>
              <input readOnly value={(patient?.allergies || []).join(', ') || 'Ninguna'} className={readonlyCls} />
            </div>
          </div>

          {/* Account info */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Cuenta</p>
            <div>
              <label className={labelCls}>Email</label>
              <input readOnly value={user?.email || ''} className={readonlyCls} />
            </div>
            <div>
              <label className={labelCls}>Rol</label>
              <input readOnly value={user?.role || ''} className={`${readonlyCls} capitalize`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
