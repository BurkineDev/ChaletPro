import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchAndParseICal } from '@/lib/ical'
import { sendSMS, buildCleaningAlertMessage } from '@/lib/twilio'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Property, TeamMember } from '@/types'

interface SyncResult {
  propertyId: string
  propertyName: string
  bookingsUpserted: number
  alertsTriggered: number
  error?: string
}

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Optionally accept a specific propertyId
  let specificPropertyId: string | null = null
  try {
    const body = await request.json() as { propertyId?: string }
    specificPropertyId = body.propertyId ?? null
  } catch {
    // No body or invalid JSON — sync all properties
  }

  // Get all properties with iCal URLs for this user
  let query = supabase
    .from('properties')
    .select('*')
    .eq('owner_id', user.id)
    .not('ical_url', 'is', null)

  if (specificPropertyId) {
    query = query.eq('id', specificPropertyId)
  }

  const { data: properties, error: propertiesError } = await query

  if (propertiesError) {
    return NextResponse.json({ error: propertiesError.message }, { status: 500 })
  }

  const propertyList: Property[] = properties ?? []

  if (propertyList.length === 0) {
    return NextResponse.json({ message: 'No properties with iCal URLs found', synced: 0 })
  }

  const results: SyncResult[] = []

  for (const property of propertyList) {
    if (!property.ical_url) continue

    const result: SyncResult = {
      propertyId: property.id,
      propertyName: property.name,
      bookingsUpserted: 0,
      alertsTriggered: 0,
    }

    try {
      // Fetch and parse iCal
      const parsedBookings = await fetchAndParseICal(property.ical_url)

      // Upsert bookings into DB
      if (parsedBookings.length > 0) {
        const bookingsToUpsert = parsedBookings.map((b) => ({
          property_id: property.id,
          external_uid: b.external_uid,
          guest_name: b.guest_name,
          guest_email: b.guest_email,
          guest_phone: null,
          check_in: b.check_in,
          check_out: b.check_out,
          platform: b.platform,
          status: b.status,
        }))

        const { error: upsertError } = await supabase
          .from('bookings')
          .upsert(bookingsToUpsert, {
            onConflict: 'property_id,external_uid',
            ignoreDuplicates: false,
          })

        if (upsertError) {
          console.error(`Upsert error for property ${property.id}:`, upsertError)
          result.error = upsertError.message
        } else {
          result.bookingsUpserted = parsedBookings.length
        }
      }

      // Update last_synced_at
      await supabase
        .from('properties')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', property.id)

      // Check for bookings with checkouts today or tomorrow that need alerts
      const { data: upcomingCheckouts } = await supabase
        .from('bookings')
        .select('*')
        .eq('property_id', property.id)
        .eq('status', 'confirmed')
        .is('alert_sent_at', null)

      const bookingsNeedingAlerts = (upcomingCheckouts ?? []).filter((booking) => {
        const checkOut = parseISO(booking.check_out as string)
        return isToday(checkOut) || isTomorrow(checkOut)
      })

      if (bookingsNeedingAlerts.length > 0) {
        // Get team members for this property (cleaning role, active)
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select('*')
          .eq('property_id', property.id)
          .eq('role', 'cleaning')
          .eq('active', true)

        const cleaners: TeamMember[] = teamMembers ?? []

        for (const booking of bookingsNeedingAlerts) {
          for (const cleaner of cleaners) {
            const checkoutDate = format(parseISO(booking.check_out as string), 'dd MMMM yyyy', {
              locale: fr,
            })

            const message = buildCleaningAlertMessage({
              propertyName: property.name,
              guestName: booking.guest_name as string | null,
              checkoutDate,
              checkoutTime: property.checkout_time ?? '11:00',
              notes: property.notes,
            })

            // Record alert in DB first
            const { data: alertRecord, error: alertInsertError } = await supabase
              .from('cleaning_alerts')
              .insert({
                booking_id: booking.id,
                team_member_id: cleaner.id,
                channel: cleaner.preferred_channel === 'sms' ? 'sms' : 'sms', // default to SMS for now
                message,
                status: 'pending',
              })
              .select()
              .single()

            if (alertInsertError || !alertRecord) continue

            // Send via SMS if phone available
            let alertStatus = 'pending'
            let errorMessage: string | null = null

            if (cleaner.phone && cleaner.preferred_channel === 'sms') {
              const smsResult = await sendSMS(cleaner.phone, message)
              alertStatus = smsResult.success ? 'sent' : 'failed'
              errorMessage = smsResult.error ?? null
            }

            // Update alert status
            await supabase
              .from('cleaning_alerts')
              .update({
                status: alertStatus,
                sent_at: alertStatus === 'sent' ? new Date().toISOString() : null,
                error_message: errorMessage,
              })
              .eq('id', alertRecord.id)

            if (alertStatus === 'sent') {
              result.alertsTriggered++
            }
          }

          // Mark booking as alerted
          await supabase
            .from('bookings')
            .update({ alert_sent_at: new Date().toISOString() })
            .eq('id', booking.id)
        }
      }
    } catch (err) {
      result.error = err instanceof Error ? err.message : 'Unknown error'
      console.error(`Error syncing property ${property.id}:`, result.error)
    }

    results.push(result)
  }

  const totalBookingsUpserted = results.reduce((sum, r) => sum + r.bookingsUpserted, 0)
  const totalAlertsTriggered = results.reduce((sum, r) => sum + r.alertsTriggered, 0)

  return NextResponse.json({
    success: true,
    propertiesSynced: results.length,
    totalBookingsUpserted,
    totalAlertsTriggered,
    results,
  })
}
