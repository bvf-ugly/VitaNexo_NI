import axios from 'axios'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

// Auto-detect API URL por plataforma
// En emulador Android, 10.0.2.2 apunta al host
// En iOS simulator, localhost funciona
// En dispositivo físico, debe configurarse EXPO_PUBLIC_API_URL
function getDefaultURL() {
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api'
  return 'http://localhost:5000/api'
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultURL()

const api = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Tiempo de espera agotado. Verifica que el backend esté corriendo.'))
    }
    if (!err.response) {
      return Promise.reject(new Error('No se puede conectar al servidor. Verifica tu conexión y que el backend esté activo.'))
    }
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
        await SecureStore.setItemAsync('accessToken', data.accessToken)
        await SecureStore.setItemAsync('refreshToken', data.refreshToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        await SecureStore.deleteItemAsync('accessToken')
        await SecureStore.deleteItemAsync('refreshToken')
        await SecureStore.deleteItemAsync('user')
      }
    }
    return Promise.reject(err)
  }
)

/** Obtiene el patientId del usuario logueado (solo rol patient) */
export async function getMyPatientId(): Promise<string | null> {
  try {
    const { data } = await api.get('/patients/me')
    return data?._id || null
  } catch { return null }
}

export { API_URL }
export default api
