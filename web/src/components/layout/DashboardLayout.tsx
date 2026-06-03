import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useThemeStore } from '../../store/themeStore'

export default function DashboardLayout() {
  const isDark = useThemeStore((s) => s.isDark)

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Background decoration */}
          <div
            className="fixed inset-0 pointer-events-none -z-10"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse at 20% 30%, rgba(14,165,233,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(139,92,246,0.04) 0%, transparent 50%)'
                : 'radial-gradient(ellipse at 20% 30%, rgba(14,165,233,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(139,92,246,0.05) 0%, transparent 50%)',
            }}
          />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
