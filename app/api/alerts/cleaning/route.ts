import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS, buildCleaningAlertMessage } from '@/lib/twilio'
import { sendCleaningAlertEmail } from '@/lib/resend'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { AlertChannel } from '@/types'

interface TriggerAlertRequest {
  bookingId: string
  teamMemberIds?: string[]
  channel?: AlertChannel
}

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: TriggerAlertRequest
  try {
    body = await request.json() as TriggerAlertRequest
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { bookingId, teamMemberIds, channel } = body

  if (!bookingId) {
    return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
  }

  // Fetch booking with property (verify ownership)
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*, property:properties(*)')
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Verify ownership
  const property = booking.property as {
    id: string
    name: string
    address: string | null
    checkout_time: string | null
    notes: string | null
    owner_id: string
  }

  if (property.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get team members
  let teamQuery = supabase
    .from('team_members')
    .select('*')
    .eq('property_id', property.id)
    .eq('active', true)

  if (teamMemberIds && teamMemberIds.length > 0) {
    teamQuery = teamQuery.in('id', teamMemberIds)
  }

  const { data: teamMembers, error: teamError } = await teamQuery

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 500 })
  }

  if (!teamMembers || teamMembers.length === 0) {
    return NextResponse.json({ error: 'No active team members found for this property' }, { status: 404 })
  }

  const checkoutDate = format(parseISO(booking.check_out as string), 'dd MMMM yyyy', {
    locale: fr,
  })

  const results = []

  for (const member of teamMembers) {
    const alertChannel = (channel ?? member.preferred_channel) as AlertChannel
    const message = buildCleaningAlertMessage({
      propertyName: property.name,
      guestName: booking.guest_name as string | null,
      checkoutDate,
      checkoutTime: property.checkout_time ?? '11:00',
      notes: property.notes,
    })

    // Insert alert record
    const { data: alertRecord, error: alertInsertError } = await supabase
      .from('cleaning_alerts')
      .insert({
        booking_id: bookingId,
        team_member_id: member.id,
        channel: alertChannel,
        message,
        status: 'pending',
      })
      .select()
      .single()

    if (alertInsertError || !alertRecord) {
      results.push({ memberId: member.id, success: false, error: 'Failed to create alert record' })
      continue
    }

    let success = false
    let errorMsg: string | null = null

    if (alertChannel === 'sms' && member.phone) {
      const smsResult = await sendSMS(member.phone, message)
      success = smsResult.success
      errorMsg = smsResult.error ?? null
    } else if (alertChannel === 'email' && member.phone) {
      // Use phone field as email if needed — or use a dedicated email field
      const emailResult = await sendCleaningAlertEmail({
        to: member.phone, // This would be email in a real scenario
        teamMemberName: member.name,
        propertyName: property.name,
        propertyAddress: property.address,
        guestName: booking.guest_name as string | null,
        checkoutDate,
        checkoutTime: property.checkout_time ?? '11:00',
        notes: property.notes,
      })
      success = emailResult.success
      errorMsg = emailResult.error ?? null
    } else {
      errorMsg = `No valid contact for channel: ${alertChannel}`
    }

    // Update alert record
    await supabase
      .from('cleaning_alerts')
      .update({
        status: success ? 'sent' : 'failed',
        sent_at: success ? new Date().toISOString() : null,
        error_message: errorMsg,
      })
      .eq('id', alertRecord.id)

    results.push({
      memberId: member.id,
      memberName: member.name,
      channel: alertChannel,
      success,
      error: errorMsg,
    })
  }

  // Mark booking alert_sent_at if any succeeded
  const anySucceeded = results.some((r) => r.success)
  if (anySucceeded) {
    await supabase
      .from('bookings')
      .update({ alert_sent_at: new Date().toISOString() })
      .eq('id', bookingId)
  }

  return NextResponse.json({
    success: anySucceeded,
    results,
    bookingId,
  })
}
