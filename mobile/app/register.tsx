import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import api from '../src/services/api'
import { useTheme } from '../src/theme/ThemeContext'

export default function RegisterScreen() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const { colors } = useTheme()

  function handleChange(field: string) {
    return (val: string) => setForm({ ...form, [field]: val })
  }

  async function handleRegister() {
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      Alert.alert('Campos requeridos', 'Nombre, apellido, correo y contraseña son requeridos'); return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', { ...form, email: form.email.trim().toLowerCase() })
      await SecureStore.setItemAsync('accessToken', data.accessToken)
      await SecureStore.setItemAsync('refreshToken', data.refreshToken)
      await SecureStore.setItemAsync('user', JSON.stringify(data.user))
      router.replace('/(tabs)')
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo registrar')
    } finally { setLoading(false) }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.bg }]} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <View style={[styles.logoWrap, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoIcon}>🏥</Text>
          </View>
          <Text style={[styles.logo, { color: colors.primary }]}>VitaNexo</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Crear cuenta de paciente</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Registro</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} placeholder="María" placeholderTextColor={colors.textMuted} value={form.first_name} onChangeText={handleChange('first_name')} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Apellido</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} placeholder="García" placeholderTextColor={colors.textMuted} value={form.last_name} onChangeText={handleChange('last_name')} />
            </View>
          </View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Correo electrónico</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} keyboardType="email-address" autoCapitalize="none" placeholder="tu@correo.com" placeholderTextColor={colors.textMuted} value={form.email} onChangeText={handleChange('email')} />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Teléfono (opcional)</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} placeholder="+505 8888 8888" placeholderTextColor={colors.textMuted} value={form.phone} onChangeText={handleChange('phone')} />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Contraseña</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} secureTextEntry placeholder="Mínimo 6 caracteres" placeholderTextColor={colors.textMuted} value={form.password} onChangeText={handleChange('password')} />
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Crear cuenta</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/login')} style={styles.linkBtn}>
            <Text style={[styles.linkText, { color: colors.primary }]}>¿Ya tienes cuenta? Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brand: { alignItems: 'center', marginBottom: 28 },
  logoWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoIcon: { fontSize: 28 },
  logo: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  card: { borderRadius: 16, padding: 24, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 14 },
  btn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  linkText: { fontSize: 14 },
})
