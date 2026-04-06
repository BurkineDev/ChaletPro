import { Home, CalendarDays, LogOut, Bell } from 'lucide-react'
import type { DashboardStats } from '@/types'

interface StatsBarProps {
  stats: DashboardStats
}

const statItems = [
  {
    key: 'totalProperties' as keyof DashboardStats,
    label: 'Chalets',
    icon: Home,
    color: 'text-mountain-600 bg-mountain-100',
  },
  {
    key: 'activeBookings' as keyof DashboardStats,
    label: 'Réservations actives',
    icon: CalendarDays,
    color: 'text-blue-600 bg-blue-100',
  },
  {
    key: 'upcomingCheckouts' as keyof DashboardStats,
    label: 'Départs à venir (7j)',
    icon: LogOut,
    color: 'text-orange-600 bg-orange-100',
  },
  {
    key: 'pendingAlerts' as keyof DashboardStats,
    label: 'Alertes en attente',
    icon: Bell,
    color: 'text-red-600 bg-red-100',
  },
]

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.key}
            className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats[item.key]}
              </p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
