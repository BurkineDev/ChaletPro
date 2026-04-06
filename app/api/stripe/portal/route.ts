import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createBillingPortalSession } from '@/lib/stripe'

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No Stripe customer found. Please subscribe first.' },
      { status: 400 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const portalUrl = await createBillingPortalSession(
      profile.stripe_customer_id,
      `${appUrl}/settings`
    )

    return NextResponse.redirect(portalUrl, { status: 303 })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Portal error'
    console.error('Stripe portal error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
