import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Mountain,
  LayoutDashboard,
  Home,
  CalendarDays,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/properties', label: 'Mes chalets', icon: Home },
  { href: '/bookings', label: 'Réservations', icon: CalendarDays },
  { href: '/team', label: 'Mon équipe', icon: Users },
  { href: '/settings', label: 'Paramètres', icon: Settings },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-snow-100">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-5">
          <Mountain className="h-6 w-6 text-mountain-600" />
          <span className="text-lg font-bold text-gray-900">
            Châlet<span className="text-mountain-600">Pro</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-mountain-50 hover:text-mountain-700"
              >
                <Icon className="h-4 w-4 text-gray-500 group-hover:text-mountain-600" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mountain-100 text-xs font-bold text-mountain-700">
              {(profile?.full_name ?? user.email ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {profile?.full_name ?? user.email}
              </p>
              <p className="text-xs capitalize text-mountain-600">
                Plan {profile?.plan ?? 'gratuit'}
              </p>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-all hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
