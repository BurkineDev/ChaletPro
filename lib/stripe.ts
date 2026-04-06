import Stripe from 'stripe'
import type { PricingPlan } from '@/types'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: 'CAD',
    description: 'Pour commencer',
    features: [
      '1 chalet',
      'Synchronisation iCal',
      'Alertes SMS (5/mois)',
      'Tableau de bord basique',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    currency: 'CAD',
    description: 'Pour les propriétaires sérieux',
    features: [
      '3 chalets',
      'Synchronisation iCal illimitée',
      'Alertes SMS illimitées',
      'Équipe de nettoyage',
      'Rappels automatiques',
      'Support prioritaire',
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    highlighted: true,
  },
  {
    id: 'multi',
    name: 'Multi',
    price: 39,
    currency: 'CAD',
    description: 'Pour les gestionnaires professionnels',
    features: [
      'Chalets illimités',
      'Synchronisation iCal illimitée',
      'Alertes SMS illimitées',
      'Équipes multiples',
      'Rapports avancés',
      'API access',
      'Support dédié',
    ],
    stripePriceId: process.env.STRIPE_MULTI_PRICE_ID,
  },
]

export async function createOrRetrieveCustomer(
  userId: string,
  email: string
): Promise<string> {
  // Search for existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  })

  return customer.id
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { supabase_user_id: userId },
    subscription_data: {
      metadata: { supabase_user_id: userId },
    },
  })

  return session.url!
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}
