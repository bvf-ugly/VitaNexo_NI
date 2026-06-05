import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const IS_DEMO = window.location.hostname.includes('github.io')

const TOKEN_KEY = 'vn_token'
const REFRESH_KEY = 'vn_refresh'
const USER_KEY = 'vn_user'

function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

function getRefreshToken() {
  try { return localStorage.getItem(REFRESH_KEY) } catch { return null }
}

function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {}
}

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

/** Obtiene el patientId del usuario logueado (solo funciona para rol patient) */
export async function getMyPatientId(): Promise<string | null> {
  if (IS_DEMO) return 'demo-patient-001'
  try {
    const { data } = await api.get('/patients/me')
    return data?._id || null
  } catch {
    return null
  }
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (IS_DEMO) return Promise.reject(err)
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearAuth()
        window.location.href = '/#/login'
        return Promise.reject(err)
      }
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
        localStorage.setItem(TOKEN_KEY, data.accessToken)
        localStorage.setItem(REFRESH_KEY, data.refreshToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        clearAuth()
        window.location.href = '/#/login'
      }
    }
    return Promise.reject(err)
  }
)

export { IS_DEMO }
export default api
