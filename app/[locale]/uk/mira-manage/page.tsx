import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mira Manage Ltd — Property Management | Mira',
  description: 'End-to-end property management for landlords and overseas investors. Mira Manage Ltd handles everything from tenant onboarding to maintenance and reporting.',
}

const services = [
  { title: 'Tenant Onboarding', desc: 'Full tenant vetting, referencing, and onboarding process managed on your behalf.' },
  { title: 'Rent Collection', desc: 'Automated rent collection with transparent reporting and direct payment to landlords.' },
  { title: 'Maintenance Coordination', desc: 'Handling all maintenance requests, contractor coordination, and property upkeep.' },
  { title: 'Compliance Management', desc: 'Ensuring your property meets all UK legal requirements, safety certificates, and regulations.' },
  { title: 'Tenant Relations', desc: 'Professional handling of all tenant communications, disputes, and day-to-day queries.' },
  { title: 'Management Reports', desc: 'Regular detailed reports on your property performance, occupancy, and financials.' },
]

const forWhom = [
  { title: 'Overseas Investors', desc: 'Own UK property but live abroad? We manage everything so you don\'t have to.' },
  { title: 'Portfolio Landlords', desc: 'Managing multiple properties is complex. We streamline operations across your entire portfolio.' },
  { title: 'First-Time Landlords', desc: 'New to letting? We guide you through every step and handle the complexity for you.' },
]

export default function MiraManagePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-gray to-gray-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/en/uk" className="inline-flex items-center text-gray-400 hover:text-white text-sm mb-8 transition-colors">
            ← Back to UK Services
          </Link>
          <p className="text-sand-gold font-semibold uppercase tracking-widest text-sm mb-4">Mira Manage Ltd</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Property Management<br />Made Simple
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mb-10">
            From tenant onboarding to maintenance coordination and financial reporting —
            Mira Manage Ltd handles every aspect of your UK rental property so you can focus on what matters.
          </p>
          <button
            disabled
            className="bg-sand-gold text-white font-semibold px-8 py-3 rounded-full opacity-60 cursor-not-allowed"
          >
            Get Started — Coming Soon
          </button>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-dark-gray text-center mb-12">What We Manage</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-2 h-8 bg-sand-gold rounded-full mb-4" />
                <h3 className="text-lg font-bold text-dark-gray mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="py-20 px-4 bg-light-gray">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-dark-gray text-center mb-12">Who It's For</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {forWhom.map((w) => (
              <div key={w.title} className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <h3 className="text-lg font-bold text-dark-gray mb-3">{w.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform integration note */}
      <section className="py-16 px-4 bg-dark-gray text-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sand-gold font-semibold uppercase tracking-widest text-sm mb-4">Powered by Mira Tech</p>
          <h2 className="text-2xl font-bold mb-4">Integrated with the Mira Platform</h2>
          <p className="text-gray-400 mb-8">
            Mira Manage Ltd operates through the Mira Tech platform, giving landlords real-time visibility
            into their properties, maintenance tickets, and financial performance — all in one place.
          </p>
          <button disabled className="bg-sand-gold text-white font-semibold px-8 py-3 rounded-full opacity-60 cursor-not-allowed">
            Access Dashboard — Coming Soon
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-dark-gray mb-4">Interested in Our Services?</h2>
          <p className="text-gray-500 mb-8">Our full platform will be available soon. Explore our reference letter service in the meantime.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button disabled className="bg-sand-gold text-white font-semibold px-8 py-3 rounded-full opacity-60 cursor-not-allowed">
              Get Started — Coming Soon
            </button>
            <Link href="/en/uk/rs-ref" className="border border-gray-300 text-dark-gray font-semibold px-8 py-3 rounded-full hover:bg-light-gray transition-colors">
              View Reference Letters
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
