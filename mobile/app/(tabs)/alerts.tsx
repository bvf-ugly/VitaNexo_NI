import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import api, { getMyPatientId } from '../../src/services/api'
import { useTheme } from '../../src/theme/ThemeContext'
import AlertItem from '../../src/components/AlertItem'

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { colors } = useTheme()

  async function load() {
    try {
      const pid = await getMyPatientId()
      if (!pid) { setLoading(false); return }
      const { data } = await api.get(`/alerts/patient/${pid}`)
      setAlerts(data)
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
      data={alerts}
      keyExtractor={i => i._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.primary} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>🔔 Alertas</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>Notificaciones y alertas médicas</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={[styles.card, styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={[styles.emptyTitle, { color: colors.textMuted }]}>No hay alertas</Text>
          <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Tus notificaciones aparecerán aquí.</Text>
        </View>
      }
      contentContainerStyle={{ paddingBottom: 32 }}
      renderItem={({ item: a }) => (
        <View style={{ marginHorizontal: 16 }}>
          <AlertItem type={a.type} message={a.message} triggered_at={a.triggered_at} is_read={a.is_read} />
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  sub: { fontSize: 13, marginTop: 2 },
  card: { borderRadius: 14, marginHorizontal: 16, borderWidth: 1 },
  emptyCard: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptyHint: { fontSize: 13, marginTop: 4 },
})
