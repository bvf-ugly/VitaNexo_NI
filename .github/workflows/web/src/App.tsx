import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context.tsx'
import LoginPage        from './pages/LoginPage.tsx'
import RegisterPage     from './pages/RegisterPage.tsx'
import Layout           from './components/Layout.tsx'
import DashboardPage    from './pages/DashboardPage.tsx'
import GlucosePage      from './pages/GlucosePage.tsx'
import AppointmentsPage from './pages/AppointmentsPage.tsx'
import PatientsPage     from './pages/PatientsPage.tsx'
import VitalsPage       from './pages/VitalsPage.tsx'
import MedicationsPage  from './pages/MedicationsPage.tsx'
import RecordPage       from './pages/RecordPage.tsx'
import ProfilePage      from './pages/ProfilePage.tsx'
import AlertsPage       from './pages/Alerts.tsx'

function Guard({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function RoleRoute({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={<Guard><Layout /></Guard>}>
        <Route index                   element={<DashboardPage />} />
        <Route path="glucose"          element={<GlucosePage />} />
        <Route path="vitals"           element={<VitalsPage />} />
        <Route path="appointments"     element={<AppointmentsPage />} />
        <Route path="medications"      element={<MedicationsPage />} />
        <Route path="record"           element={<RecordPage />} />
        <Route path="alerts"           element={<AlertsPage />} />
        <Route path="profile"          element={<ProfilePage />} />
        <Route path="patients"         element={
          <RoleRoute roles={['doctor','admin']}><PatientsPage /></RoleRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
