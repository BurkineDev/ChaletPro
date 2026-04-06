import ICAL from 'ical.js'
import type { ParsedBooking, Platform, BookingStatus } from '@/types'

function detectPlatform(uid: string, summary: string): Platform | null {
  const lowerUid = uid.toLowerCase()
  const lowerSummary = summary.toLowerCase()

  if (lowerUid.includes('airbnb') || lowerSummary.includes('airbnb')) {
    return 'airbnb'
  }
  if (lowerUid.includes('vrbo') || lowerSummary.includes('vrbo') || lowerSummary.includes('homeaway')) {
    return 'vrbo'
  }
  if (lowerUid.includes('booking') || lowerSummary.includes('booking.com')) {
    return 'booking'
  }
  return 'direct'
}

function formatDate(date: ICAL.Time): string {
  const jsDate = date.toJSDate()
  // Return YYYY-MM-DD
  return jsDate.toISOString().split('T')[0]
}

function extractGuestName(summary: string): string | null {
  // Airbnb: "Reservation - John Smith" or "CLOSED - Not available"
  // VRBO: "Reserved - John Smith (HH1234567)"
  const patterns = [
    /reservation\s*-\s*(.+)/i,
    /reserved\s*-\s*(.+?)(?:\s*\(.*\))?$/i,
    /booking\s*-\s*(.+)/i,
    /^(.+?)\s*\(confirmed\)/i,
  ]

  for (const pattern of patterns) {
    const match = summary.match(pattern)
    if (match && match[1]) {
      const name = match[1].trim()
      // Filter out generic messages
      if (!name.toLowerCase().includes('not available') && !name.toLowerCase().includes('blocked')) {
        return name
      }
    }
  }

  return null
}

function isBlockedEvent(summary: string): boolean {
  const blockedTerms = [
    'not available',
    'blocked',
    'owner block',
    'maintenance',
    'unavailable',
    'airbnb (not available)',
    'vrbo (not available)',
  ]
  const lower = summary.toLowerCase()
  return blockedTerms.some((term) => lower.includes(term))
}

export async function fetchAndParseICal(url: string): Promise<ParsedBooking[]> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ChâletPro/1.0 (iCal sync)',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} fetching iCal: ${url}`)
    }

    const icalText = await response.text()
    return parseICalText(icalText)
  } finally {
    clearTimeout(timeoutId)
  }
}

export function parseICalText(icalText: string): ParsedBooking[] {
  const jcalData = ICAL.parse(icalText)
  const comp = new ICAL.Component(jcalData)
  const vevents = comp.getAllSubcomponents('vevent')

  const bookings: ParsedBooking[] = []

  for (const vevent of vevents) {
    try {
      const event = new ICAL.Event(vevent)
      const uid = event.uid
      const summary = event.summary ?? ''
      const description = event.description ?? ''

      // Skip blocked/unavailable events
      if (isBlockedEvent(summary)) continue

      // Skip events without proper dates
      if (!event.startDate || !event.endDate) continue

      const checkIn = formatDate(event.startDate)
      const checkOut = formatDate(event.endDate)

      // Skip past events older than 30 days
      const checkOutDate = new Date(checkOut)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      if (checkOutDate < thirtyDaysAgo) continue

      const guestName = extractGuestName(summary)
      const platform = detectPlatform(uid, summary)

      // Try to extract email from description
      const emailMatch = description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
      const guestEmail = emailMatch ? emailMatch[1] : null

      // Determine status
      let status: BookingStatus = 'confirmed'
      const statusProp = vevent.getFirstPropertyValue('status') as string | null
      if (statusProp) {
        if (statusProp === 'CANCELLED') status = 'cancelled'
        else if (statusProp === 'TENTATIVE') status = 'pending'
      }

      bookings.push({
        external_uid: uid,
        guest_name: guestName,
        guest_email: guestEmail,
        check_in: checkIn,
        check_out: checkOut,
        platform,
        status,
      })
    } catch {
      // Skip malformed events
      continue
    }
  }

  return bookings
}
