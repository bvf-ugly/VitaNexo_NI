import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Background from '../Background'
import { useThemeStore } from '../../store/themeStore'

export default function DashboardLayout() {
  const isDark = useThemeStore((s) => s.isDark)

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-[#0F172A]' : 'bg-[#FAF5FF]'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
