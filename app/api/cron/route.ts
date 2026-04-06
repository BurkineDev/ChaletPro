import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { fetchAndParseICal } from '@/lib/ical'
import { sendSMS, buildCleaningAlertMessage } from '@/lib/twilio'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Property, TeamMember } from '@/types'

// This endpoint is called by Railway cron or an external cron service
// Protect it with a secret token

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret') ?? request.headers.get('x-cron-secret')

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use service role client to access all properties
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )

  console.log('[CRON] Starting iCal sync job at', new Date().toISOString())

  // Get all properties with iCal URLs
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .not('ical_url', 'is', null)

  if (propertiesError) {
    console.error('[CRON] Failed to fetch properties:', propertiesError)
    return NextResponse.json({ error: propertiesError.message }, { status: 500 })
  }

  const propertyList: Property[] = properties ?? []
  console.log(`[CRON] Syncing ${propertyList.length} properties`)

  let totalBookingsUpserted = 0
  let totalAlertsTriggered = 0
  let errors = 0

  for (const property of propertyList) {
    if (!property.ical_url) continue

    try {
      // Parse iCal
      const parsedBookings = await fetchAndParseICal(property.ical_url)

      // Upsert bookings
      if (parsedBookings.length > 0) {
        const { error: upsertError } = await supabase
          .from('bookings')
          .upsert(
            parsedBookings.map((b) => ({
              property_id: property.id,
              external_uid: b.external_uid,
              guest_name: b.guest_name,
              guest_email: b.guest_email,
              guest_phone: null,
              check_in: b.check_in,
              check_out: b.check_out,
              platform: b.platform,
              status: b.status,
            })),
            { onConflict: 'property_id,external_uid', ignoreDuplicates: false }
          )

        if (upsertError) {
          console.error(`[CRON] Upsert error for property ${property.id}:`, upsertError)
          errors++
        } else {
          totalBookingsUpserted += parsedBookings.length
        }
      }

      // Update last_synced_at
      await supabase
        .from('properties')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', property.id)

      // Check for checkouts needing alerts
      const { data: checkouts } = await supabase
        .from('bookings')
        .select('*')
        .eq('property_id', property.id)
        .eq('status', 'confirmed')
        .is('alert_sent_at', null)

      const bookingsNeedingAlerts = (checkouts ?? []).filter((booking) => {
        const checkOut = parseISO(booking.check_out as string)
        return isToday(checkOut) || isTomorrow(checkOut)
      })

      if (bookingsNeedingAlerts.length > 0) {
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select('*')
          .eq('property_id', property.id)
          .eq('role', 'cleaning')
          .eq('active', true)

        const cleaners: TeamMember[] = teamMembers ?? []

        for (const booking of bookingsNeedingAlerts) {
          for (const cleaner of cleaners) {
            const checkoutDate = format(
              parseISO(booking.check_out as string),
              'dd MMMM yyyy',
              { locale: fr }
            )

            const message = buildCleaningAlertMessage({
              propertyName: property.name,
              guestName: booking.guest_name as string | null,
              checkoutDate,
              checkoutTime: property.checkout_time ?? '11:00',
              notes: property.notes,
            })

            const { data: alertRecord } = await supabase
              .from('cleaning_alerts')
              .insert({
                booking_id: booking.id,
                team_member_id: cleaner.id,
                channel: 'sms',
                message,
                status: 'pending',
              })
              .select()
              .single()

            if (!alertRecord) continue

            let alertStatus = 'pending'
            let errorMessage: string | null = null

            if (cleaner.phone) {
              const smsResult = await sendSMS(cleaner.phone, message)
              alertStatus = smsResult.success ? 'sent' : 'failed'
              errorMessage = smsResult.error ?? null

              if (smsResult.success) totalAlertsTriggered++
            }

            await supabase
              .from('cleaning_alerts')
              .update({
                status: alertStatus,
                sent_at: alertStatus === 'sent' ? new Date().toISOString() : null,
                error_message: errorMessage,
              })
              .eq('id', alertRecord.id)
          }

          await supabase
            .from('bookings')
            .update({ alert_sent_at: new Date().toISOString() })
            .eq('id', booking.id)
        }
      }
    } catch (err) {
      console.error(`[CRON] Error for property ${property.id}:`, err)
      errors++
    }
  }

  const summary = {
    success: true,
    timestamp: new Date().toISOString(),
    propertiesProcessed: propertyList.length,
    totalBookingsUpserted,
    totalAlertsTriggered,
    errors,
  }

  console.log('[CRON] Job complete:', summary)

  return NextResponse.json(summary)
}
