'use client'

import { useState } from 'react'
import { Home, MapPin, RefreshCw, Settings, Wifi, WifiOff } from 'lucide-react'
import type { Property } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface PropertyCardProps {
  property: Property
  bookingCount?: number
  onSync?: (propertyId: string) => Promise<void>
}

export default function PropertyCard({
  property,
  bookingCount = 0,
  onSync,
}: PropertyCardProps) {
  const [syncing, setSyncing] = useState(false)

  async function handleSync() {
    if (!onSync) return
    setSyncing(true)
    try {
      await onSync(property.id)
    } finally {
      setSyncing(false)
    }
  }

  const lastSynced = property.last_synced_at
    ? formatDistanceToNow(new Date(property.last_synced_at), {
        addSuffix: true,
        locale: fr,
      })
    : null

  return (
    <div className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-mountain-200 hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mountain-100">
            <Home className="h-5 w-5 text-mountain-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{property.name}</h3>
            {property.address && (
              <p className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                {property.address}
              </p>
            )}
          </div>
        </div>
        <a
          href={`/properties/${property.id}`}
          className="text-gray-400 transition-colors hover:text-mountain-600"
        >
          <Settings className="h-4 w-4" />
        </a>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-snow-100 p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{bookingCount}</p>
          <p className="text-xs text-gray-500">Réservations</p>
        </div>
        <div className="rounded-lg bg-snow-100 p-3 text-center">
          <p className="text-xl font-bold text-gray-900">
            {property.checkout_time ?? '11:00'}
          </p>
          <p className="text-xs text-gray-500">Départ</p>
        </div>
      </div>

      {/* iCal status */}
      <div className="mb-4 flex items-center gap-2">
        {property.ical_url ? (
          <>
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-xs text-gray-600">
              iCal connecté
              {lastSynced && ` · synchronisé ${lastSynced}`}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">Aucun iCal configuré</span>
          </>
        )}
      </div>

      {/* Actions */}
      {property.ical_url && onSync && (
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center justify-center gap-2 rounded-lg border border-mountain-200 py-2 text-xs font-medium text-mountain-700 transition-all hover:bg-mountain-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
        </button>
      )}
    </div>
  )
}
