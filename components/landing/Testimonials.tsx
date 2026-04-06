import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Marie-Claude Tremblay',
    role: 'Propriétaire de 2 chalets, Mont-Tremblant',
    content:
      'Avant ChâletPro, j\'oubliais parfois d\'avertir mon équipe de ménage. Maintenant tout est automatique. Je reçois même la confirmation que le message a été livré. Indispensable!',
    rating: 5,
    initials: 'MT',
  },
  {
    name: 'Jacques Bélanger',
    role: 'Propriétaire de 4 chalets, Laurentides',
    content:
      'La synchronisation des calendriers Airbnb et VRBO sauve tellement de temps. Plus de doubles réservations, plus de stress. L\'application est en français, c\'est parfait.',
    rating: 5,
    initials: 'JB',
  },
  {
    name: 'Sophie Lavoie',
    role: 'Gestionnaire immobilier, Mont-Tremblant Village',
    content:
      'Je gère 8 chalets pour différents propriétaires. ChâletPro Multi m\'a permis d\'automatiser 80% de mon travail. Mes clients sont contents, moi aussi!',
    rating: 5,
    initials: 'SL',
  },
]

export default function Testimonials() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-mountain-100 px-4 py-1.5 text-sm font-medium text-mountain-700">
            Témoignages
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ils font confiance à ChâletPro
          </h2>
          <p className="text-gray-600">
            Rejoignez des centaines de propriétaires qui ont automatisé la
            gestion de leurs chalets à Mont-Tremblant.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col rounded-2xl border border-gray-100 bg-snow-50 p-8 shadow-sm"
            >
              {/* Stars */}
              <div className="mb-4 flex">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Content */}
              <blockquote className="mb-6 flex-1 text-sm leading-relaxed text-gray-700">
                &ldquo;{testimonial.content}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mountain-600 text-sm font-bold text-white">
                  {testimonial.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-1 gap-8 rounded-2xl bg-mountain-900 p-8 sm:grid-cols-3">
          {[
            { value: '150+', label: 'Propriétaires actifs' },
            { value: '500+', label: 'Chalets gérés' },
            { value: '10 000+', label: 'Alertes SMS envoyées' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-sm text-mountain-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
