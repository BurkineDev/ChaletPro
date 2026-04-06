import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CalendarView from '@/components/dashboard/CalendarView'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Booking, Property } from '@/types'

export const dynamic = 'force-dynamic'

const platformColors: Record<string, string> = {
  airbnb: 'bg-red-100 text-red-700',
  vrbo: 'bg-blue-100 text-blue-700',
  booking: 'bg-indigo-100 text-indigo-700',
  direct: 'bg-green-100 text-green-700',
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmée',
  pending: 'En attente',
  cancelled: 'Annulée',
}

export default async function BookingsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('name')

  const propertyList: Property[] = properties ?? []
  const propertyIds = propertyList.map((p) => p.id)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .in('property_id', propertyIds.length > 0 ? propertyIds : ['none'])
    .order('check_in', { ascending: false })

  const bookingList: Booking[] = bookings ?? []

  const propertyMap = Object.fromEntries(propertyList.map((p) => [p.id, p]))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
        <p className="text-sm text-gray-500">
          Vue calendrier et liste de toutes vos réservations.
        </p>
      </div>

      {/* Calendar view */}
      <CalendarView bookings={bookingList} properties={propertyList} />

      {/* List view */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Liste des réservations ({bookingList.length})
        </h2>

        {bookingList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
            <p className="text-sm text-gray-500">
              Aucune réservation trouvée. Ajoutez un lien iCal à vos chalets.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-snow-50">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Chalet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Voyageur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Arrivée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Départ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Plateforme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookingList.map((booking) => {
                  const property = propertyMap[booking.property_id]
                  const platformColor =
                    platformColors[booking.platform ?? ''] ?? 'bg-gray-100 text-gray-700'
                  const statusColor =
                    statusColors[booking.status] ?? 'bg-gray-100 text-gray-700'

                  return (
                    <tr
                      key={booking.id}
                      className="transition-colors hover:bg-snow-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {property?.name ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {booking.guest_name ?? 'Inconnu'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {format(parseISO(booking.check_in), 'dd MMM yyyy', {
                          locale: fr,
                        })}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {format(parseISO(booking.check_out), 'dd MMM yyyy', {
                          locale: fr,
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {booking.platform ? (
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${platformColor}`}
                          >
                            {booking.platform}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
                        >
                          {statusLabels[booking.status] ?? booking.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
