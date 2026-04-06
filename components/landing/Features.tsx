import {
  Bell,
  Calendar,
  Globe,
  MessageSquare,
  RefreshCw,
  Shield,
  Smartphone,
  Zap,
} from 'lucide-react'

const features = [
  {
    icon: Bell,
    title: 'Alerte Ménage Auto',
    description:
      'SMS automatique à votre équipe de ménage la veille et le matin du départ. Ne manquez jamais une transition.',
    color: 'bg-orange-500/10 text-orange-500',
  },
  {
    icon: Calendar,
    title: 'Calendrier Intelligent',
    description:
      'Synchronisation automatique de vos calendriers Airbnb, VRBO et Booking.com. Toutes vos réservations au même endroit.',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: Globe,
    title: 'Messagerie FR/EN',
    description:
      'Tous vos messages automatiques en français et en anglais. Parfait pour la clientèle bilingue de Tremblant.',
    color: 'bg-green-500/10 text-green-500',
  },
  {
    icon: Smartphone,
    title: 'Alertes SMS & Messenger',
    description:
      'Rejoignez votre équipe par SMS, WhatsApp ou Messenger selon leurs préférences. 100% livré.',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    icon: RefreshCw,
    title: 'Sync iCal Continu',
    description:
      'Vos calendriers se mettent à jour toutes les heures automatiquement. Fini les doubles réservations.',
    color: 'bg-mountain-500/10 text-mountain-500',
  },
  {
    icon: MessageSquare,
    title: 'Rappels Voyageurs',
    description:
      'Envoi automatique des instructions de départ et d\'arrivée par courriel. Vos voyageurs toujours bien informés.',
    color: 'bg-pink-500/10 text-pink-500',
  },
  {
    icon: Zap,
    title: 'Tableau de Bord Unifié',
    description:
      'Toutes vos propriétés, réservations et équipes dans un seul endroit. Gagnez des heures chaque semaine.',
    color: 'bg-yellow-500/10 text-yellow-500',
  },
  {
    icon: Shield,
    title: 'Données Sécurisées',
    description:
      'Hébergement canadien, chiffrement bout-en-bout, conformité PIPEDA. Vos données restent au Canada.',
    color: 'bg-teal-500/10 text-teal-500',
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-mountain-100 px-4 py-1.5 text-sm font-medium text-mountain-700">
            Fonctionnalités
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tout ce dont vous avez besoin pour gérer vos chalets
          </h2>
          <p className="text-lg text-gray-600">
            ChâletPro automatise les tâches répétitives pour que vous puissiez
            vous concentrer sur l&apos;essentiel — et profiter de la montagne.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-mountain-200 hover:shadow-md"
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* How it works */}
        <div className="mt-24">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">
              Comment ça fonctionne
            </h2>
            <p className="text-gray-600">
              En 3 étapes simples, automatisez toute votre gestion locative.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Ajoutez vos chalets',
                description:
                  'Collez le lien iCal de votre annonce Airbnb ou VRBO. ChâletPro importe automatiquement toutes vos réservations.',
              },
              {
                step: '02',
                title: 'Configurez votre équipe',
                description:
                  'Ajoutez les coordonnées de votre équipe de ménage, de maintenance et de check-in. Choisissez leur canal préféré (SMS, WhatsApp).',
              },
              {
                step: '03',
                title: 'Profitez de la montagne',
                description:
                  'ChâletPro envoie les alertes automatiquement. Votre équipe est prévenue, vos voyageurs sont informés.',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-mountain-600 text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
