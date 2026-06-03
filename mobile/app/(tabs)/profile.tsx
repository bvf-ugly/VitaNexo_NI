import { useEffect, useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import api, { getMyPatientId } from '../../src/services/api'
import { useTheme } from '../../src/theme/ThemeContext'

export default function ProfileScreen() {
  const [user, setUser] = useState<any>({})
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { colors, isDark } = useTheme()

  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [ecName, setEcName] = useState('')
  const [ecPhone, setEcPhone] = useState('')
  const [ecRel, setEcRel] = useState('')

  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync('user').then(u => { if (u) setUser(JSON.parse(u)) }),
      getMyPatientId().then(async pid => {
        if (!pid) return
        const { data } = await api.get(`/patients/${pid}`)
        setPatient(data)
        setPhone(data.user_id?.phone || '')
        setAddress(data.address || '')
        setEcName(data.emergency_contact?.name || '')
        setEcPhone(data.emergency_contact?.phone || '')
        setEcRel(data.emergency_contact?.relationship || '')
      }),
    ]).finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!patient) return
    setSaving(true)
    try {
      await api.put(`/patients/${patient._id}/profile`, {
        phone, address,
        emergency_contact: { name: ecName, phone: ecPhone, relationship: ecRel },
      })
      Alert.alert('✅ Perfil actualizado correctamente')
    } catch (err: any) {
      Alert.alert('❌ Error', err.response?.data?.error || 'No se pudo guardar')
    } finally { setSaving(false) }
  }

  async function logout() {
    Alert.alert('Cerrar sesión', '¿Deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => {
        try { await api.post('/auth/logout') } catch {}
        await SecureStore.deleteItemAsync('accessToken')
        await SecureStore.deleteItemAsync('refreshToken')
        await SecureStore.deleteItemAsync('user')
        router.replace('/login')
      }},
    ])
  }

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  )

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Profile card */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.profileBg, { backgroundColor: colors.primary }]} />
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {user.first_name?.[0]}{user.last_name?.[0]}
            </Text>
          </View>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user.first_name} {user.last_name}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.roleText, { color: colors.primary }]}>{user.role}</Text>
        </View>
      </View>

      {/* Editable info */}
      {patient && (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Editar información</Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Teléfono</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            value={phone} onChangeText={setPhone} placeholder="+505 8888-0000" placeholderTextColor={colors.textMuted} />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Dirección</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            value={address} onChangeText={setAddress} placeholder="Managua, Nicaragua" placeholderTextColor={colors.textMuted} />

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Contacto de emergencia</Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            value={ecName} onChangeText={setEcName} placeholder="Nombre del contacto" placeholderTextColor={colors.textMuted} />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Teléfono</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                value={ecPhone} onChangeText={setEcPhone} placeholder="+505 7777-0000" placeholderTextColor={colors.textMuted} />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Parentesco</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                value={ecRel} onChangeText={setEcRel} placeholder="Esposo/a" placeholderTextColor={colors.textMuted} />
            </View>
          </View>

          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={saving}>
            <Text style={styles.btnText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Clinical info - read only */}
      {patient && (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Ficha clínica</Text>
          <Text style={[styles.hint, { color: colors.textMuted }]}>Solo el médico modifica estos datos</Text>
          <View style={[styles.field, { borderBottomColor: colors.surfaceBorder }]}>
            <Text style={styles.fieldIcon}>🩸</Text>
            <View style={styles.fieldContent}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Tipo sanguíneo</Text>
              <View style={[styles.readonlyBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Text style={[styles.readonlyText, { color: colors.textMuted }]}>{patient.blood_type || '—'}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.field, { borderBottomColor: colors.surfaceBorder }]}>
            <Text style={styles.fieldIcon}>⚠️</Text>
            <View style={styles.fieldContent}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Alergias</Text>
              <View style={[styles.readonlyBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Text style={[styles.readonlyText, { color: colors.textMuted }]}>{patient.allergies?.join(', ') || 'Ninguna'}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.field, { borderBottomColor: colors.surfaceBorder }]}>
            <Text style={styles.fieldIcon}>❤️</Text>
            <View style={styles.fieldContent}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Condiciones crónicas</Text>
              <View style={[styles.readonlyBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Text style={[styles.readonlyText, { color: colors.textMuted }]}>{patient.chronic_conditions?.join(', ') || 'Ninguna'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Quick links to other screens */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Acceso rápido</Text>
        {patient && (
          <>
            <TouchableOpacity style={[styles.linkRow, { borderBottomColor: colors.surfaceBorder }]} onPress={() => router.push('/(tabs)/vitals')}>
              <Text style={styles.linkIcon}>❤️</Text>
              <Text style={[styles.linkText, { color: colors.text }]}>Signos Vitales</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.linkRow, { borderBottomColor: colors.surfaceBorder }]} onPress={() => router.push('/(tabs)/record')}>
              <Text style={styles.linkIcon}>📋</Text>
              <Text style={[styles.linkText, { color: colors.text }]}>Expediente</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/(tabs)/appointments')}>
          <Text style={styles.linkIcon}>📅</Text>
          <Text style={[styles.linkText, { color: colors.text }]}>Mis Citas</Text>
          <Text style={styles.linkArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.surface, borderColor: colors.dangerLight }]} onPress={logout}>
        <Text style={[styles.logoutText, { color: colors.danger }]}>🚪 Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileCard: { marginBottom: 16, borderBottomWidth: 0 },
  profileBg: { height: 80, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  avatarWrap: { alignItems: 'center', marginTop: -28 },
  avatar: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6 },
  avatarText: { fontSize: 22, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  email: { fontSize: 14, textAlign: 'center', marginTop: 4 },
  roleBadge: { alignSelf: 'center', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4, marginTop: 8 },
  roleText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  card: { borderRadius: 14, marginHorizontal: 16, marginBottom: 16, padding: 16, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  hint: { fontSize: 12, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '700', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  btn: { borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  field: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1 },
  fieldIcon: { fontSize: 18, marginRight: 10, marginTop: 2 },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 12, marginBottom: 4 },
  readonlyBox: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  readonlyText: { fontSize: 14 },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  linkIcon: { fontSize: 18, marginRight: 12 },
  linkText: { fontSize: 15, fontWeight: '500', flex: 1 },
  linkArrow: { fontSize: 20, color: '#94a3b8' },
  logoutBtn: { marginHorizontal: 16, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, marginBottom: 32 },
  logoutText: { fontWeight: '600', fontSize: 15 },
})
