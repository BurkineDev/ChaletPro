import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatsBar from '@/components/dashboard/StatsBar'
import PropertyCard from '@/components/dashboard/PropertyCard'
import AlertsList from '@/components/dashboard/AlertsList'
import CalendarView from '@/components/dashboard/CalendarView'
import { addDays, isWithinInterval, parseISO, startOfDay } from 'date-fns'
import { Plus } from 'lucide-react'
import type { DashboardStats, CleaningAlert, Property, Booking } from '@/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  const propertyList: Property[] = properties ?? []
  const propertyIds = propertyList.map((p) => p.id)

  // Fetch all bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .in('property_id', propertyIds.length > 0 ? propertyIds : ['none'])
    .order('check_in', { ascending: true })

  const bookingList: Booking[] = bookings ?? []

  // Fetch recent alerts
  const { data: alerts } = await supabase
    .from('cleaning_alerts')
    .select('*, team_member:team_members(*)')
    .in(
      'booking_id',
      bookingList.length > 0 ? bookingList.map((b) => b.id) : ['none']
    )
    .order('created_at', { ascending: false })
    .limit(10)

  const alertList: CleaningAlert[] = (alerts as CleaningAlert[]) ?? []

  // Compute stats
  const today = startOfDay(new Date())
  const sevenDaysFromNow = addDays(today, 7)

  const upcomingCheckouts = bookingList.filter((b) => {
    const checkOut = parseISO(b.check_out)
    return isWithinInterval(checkOut, { start: today, end: sevenDaysFromNow })
  }).length

  const activeBookings = bookingList.filter((b) => {
    const checkIn = parseISO(b.check_in)
    const checkOut = parseISO(b.check_out)
    return isWithinInterval(today, { start: checkIn, end: checkOut })
  }).length

  const pendingAlerts = alertList.filter((a) => a.status === 'pending').length

  const stats: DashboardStats = {
    totalProperties: propertyList.length,
    upcomingCheckouts,
    activeBookings,
    pendingAlerts,
  }

  // Booking count per property
  const bookingCountByProperty = bookingList.reduce<Record<string, number>>(
    (acc, b) => {
      acc[b.property_id] = (acc[b.property_id] ?? 0) + 1
      return acc
    },
    {}
  )

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500">
            Bienvenue sur ChâletPro — gérez vos chalets facilement.
          </p>
        </div>
        <Link
          href="/properties/new"
          className="inline-flex items-center gap-2 rounded-lg bg-mountain-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-mountain-500"
        >
          <Plus className="h-4 w-4" />
          Ajouter un chalet
        </Link>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Calendar - takes 2 columns */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Calendrier des réservations
          </h2>
          <CalendarView bookings={bookingList} properties={propertyList} />
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Properties */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Mes chalets</h2>
              <Link
                href="/properties"
                className="text-sm text-mountain-600 hover:underline"
              >
                Voir tout
              </Link>
            </div>
            {propertyList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
                <p className="text-sm text-gray-500">Aucun chalet configuré</p>
                <Link
                  href="/properties/new"
                  className="mt-2 inline-block text-sm text-mountain-600 hover:underline"
                >
                  Ajouter votre premier chalet →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {propertyList.slice(0, 3).map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    bookingCount={bookingCountByProperty[property.id] ?? 0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent alerts */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Alertes récentes
              </h2>
            </div>
            <AlertsList alerts={alertList} />
          </div>
        </div>
      </div>
    </div>
  )
}
