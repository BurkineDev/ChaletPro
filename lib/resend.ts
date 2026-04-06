import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'ChâletPro <no-reply@chaletpro.ca>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.chaletpro.ca'

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

// Guest checkout reminder
export async function sendCheckoutReminder(params: {
  to: string
  guestName: string | null
  propertyName: string
  checkoutDate: string
  checkoutTime: string
  propertyNotes?: string | null
}): Promise<EmailResult> {
  const { to, guestName, propertyName, checkoutDate, checkoutTime, propertyNotes } = params
  const greeting = guestName ? `Bonjour ${guestName} / Hello ${guestName}` : 'Bonjour / Hello'

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Rappel de départ — ${propertyName} / Checkout Reminder — ${propertyName}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #035da1; font-size: 24px;">ChâletPro</h1>
          </div>

          <div style="background: #f0f7ff; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 16px;">${greeting},</p>
            <p style="margin: 0; color: #444;">Voici un rappel pour votre départ / Here is a reminder for your checkout:</p>
          </div>

          <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%;">
              <tr>
                <td style="color: #666; padding: 8px 0; font-size: 14px;">Chalet / Property:</td>
                <td style="font-weight: 600; text-align: right; padding: 8px 0;">${propertyName}</td>
              </tr>
              <tr>
                <td style="color: #666; padding: 8px 0; font-size: 14px; border-top: 1px solid #f1f5f9;">Date de départ / Checkout date:</td>
                <td style="font-weight: 600; text-align: right; padding: 8px 0; border-top: 1px solid #f1f5f9;">${checkoutDate}</td>
              </tr>
              <tr>
                <td style="color: #666; padding: 8px 0; font-size: 14px; border-top: 1px solid #f1f5f9;">Heure de départ / Checkout time:</td>
                <td style="font-weight: 600; text-align: right; padding: 8px 0; border-top: 1px solid #f1f5f9;">${checkoutTime}</td>
              </tr>
            </table>
          </div>

          ${propertyNotes ? `
          <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #7c2d12;"><strong>Instructions spéciales / Special instructions:</strong></p>
            <p style="margin: 8px 0 0; font-size: 14px; color: #7c2d12;">${propertyNotes}</p>
          </div>
          ` : ''}

          <p style="color: #444; font-size: 14px;">
            Veuillez vous assurer que toutes vos affaires sont ramassées avant l'heure de départ.<br>
            Please ensure all your belongings are collected before checkout time.
          </p>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #888; font-size: 12px;">
            <p>Merci de votre séjour! / Thank you for your stay!</p>
            <p><a href="${APP_URL}" style="color: #035da1;">ChâletPro</a> — Gestion de chalets à Mont-Tremblant</p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Resend email error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Cleaning alert email to team member
export async function sendCleaningAlertEmail(params: {
  to: string
  teamMemberName: string
  propertyName: string
  propertyAddress: string | null
  guestName: string | null
  checkoutDate: string
  checkoutTime: string
  notes?: string | null
}): Promise<EmailResult> {
  const {
    to,
    teamMemberName,
    propertyName,
    propertyAddress,
    guestName,
    checkoutDate,
    checkoutTime,
    notes,
  } = params

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Alerte ménage — ${propertyName} le ${checkoutDate}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"></head>
        <body style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #035da1; font-size: 24px;">🏠 ChâletPro — Alerte ménage</h1>
          </div>

          <p>Bonjour ${teamMemberName},</p>
          <p>Un ménage est requis au chalet suivant:</p>

          <div style="border: 2px solid #0e93e8; border-radius: 12px; padding: 20px; margin: 24px 0; background: #f0f7ff;">
            <h2 style="margin: 0 0 16px; color: #035da1;">${propertyName}</h2>
            <table style="width: 100%;">
              ${propertyAddress ? `
              <tr>
                <td style="color: #666; padding: 6px 0; font-size: 14px;">Adresse:</td>
                <td style="font-weight: 600; text-align: right; padding: 6px 0;">${propertyAddress}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="color: #666; padding: 6px 0; font-size: 14px; border-top: 1px solid #bae0fd;">Voyageur:</td>
                <td style="font-weight: 600; text-align: right; padding: 6px 0; border-top: 1px solid #bae0fd;">${guestName ?? 'Non précisé'}</td>
              </tr>
              <tr>
                <td style="color: #666; padding: 6px 0; font-size: 14px; border-top: 1px solid #bae0fd;">Date de départ:</td>
                <td style="font-weight: 600; text-align: right; padding: 6px 0; border-top: 1px solid #bae0fd;">${checkoutDate}</td>
              </tr>
              <tr>
                <td style="color: #666; padding: 6px 0; font-size: 14px; border-top: 1px solid #bae0fd;">Heure de départ:</td>
                <td style="font-weight: 600; color: #d97706; text-align: right; padding: 6px 0; border-top: 1px solid #bae0fd; font-size: 18px;">${checkoutTime}</td>
              </tr>
            </table>
          </div>

          ${notes ? `
          <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px;"><strong>Notes importantes:</strong></p>
            <p style="margin: 8px 0 0; font-size: 14px;">${notes}</p>
          </div>
          ` : ''}

          <p style="color: #444; font-size: 14px;">Merci pour votre travail!</p>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #888; font-size: 12px;">
            <p>Message envoyé automatiquement par <a href="${APP_URL}" style="color: #035da1;">ChâletPro</a></p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Resend email error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Magic link / welcome email (Supabase handles auth emails, but we can send welcome)
export async function sendWelcomeEmail(params: {
  to: string
  name?: string | null
}): Promise<EmailResult> {
  const { to, name } = params
  const greeting = name ? `Bonjour ${name}` : 'Bonjour'

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Bienvenue sur ChâletPro!',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"></head>
        <body style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #035da1;">Bienvenue sur ChâletPro! 🏔️</h1>
          </div>

          <p>${greeting},</p>
          <p>Merci de vous être inscrit à ChâletPro. Votre compte est maintenant actif.</p>

          <div style="background: #f0f7ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px; color: #035da1;">Pour commencer:</h3>
            <ol style="margin: 0; padding-left: 20px; color: #444;">
              <li style="margin-bottom: 8px;">Ajoutez votre premier chalet</li>
              <li style="margin-bottom: 8px;">Connectez votre calendrier Airbnb ou VRBO</li>
              <li style="margin-bottom: 8px;">Ajoutez votre équipe de ménage</li>
              <li>Laissez ChâletPro gérer les alertes automatiquement!</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard" style="background: #035da1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Accéder à mon tableau de bord
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Des questions? Répondez à ce courriel ou écrivez-nous à <a href="mailto:support@chaletpro.ca" style="color: #035da1;">support@chaletpro.ca</a>
          </p>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #888; font-size: 12px;">
            <p>© ${new Date().getFullYear()} ChâletPro — Gestion de chalets à Mont-Tremblant</p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Resend email error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}
