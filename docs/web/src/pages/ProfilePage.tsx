import { useEffect, useState } from 'react'
import { useAuth } from '../context.tsx'
import api, { getMyPatientId } from '../services/api.ts'
import { User, Phone, MapPin, Shield, Heart, Mail, Save } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const [patient, setPatient] = useState<any>(null)
  const [form, setForm] = useState({ phone: '', address: '', ec_name: '', ec_phone: '', ec_rel: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
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
      setMsg({ text: 'Perfil actualizado correctamente', ok: true })
    } catch (err: any) {
      setMsg({ text: err.response?.data?.error || 'Error al guardar', ok: false })
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-3 text-slate-400">
        <span className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        <span>Cargando perfil...</span>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-5xl animate-fade-in">
      {/* Header — Persistent */}
      <div className="page-header">
        <h1 className="page-title">
          <span className="inline-flex items-center gap-2">
            <User size={24} className="text-primary-500" aria-hidden />
            Mi Perfil
          </span>
        </h1>
        <p className="page-subtitle">
          Actualiza tus datos personales y contacto de emergencia
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editable form */}
        <div className="card animate-fade-in hover-lift">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <User size={16} className="text-primary-600 dark:text-primary-400" aria-hidden />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm font-heading">
              Datos que puedes editar
            </h3>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label flex items-center gap-1.5">
                <Phone size={14} aria-hidden /> Telefono
              </label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="input" placeholder="+505 8888-0000" />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <MapPin size={14} aria-hidden /> Direccion
              </label>
              <input type="text" value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="input" placeholder="Managua, Nicaragua" />
            </div>

            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <Shield size={14} aria-hidden /> Contacto de emergencia
              </p>
              <div className="space-y-3">
                <div>
                  <label className="label">Nombre</label>
                  <input type="text" value={form.ec_name}
                    onChange={e => setForm(f => ({ ...f, ec_name: e.target.value }))}
                    className="input" placeholder="Nombre del contacto" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Telefono</label>
                    <input type="tel" value={form.ec_phone}
                      onChange={e => setForm(f => ({ ...f, ec_phone: e.target.value }))}
                      className="input" placeholder="+505 7777-0000" />
                  </div>
                  <div>
                    <label className="label">Parentesco</label>
                    <input type="text" value={form.ec_rel}
                      onChange={e => setForm(f => ({ ...f, ec_rel: e.target.value }))}
                      className="input" placeholder="Esposo/a, hijo/a..." />
                  </div>
                </div>
              </div>
            </div>

            {msg && (
              <div className={`text-sm px-4 py-3 rounded-xl border ${
                msg.ok
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40'
              }`} role="alert">
                {msg.text}
              </div>
            )}

            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={18} aria-hidden />
                  <span>Guardar cambios</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Clinical data */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Heart size={16} className="text-emerald-600 dark:text-emerald-400" aria-hidden />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm font-heading">
              Datos clinicos
            </h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">
            Solo el medico puede modificar estos campos.
          </p>
          <div className="space-y-4">
            <div>
              <label className="label">Tipo de sangre</label>
              <input readOnly value={patient?.blood_type || '—'} className="input opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="label">Condiciones cronicas</label>
              <input readOnly value={(patient?.chronic_conditions || []).join(', ') || 'Ninguna'} className="input opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="label">Alergias</label>
              <input readOnly value={(patient?.allergies || []).join(', ') || 'Ninguna'} className="input opacity-60 cursor-not-allowed" />
            </div>
          </div>

          {/* Account info */}
          <div className="mt-6 pt-5 border-t border-slate-100/80 dark:border-slate-800/80 space-y-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Mail size={14} aria-hidden /> Cuenta
            </p>
            <div>
              <label className="label">Email</label>
              <input readOnly value={user?.email || ''} className="input opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="label">Rol</label>
              <input readOnly value={user?.role || ''} className="input opacity-60 cursor-not-allowed capitalize" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
