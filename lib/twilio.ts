import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

export function getTwilioClient() {
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials are not configured')
  }
  return twilio(accountSid, authToken)
}

export async function sendSMS(to: string, body: string): Promise<SMSResult> {
  if (!fromNumber) {
    return { success: false, error: 'TWILIO_PHONE_NUMBER not configured' }
  }

  // Normalize phone number
  const normalizedTo = normalizePhoneNumber(to)
  if (!normalizedTo) {
    return { success: false, error: `Invalid phone number: ${to}` }
  }

  try {
    const client = getTwilioClient()
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to: normalizedTo,
    })

    return {
      success: true,
      messageId: message.sid,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown Twilio error'
    console.error('Twilio SMS error:', errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  }
}

function normalizePhoneNumber(phone: string): string | null {
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '')

  // Already in E.164 format
  if (cleaned.startsWith('+')) {
    return cleaned.length >= 8 ? cleaned : null
  }

  // North American numbers (10 digits)
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }

  // 11-digit starting with 1 (North American with country code)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`
  }

  return null
}

export function buildCleaningAlertMessage(params: {
  propertyName: string
  guestName: string | null
  checkoutDate: string
  checkoutTime: string
  notes?: string | null
}): string {
  const { propertyName, guestName, checkoutDate, checkoutTime, notes } = params

  const guestPart = guestName ? ` (${guestName})` : ''

  let message = `🏠 ChâletPro — Alerte ménage\n`
  message += `Chalet: ${propertyName}\n`
  message += `Départ${guestPart}: ${checkoutDate} à ${checkoutTime}\n`

  if (notes) {
    message += `\nNotes: ${notes}`
  }

  message += `\nMerci!`

  return message
}

export function buildCheckoutReminderMessage(params: {
  propertyName: string
  guestName: string | null
  checkoutTime: string
}): string {
  const { propertyName, guestName, checkoutTime } = params
  const greeting = guestName ? `Bonjour ${guestName}` : 'Bonjour'

  return `${greeting},\n\nRappel: votre départ du ${propertyName} est prévu pour ${checkoutTime} demain.\n\nMerci de votre séjour! / Thank you for your stay!\n\nChâletPro`
}
