import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, Dimensions,
} from 'react-native'
import api, { getMyPatientId } from '../../src/services/api'
import { useTheme } from '../../src/theme/ThemeContext'
import StatCard from '../../src/components/StatCard'
import Badge from '../../src/components/Badge'
import AlertItem from '../../src/components/AlertItem'

const SCREEN = Dimensions.get('window')
const contextLabels: Record<string, string> = {
  fasting: 'Ayunas', post_meal: 'Postprandial', random: 'Aleatoria', bedtime: 'Antes de dormir',
}

export default function HomeScreen() {
  const [stats, setStats] = useState<any>(null)
  const [readings, setReadings] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [patientId, setPatientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { colors, isDark } = useTheme()

  const load = useCallback(async () => {
    try {
      const pid = await getMyPatientId()
      if (!pid) { setLoading(false); return }
      setPatientId(pid)
      const [statsRes, readingsRes, alertsRes, apptsRes] = await Promise.all([
        api.get(`/glucose/patient/${pid}/stats`),
        api.get(`/glucose/patient/${pid}`),
        api.get(`/alerts/patient/${pid}`),
        api.get('/appointments'),
      ])
      setStats(statsRes.data)
      setReadings(readingsRes.data.slice(0, 5))
      setAlerts(alertsRes.data.filter((a: any) => !a.is_read).slice(0, 3))
      setAppointments(apptsRes.data.filter((a: any) => a.status !== 'cancelled').slice(0, 2))
    } catch {} finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  )

  const chartMax = Math.max(...readings.map((r: any) => r.value_mgdl), 180) + 20

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Bienvenido 👋</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Resumen de tu estado de salud</Text>
      </View>

      {/* Stats */}
      {stats && stats.count > 0 && (
        <View style={styles.statsGrid}>
          <StatCard label="Promedio" value={stats.avg_mgdl} unit="mg/dL" icon="📊" color={colors.primary} />
          <StatCard label="En rango" value={stats.in_range_pct} unit="%" icon="✅" color="#22c55e" />
          <StatCard label="Mínimo" value={stats.min_mgdl} unit="mg/dL" icon="⬇️" color="#6366f1" />
          <StatCard label="Máximo" value={stats.max_mgdl} unit="mg/dL" icon="⬆️" color="#f59e0b" />
        </View>
      )}

      {/* Mini chart */}
      {readings.length > 1 && (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>📈 Tendencia reciente</Text>
          <View style={styles.chartContainer}>
            {readings.slice(0, 7).reverse().map((r: any, i: number) => {
              const h = (r.value_mgdl / chartMax) * 120
              const w = Math.min(30, (SCREEN.width - 80) / Math.min(readings.length, 7) - 4)
              return (
                <View key={r._id} style={styles.chartCol}>
                  <View style={[styles.chartBar, { height: Math.max(h, 4), width: w, backgroundColor: r.value_mgdl > 140 || r.value_mgdl < 70 ? colors.danger : colors.primary }]} />
                  <Text style={[styles.chartLabel, { color: colors.textMuted }]}>{r.value_mgdl}</Text>
                  <Text style={[styles.chartDate, { color: colors.textMuted }]}>
                    {new Date(r.recorded_at).toLocaleDateString('es-NI', { month: 'numeric', day: 'numeric' })}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🚨 Alertas pendientes</Text>
          {alerts.map((a: any) => (
            <AlertItem key={a._id} type={a.type} message={a.message} triggered_at={a.triggered_at} is_read={a.is_read} />
          ))}
        </View>
      )}

      {/* Next Appointments */}
      {appointments.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📅 Próximas citas</Text>
          {appointments.map((a: any) => (
            <View key={a._id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <View style={styles.apptHeader}>
                <Text style={[styles.apptReason, { color: colors.text }]}>{a.reason || 'Cita médica'}</Text>
                <Badge variant={a.status === 'confirmed' ? 'info' : 'default'}>{a.status === 'pending' ? 'Pendiente' : a.status === 'confirmed' ? 'Confirmada' : a.status}</Badge>
              </View>
              <Text style={[styles.apptDate, { color: colors.textSecondary }]}>
                {new Date(a.scheduled_at).toLocaleString('es-NI', { weekday: 'short', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
              {a.notes && <Text style={[styles.apptNotes, { color: colors.textMuted }]}>{a.notes}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Empty state */}
      {(!stats || stats.count === 0) && (
        <View style={[styles.card, styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.emptyTitle, { color: colors.textMuted }]}>Sin datos aún</Text>
          <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Ve a la pestaña Glucosa para registrar tus primeras lecturas.</Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800' },
  sub: { fontSize: 13, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginBottom: 16 },
  card: { borderRadius: 14, marginHorizontal: 16, marginBottom: 12, padding: 16, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 160, paddingTop: 8 },
  chartCol: { alignItems: 'center' },
  chartBar: { borderRadius: 4, minHeight: 4 },
  chartLabel: { fontSize: 10, marginTop: 2 },
  chartDate: { fontSize: 8, marginTop: 1 },
  section: { marginHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  apptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  apptReason: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  apptDate: { fontSize: 13 },
  apptNotes: { fontSize: 12, marginTop: 4 },
  emptyCard: { alignItems: 'center', paddingVertical: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptyHint: { fontSize: 13, marginTop: 4, textAlign: 'center' },
})
