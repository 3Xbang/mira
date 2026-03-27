import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'RS Ref Ltd — Tenant Reference Letters | Mira',
  description: 'Professional tenant reference letters backed by independent assessment. RS Ref Ltd helps tenants secure rental properties in the UK.',
}

const steps = [
  { step: '01', title: 'Submit Application', desc: 'Fill in your personal details, rental address, and landlord information through our secure platform.' },
  { step: '02', title: 'Assessment', desc: 'RS Ref Ltd independently evaluates your application and verifies the provided information.' },
  { step: '03', title: 'Reference Letter', desc: 'Receive your professional reference letter, ready to share directly with your landlord or letting agent.' },
]

const features = [
  { title: 'Independent Assessment', desc: 'Unbiased evaluation by RS Ref Ltd, trusted by landlords and letting agents across the UK.' },
  { title: 'Fast Turnaround', desc: 'Reference letters processed and delivered quickly so you never miss a rental opportunity.' },
  { title: 'Secure & Confidential', desc: 'Your personal data is handled with strict confidentiality and GDPR compliance.' },
  { title: 'Landlord Trusted', desc: 'Our reference letters are recognised and accepted by major letting agencies and private landlords.' },
]

export default function RSRefPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-ocean-blue to-blue-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/en/uk" className="inline-flex items-center text-blue-200 hover:text-white text-sm mb-8 transition-colors">
            ← Back to UK Services
          </Link>
          <p className="text-blue-200 font-semibold uppercase tracking-widest text-sm mb-4">RS Ref Ltd</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Tenant Reference<br />Letters
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mb-10">
            A professional reference letter can make the difference between securing your ideal rental or losing it.
            RS Ref Ltd provides independent, trusted assessments accepted by landlords across the UK.
          </p>
          <button
            disabled
            className="bg-white text-ocean-blue font-semibold px-8 py-3 rounded-full opacity-60 cursor-not-allowed"
          >
            Apply Now — Coming Soon
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-dark-gray text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-ocean-blue text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-5">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-dark-gray mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-light-gray">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-dark-gray text-center mb-12">Why Choose RS Ref Ltd</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-dark-gray mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-dark-gray mb-4">Ready to Apply?</h2>
          <p className="text-gray-500 mb-8">Our online application will be available soon. In the meantime, explore our other services.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button disabled className="bg-ocean-blue text-white font-semibold px-8 py-3 rounded-full opacity-60 cursor-not-allowed">
              Apply Now — Coming Soon
            </button>
            <Link href="/en/uk/mira-manage" className="border border-gray-300 text-dark-gray font-semibold px-8 py-3 rounded-full hover:bg-light-gray transition-colors">
              View Property Management
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
