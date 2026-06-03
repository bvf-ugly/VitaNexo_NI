import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import api from '../../src/services/api'
import { useTheme } from '../../src/theme/ThemeContext'
import Badge from '../../src/components/Badge'

const statusMap: Record<string, { label: string; variant: 'info' | 'success' | 'danger' | 'warning' }> = {
  pending: { label: 'Pendiente', variant: 'warning' },
  confirmed: { label: 'Confirmada', variant: 'info' },
  done: { label: 'Realizada', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'danger' },
}

export default function AppointmentsScreen() {
  const [appts, setAppts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { colors } = useTheme()

  async function load() {
    try {
      const { data } = await api.get('/appointments')
      setAppts(data)
    } catch {} finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  )

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.bg }]}
      data={appts}
      keyExtractor={i => i._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.primary} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>📅 Mis Citas</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>Gestiona tus citas médicas</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={[styles.card, styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay citas registradas.</Text>
        </View>
      }
      contentContainerStyle={{ paddingBottom: 32 }}
      renderItem={({ item: a }) => {
        const s = statusMap[a.status] || statusMap.pending
        return (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.reason, { color: colors.text }]}>{a.reason || 'Cita médica'}</Text>
              <Badge variant={s.variant}>{s.label}</Badge>
            </View>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {new Date(a.scheduled_at).toLocaleString('es-NI', {
                weekday: 'short', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </Text>
            {a.notes ? <Text style={[styles.notes, { color: colors.textMuted }]}>{a.notes}</Text> : null}
          </View>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  sub: { fontSize: 13, marginTop: 2 },
  card: { borderRadius: 14, marginHorizontal: 16, marginBottom: 12, padding: 16, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  reason: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  date: { fontSize: 13 },
  notes: { fontSize: 12, marginTop: 6 },
  emptyCard: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14 },
})
