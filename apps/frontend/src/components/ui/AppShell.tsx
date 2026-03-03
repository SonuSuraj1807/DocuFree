import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { LayoutDashboard, FileText, Settings, LogOut, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AppShell() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      <aside className="w-56 flex flex-col border-r border-surface-700 bg-surface-800 shrink-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-surface-700">
          <div className="w-7 h-7 bg-brand-500 rounded flex items-center justify-center">
            <FileText size={14} className="text-black" />
          </div>
          <span className="font-syne font-bold text-white text-base tracking-tight">DocuFree</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem to="/dashboard" icon={<LayoutDashboard size={15} />} label="Dashboard" />
          <NavItem to="/settings" icon={<Settings size={15} />} label="Settings" />
        </nav>

        <div className="mx-3 mb-3 p-3 rounded-lg bg-surface-700 border border-surface-600">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={12} className="text-brand-500" />
            <span className="text-xs font-medium text-brand-500 font-mono tracking-widest">AI READY</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            AI editing via OpenRouter free models
          </p>
        </div>

        <div className="border-t border-surface-700 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-black">
                {user?.displayName?.[0] ?? user?.email?.[0] ?? '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.displayName ?? 'User'}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="w-full mt-1 btn-ghost text-xs justify-start">
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all',
          isActive
            ? 'bg-surface-600 text-white font-medium'
            : 'text-[var(--text-secondary)] hover:text-white hover:bg-surface-700',
        )
      }
    >
      {icon}
      <span className="flex-1">{label}</span>
      <ChevronRight size={12} className="opacity-30" />
    </NavLink>
  )
}
