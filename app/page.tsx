import Link from 'next/link'
import { Mountain, ArrowRight } from 'lucide-react'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Pricing from '@/components/landing/Pricing'
import Testimonials from '@/components/landing/Testimonials'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="absolute left-0 right-0 top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-white"
          >
            <Mountain className="h-7 w-7 text-mountain-400" />
            <span>Châlet<span className="text-mountain-400">Pro</span></span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-mountain-200 transition-colors hover:text-white"
            >
              Fonctionnalités
            </a>
            <a
              href="#pricing"
              className="text-sm text-mountain-200 transition-colors hover:text-white"
            >
              Tarifs
            </a>
            <Link
              href="/login"
              className="rounded-lg bg-mountain-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-mountain-400"
            >
              Connexion
            </Link>
          </div>
          {/* Mobile menu */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1 rounded-lg bg-mountain-500 px-4 py-2 text-sm font-semibold text-white md:hidden"
          >
            Connexion
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Sections */}
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />

      {/* Footer CTA */}
      <section className="bg-mountain-900 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Prêt à automatiser votre gestion de chalet?
          </h2>
          <p className="mb-8 text-mountain-300">
            Rejoignez ChâletPro gratuitement. Aucune carte de crédit requise.
          </p>
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-lg bg-mountain-500 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-mountain-400"
          >
            Commencer gratuitement
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-mountain-950 py-12 text-mountain-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <Mountain className="h-5 w-5 text-mountain-400" />
              <span>Châlet<span className="text-mountain-400">Pro</span></span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white">
                Confidentialité
              </a>
              <a href="#" className="hover:text-white">
                Conditions
              </a>
              <a href="mailto:support@chaletpro.ca" className="hover:text-white">
                Support
              </a>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} ChâletPro. Fait avec ❤️ à Tremblant.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
