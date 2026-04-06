import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrRetrieveCustomer, createCheckoutSession } from '@/lib/stripe'

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const formData = await request.formData()
  const priceId = formData.get('priceId') as string | null

  if (!priceId) {
    return NextResponse.json({ error: 'priceId is required' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const customerId = await createOrRetrieveCustomer(user.id, user.email!)

    // Update profile with customer ID
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)

    const sessionUrl = await createCheckoutSession(
      customerId,
      priceId,
      user.id,
      `${appUrl}/settings?success=true`,
      `${appUrl}/settings?canceled=true`
    )

    return NextResponse.redirect(sessionUrl, { status: 303 })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Checkout error'
    console.error('Stripe checkout error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
