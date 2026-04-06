'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mountain, Mail, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-mountain-950 via-mountain-900 to-mountain-800 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Mountain className="h-8 w-8 text-mountain-400" />
            <span className="text-2xl font-bold text-white">
              Châlet<span className="text-mountain-400">Pro</span>
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-mountain-700/50 bg-mountain-900/80 p-8 shadow-2xl backdrop-blur-sm">
          {!sent ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="mb-2 text-2xl font-bold text-white">
                  Connexion
                </h1>
                <p className="text-mountain-300">
                  Entrez votre adresse courriel pour recevoir un lien de
                  connexion magique.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-mountain-200"
                  >
                    Adresse courriel
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mountain-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.ca"
                      required
                      className="w-full rounded-lg border border-mountain-600 bg-mountain-800 py-3 pl-10 pr-4 text-white placeholder-mountain-400 focus:border-mountain-400 focus:outline-none focus:ring-1 focus:ring-mountain-400"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-mountain-500 py-3 text-sm font-semibold text-white transition-all hover:bg-mountain-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer le lien de connexion'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-mountain-400">
                  Pas encore de compte?{' '}
                  <span className="text-mountain-300">
                    Le compte est créé automatiquement à la première connexion.
                  </span>
                </p>
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="mb-4 flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-white">
                Vérifiez votre courriel!
              </h2>
              <p className="mb-6 text-mountain-300">
                Nous avons envoyé un lien de connexion à{' '}
                <strong className="text-white">{email}</strong>. Cliquez sur le
                lien pour accéder à votre tableau de bord.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-mountain-400 underline hover:text-mountain-300"
              >
                Utiliser une autre adresse courriel
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-mountain-400">
          <Link href="/" className="hover:text-mountain-300">
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  )
}
