import type { Metadata } from 'next'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export const metadata: Metadata = {
  title: 'Mira — UK Property Services',
  description: 'Mira platform connecting RS Ref Ltd and Mira Manage Ltd — reference letters and property management for the UK rental market.',
}

function EcosystemDiagram() {
  return (
    <div className="relative w-full max-w-3xl mx-auto py-8">
      {/* Center: Mira Tech */}
      <div className="flex justify-center mb-8">
        <div className="bg-ocean-blue text-white rounded-2xl px-8 py-5 text-center shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">Platform Hub</p>
          <p className="text-xl font-bold">Mira Tech</p>
        </div>
      </div>

      {/* Three nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-ocean-blue rounded-xl p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-ocean-blue mb-1">Reference</p>
          <p className="text-lg font-bold text-dark-gray">RS Ref Ltd</p>
          <p className="text-sm text-gray-500 mt-2">Tenant assessment & reference letters</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Partners</p>
          <p className="text-lg font-bold text-dark-gray">Landlords & Agents</p>
          <p className="text-sm text-gray-500 mt-2">Using reference data for tenancy decisions</p>
        </div>

        <div className="bg-white border-2 border-sand-gold rounded-xl p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-sand-gold mb-1">Management</p>
          <p className="text-lg font-bold text-dark-gray">Mira Manage Ltd</p>
          <p className="text-sm text-gray-500 mt-2">Property management & tenant services</p>
        </div>
      </div>
    </div>
  )
}

export default function UKHomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-gray to-gray-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-ocean-blue font-semibold uppercase tracking-widest text-sm mb-4">UK Property Services</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            A Smarter Way to<br />Rent & Manage Property
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
            Mira connects tenants, landlords, and property managers through a unified platform —
            powered by RS Ref Ltd and Mira Manage Ltd.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/en/uk/rs-ref"
              className="bg-ocean-blue hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-full transition-colors"
            >
              Reference Letters
            </Link>
            <Link
              href="/en/uk/mira-manage"
              className="bg-sand-gold hover:bg-yellow-500 text-white font-semibold px-8 py-3 rounded-full transition-colors"
            >
              Property Management
            </Link>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="py-20 px-4 bg-light-gray">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-gray mb-4">Our Ecosystem</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Three entities working together to create a seamless rental experience for tenants, landlords, and investors.
            </p>
          </div>
          <EcosystemDiagram />
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-dark-gray text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* RS Ref */}
            <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-ocean-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-gray mb-3">RS Ref Ltd</h3>
              <p className="text-gray-500 mb-6">
                Professional tenant reference letters backed by independent assessment. Helping tenants secure rental properties with confidence.
              </p>
              <Link
                href="/en/uk/rs-ref"
                className="inline-flex items-center text-ocean-blue font-semibold hover:underline"
              >
                Learn more →
              </Link>
            </div>

            {/* Mira Manage */}
            <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-sand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-gray mb-3">Mira Manage Ltd</h3>
              <p className="text-gray-500 mb-6">
                End-to-end property management for landlords and overseas investors. From tenant onboarding to maintenance coordination and reporting.
              </p>
              <Link
                href="/en/uk/mira-manage"
                className="inline-flex items-center text-sand-gold font-semibold hover:underline"
              >
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Thailand CTA */}
      <section className="py-16 px-4 bg-light-gray">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-500 mb-2">Also looking for property in Southeast Asia?</p>
          <h3 className="text-2xl font-bold text-dark-gray mb-6">Explore Luxury Villas in Koh Samui</h3>
          <Link
            href="/en"
            className="inline-block bg-ocean-blue hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            View Thailand Properties
          </Link>
        </div>
      </section>
    </div>
  )
}
