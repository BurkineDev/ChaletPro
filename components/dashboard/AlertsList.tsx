import { Bell, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'
import type { CleaningAlert } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface AlertsListProps {
  alerts: CleaningAlert[]
}

const statusConfig = {
  pending: { label: 'En attente', icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
  sent: { label: 'Envoyée', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
  failed: { label: 'Échec', icon: XCircle, color: 'text-red-600 bg-red-100' },
}

const channelLabels = {
  sms: 'SMS',
  messenger: 'Messenger',
  email: 'Courriel',
}

export default function AlertsList({ alerts }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 text-center">
        <Bell className="mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">Aucune alerte récente</p>
        <p className="mt-1 text-xs text-gray-400">
          Les alertes apparaîtront ici lorsque des départs sont détectés.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const status = statusConfig[alert.status]
        const StatusIcon = status.icon
        const channel = channelLabels[alert.channel] ?? alert.channel

        return (
          <div
            key={alert.id}
            className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${status.color}`}>
              <StatusIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">
                  {alert.team_member?.name ?? 'Membre de l\'équipe'}
                </p>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{channel}</span>
                </div>
              </div>
              <p className="mt-0.5 truncate text-xs text-gray-500">{alert.message}</p>
              {alert.sent_at && (
                <p className="mt-1 text-xs text-gray-400">
                  Envoyée le{' '}
                  {format(new Date(alert.sent_at), 'dd MMM yyyy à HH:mm', {
                    locale: fr,
                  })}
                </p>
              )}
              {alert.error_message && (
                <p className="mt-1 text-xs text-red-500">{alert.error_message}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
