'use client'

import Link from 'next/link'
import { Check, Zap } from 'lucide-react'

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    period: '/mois',
    description: 'Pour commencer et tester ChâletPro',
    features: [
      '1 chalet',
      'Synchronisation iCal',
      '5 alertes SMS par mois',
      'Tableau de bord basique',
      'Support par courriel',
    ],
    cta: 'Commencer gratuitement',
    href: '/login',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    period: '/mois CAD',
    description: 'Pour les propriétaires sérieux',
    features: [
      '3 chalets',
      'Synchronisation iCal illimitée',
      'Alertes SMS illimitées',
      'Gestion équipe de ménage',
      'Rappels automatiques voyageurs',
      'Messagerie FR/EN',
      'Support prioritaire',
    ],
    cta: 'Démarrer l\'essai Pro',
    href: '/login?plan=pro',
    highlighted: true,
  },
  {
    id: 'multi',
    name: 'Multi',
    price: 39,
    period: '/mois CAD',
    description: 'Pour les gestionnaires professionnels',
    features: [
      'Chalets illimités',
      'Synchronisation iCal illimitée',
      'Alertes SMS illimitées',
      'Équipes multiples par chalet',
      'Rapports et statistiques avancés',
      'Accès API',
      'Support dédié 24/7',
      'Tableau de bord multi-propriétés',
    ],
    cta: 'Démarrer l\'essai Multi',
    href: '/login?plan=multi',
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="bg-snow-100 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-mountain-100 px-4 py-1.5 text-sm font-medium text-mountain-700">
            Tarification
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tarifs simples et transparents
          </h2>
          <p className="text-lg text-gray-600">
            Commencez gratuitement. Passez au niveau supérieur quand vous êtes
            prêt. Annulez en tout temps.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border ${
                plan.highlighted
                  ? 'border-mountain-500 bg-mountain-900 text-white shadow-xl shadow-mountain-500/20'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-mountain-500 px-4 py-1.5 text-sm font-semibold text-white">
                    <Zap className="h-3.5 w-3.5" />
                    Plus populaire
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="mb-2 text-sm font-medium uppercase tracking-wider text-mountain-400">
                  {plan.name}
                </div>
                <div className="mb-2 flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-bold ${
                      plan.highlighted ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {plan.price === 0 ? 'Gratuit' : `${plan.price}$`}
                  </span>
                  {plan.price > 0 && (
                    <span
                      className={`text-sm ${
                        plan.highlighted ? 'text-mountain-300' : 'text-gray-500'
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className={`mb-6 text-sm ${
                    plan.highlighted ? 'text-mountain-300' : 'text-gray-600'
                  }`}
                >
                  {plan.description}
                </p>

                <Link
                  href={plan.href}
                  className={`block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-mountain-500 text-white hover:bg-mountain-400'
                      : 'bg-mountain-100 text-mountain-700 hover:bg-mountain-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>

              <div
                className={`border-t px-8 pb-8 pt-6 ${
                  plan.highlighted ? 'border-mountain-700' : 'border-gray-100'
                }`}
              >
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          plan.highlighted ? 'text-mountain-400' : 'text-mountain-500'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          plan.highlighted ? 'text-mountain-200' : 'text-gray-700'
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Tous les prix en dollars canadiens. Taxes applicables selon votre
          province.
        </p>
      </div>
    </section>
  )
}
