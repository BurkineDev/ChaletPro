'use client'

import Link from 'next/link'
import { ArrowRight, Mountain, Star } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-mountain-950 via-mountain-900 to-mountain-800 text-white">
      {/* Snow/mountain decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white/20 to-transparent" />
        <svg
          className="absolute bottom-0 left-0 right-0 w-full"
          viewBox="0 0 1440 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 200L180 80L360 160L540 40L720 140L900 60L1080 150L1260 50L1440 120V200H0Z"
            fill="white"
            fillOpacity="0.15"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        {/* Badge */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-mountain-400/30 bg-mountain-800/50 px-4 py-2 text-sm text-mountain-200">
            <Mountain className="h-4 w-4 text-mountain-400" />
            <span>Conçu pour Mont-Tremblant</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Pendant que vous skiez,{' '}
            <span className="bg-gradient-to-r from-mountain-300 to-sky-300 bg-clip-text text-transparent">
              ChâletPro gère votre chalet.
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-mountain-200 sm:text-xl">
            Synchronisation automatique Airbnb &amp; VRBO, alertes SMS à votre
            équipe de ménage, et rappels aux voyageurs — tout en français et en
            anglais.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-lg bg-mountain-500 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-mountain-400 hover:shadow-lg hover:shadow-mountain-500/25"
            >
              Essai gratuit — Aucune carte requise
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-lg border border-mountain-500/40 px-8 py-4 text-base font-semibold text-mountain-100 transition-all hover:border-mountain-400 hover:bg-mountain-800/50"
            >
              Voir les fonctionnalités
            </a>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm text-mountain-400">
            Rejoignez +150 propriétaires de chalets à Tremblant
          </p>
        </div>

        {/* Dashboard preview mockup */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative rounded-2xl border border-mountain-700/50 bg-mountain-900/80 shadow-2xl backdrop-blur-sm">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 rounded-t-2xl border-b border-mountain-700/50 bg-mountain-800/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 rounded-md bg-mountain-700/50 px-3 py-1 text-center text-xs text-mountain-400">
                app.chaletpro.ca/dashboard
              </div>
            </div>
            {/* Dashboard preview content */}
            <div className="p-6">
              <div className="mb-4 grid grid-cols-4 gap-4">
                {[
                  { label: 'Chalets', value: '3' },
                  { label: 'Réservations actives', value: '7' },
                  { label: 'Départs aujourd\'hui', value: '2' },
                  { label: 'Alertes envoyées', value: '12' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg bg-mountain-800/60 p-4 text-center"
                  >
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-mountain-400">{stat.label}</div>
                  </div>
                ))}
              </div>
              {/* Fake calendar entries */}
              <div className="space-y-2">
                {[
                  { name: 'Chalet des Sommets', guest: 'Marie Dubois', date: 'Départ 11h00', platform: 'Airbnb', color: 'bg-green-500/20 border-green-500/30' },
                  { name: 'Villa Mont-Blanc', guest: 'John Smith', date: 'Arrivée 15h00', platform: 'VRBO', color: 'bg-blue-500/20 border-blue-500/30' },
                  { name: 'Refuge Laurentides', guest: 'Sophie Martin', date: 'Départ 11h00', platform: 'Direct', color: 'bg-orange-500/20 border-orange-500/30' },
                ].map((booking) => (
                  <div
                    key={booking.name}
                    className={`flex items-center justify-between rounded-lg border ${booking.color} px-4 py-3`}
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{booking.name}</div>
                      <div className="text-xs text-mountain-400">{booking.guest}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-mountain-300">{booking.date}</div>
                      <div className="mt-0.5 inline-flex rounded-full bg-mountain-700/50 px-2 py-0.5 text-xs text-mountain-300">
                        {booking.platform}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
