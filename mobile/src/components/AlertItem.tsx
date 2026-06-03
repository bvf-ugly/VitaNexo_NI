import { View, Text, StyleSheet } from 'react-native'

const icons = { critical: '🚨', warning: '⚠️', info: 'ℹ️' }
const colors = {
  critical: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', dot: '#ef4444' },
  warning:  { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', dot: '#f59e0b' },
  info:     { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', dot: '#3b82f6' },
}

export default function AlertItem({ type, message, triggered_at, is_read }: {
  type: string; message: string; triggered_at: string; is_read: boolean
}) {
  const c = colors[type as keyof typeof colors] || colors.info
  return (
    <View style={[styles.container, { backgroundColor: c.bg, borderLeftColor: c.border }]}>
      <Text style={styles.icon}>{icons[type as keyof typeof icons] || 'ℹ️'}</Text>
      <View style={styles.content}>
        <Text style={[styles.message, { color: c.text }]}>{message}</Text>
        <Text style={styles.date}>
          {new Date(triggered_at).toLocaleDateString('es-NI', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {!is_read && <View style={[styles.dot, { backgroundColor: c.dot }]} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  icon: { fontSize: 18, marginRight: 10, marginTop: 1 },
  content: { flex: 1 },
  message: { fontSize: 13, fontWeight: '500' },
  date: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
})
