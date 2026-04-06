import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PRICING_PLANS } from '@/lib/stripe'
import { Check, CreditCard, User } from 'lucide-react'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const currentProfile = profile as Profile | null
  const currentPlan = currentProfile?.plan ?? 'free'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-500">
          Gérez votre compte et votre abonnement.
        </p>
      </div>

      {/* Profile section */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-mountain-600" />
          <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <span className="text-gray-500">Adresse courriel</span>
            <span className="font-medium text-gray-900">{user.email}</span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <span className="text-gray-500">Nom complet</span>
            <span className="font-medium text-gray-900">
              {currentProfile?.full_name ?? '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Téléphone</span>
            <span className="font-medium text-gray-900">
              {currentProfile?.phone ?? '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Subscription section */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-mountain-600" />
          <h2 className="text-lg font-semibold text-gray-900">Abonnement</h2>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-lg bg-mountain-50 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mountain-600 text-sm font-bold text-white capitalize">
            {currentPlan.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 capitalize">
              Plan {currentPlan === 'free' ? 'Gratuit' : currentPlan}
            </p>
            <p className="text-xs text-gray-500">
              {currentPlan === 'free'
                ? 'Passez au plan Pro pour débloquer toutes les fonctionnalités'
                : 'Abonnement actif'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-5 transition-all ${
                  isCurrentPlan
                    ? 'border-mountain-500 bg-mountain-50'
                    : plan.highlighted
                    ? 'border-mountain-300 bg-white'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-2.5 left-4">
                    <span className="rounded-full bg-mountain-600 px-2.5 py-0.5 text-xs font-medium text-white">
                      Plan actuel
                    </span>
                  </div>
                )}
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Gratuit' : `${plan.price}$`}
                    {plan.price > 0 && (
                      <span className="text-sm font-normal text-gray-500">/mois</span>
                    )}
                  </p>
                </div>
                <ul className="mb-4 space-y-1.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mountain-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full rounded-lg bg-mountain-100 py-2 text-xs font-medium text-mountain-700 opacity-60"
                  >
                    Plan actuel
                  </button>
                ) : plan.id === 'free' ? null : (
                  <form action="/api/stripe/checkout" method="POST">
                    <input type="hidden" name="priceId" value={plan.stripePriceId ?? ''} />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-mountain-600 py-2 text-xs font-semibold text-white hover:bg-mountain-500"
                    >
                      {currentPlan === 'free' ? 'Passer au ' : 'Changer pour '}{plan.name}
                    </button>
                  </form>
                )}
              </div>
            )
          })}
        </div>

        {currentPlan !== 'free' && (
          <div className="mt-4 text-center">
            <form action="/api/stripe/portal" method="POST">
              <button type="submit" className="text-sm text-gray-500 underline hover:text-gray-700">
                Gérer mon abonnement (portail Stripe)
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-100 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-red-700">Zone de danger</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Supprimer mon compte</p>
            <p className="text-xs text-gray-500">
              Cette action est irréversible. Toutes vos données seront supprimées.
            </p>
          </div>
          <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
