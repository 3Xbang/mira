import type { RentalInvestment } from '@/lib/types'

interface Props {
  investment: RentalInvestment
  locale: string
}

// Format THB number: 2,900,000 → "290万" or "2.9M"
function formatThb(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 10_000) return (n / 10_000).toFixed(0) + '万'
  return n.toLocaleString()
}

function StatCard({ icon, label, value, sub, accent }: {
  icon: string; label: string; value: string; sub?: string; accent?: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${accent ?? 'bg-white border border-gray-100'} shadow-sm`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
      <p className="text-xs font-medium text-gray-400 mt-2 uppercase tracking-wide">{label}</p>
    </div>
  )
}

function RentalSection({ title, icon, color, data, locale }: {
  title: string
  icon: string
  color: string
  data: {
    rent: number
    rentLabel: string
    occupancy?: number
    annualIncome?: number
    roi?: number
    payback?: number
    mgmtFee?: number
  }
  locale: string
}) {
  const labels: Record<string, Record<string, string>> = {
    en: {
      rent: 'Rental Price', occupancy: 'Occupancy Rate', income: 'Annual Income',
      roi: 'Annual ROI', payback: 'Payback Period', mgmt: 'Mgmt Fee / Year',
    },
    zh: {
      rent: '租金', occupancy: '出租率', income: '年租金收入',
      roi: '年投资回报率', payback: '预计回本年限', mgmt: '年物业管理费',
    },
    ru: {
      rent: 'Арендная плата', occupancy: 'Загруженность', income: 'Годовой доход',
      roi: 'Годовая доходность', payback: 'Окупаемость', mgmt: 'Управление / год',
    },
    fr: {
      rent: 'Loyer', occupancy: 'Taux d\'occupation', income: 'Revenus annuels',
      roi: 'Rendement annuel', payback: 'Retour sur investissement', mgmt: 'Frais de gestion / an',
    },
    de: {
      rent: 'Miete', occupancy: 'Auslastung', income: 'Jahreseinnahmen',
      roi: 'Jahresrendite', payback: 'Amortisationszeit', mgmt: 'Verwaltungsgebühr / Jahr',
    },
    es: {
      rent: 'Alquiler', occupancy: 'Ocupación', income: 'Ingresos anuales',
      roi: 'Rentabilidad anual', payback: 'Periodo de retorno', mgmt: 'Gestión / año',
    },
    it: {
      rent: 'Affitto', occupancy: 'Tasso di occupazione', income: 'Reddito annuale',
      roi: 'Rendimento annuale', payback: 'Periodo di recupero', mgmt: 'Gestione / anno',
    },
  }
  const l = labels[locale] ?? labels.en

  const stats = [
    data.rent > 0 && {
      icon: '💰', label: l.rent,
      value: `฿${data.rent.toLocaleString()}`,
      sub: data.rentLabel,
    },
    data.occupancy != null && data.occupancy > 0 && {
      icon: '📊', label: l.occupancy,
      value: `${data.occupancy}%`,
    },
    data.annualIncome != null && data.annualIncome > 0 && {
      icon: '💵', label: l.income,
      value: `฿${formatThb(data.annualIncome)}`,
      sub: 'THB / year',
    },
    data.roi != null && data.roi > 0 && {
      icon: '📈', label: l.roi,
      value: `${data.roi}%`,
    },
    data.payback != null && data.payback > 0 && {
      icon: '⏱️', label: l.payback,
      value: `${data.payback}`,
      sub: locale === 'ru' ? 'лет' : locale === 'zh' ? '年' : 'years',
    },
    data.mgmtFee != null && data.mgmtFee > 0 && {
      icon: '🏢', label: l.mgmt,
      value: `฿${data.mgmtFee.toLocaleString()}`,
    },
  ].filter(Boolean) as { icon: string; label: string; value: string; sub?: string }[]

  if (stats.length === 0) return null

  return (
    <div className="mt-6">
      {/* Section header */}
      <div className={`flex items-center gap-3 mb-4 px-4 py-2.5 rounded-xl ${color}`}>
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-white text-sm tracking-wide uppercase">{title}</h3>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} sub={s.sub} />
        ))}
      </div>
    </div>
  )
}

const SECTION_LABELS: Record<string, { monthly: string; daily: string }> = {
  en: { monthly: 'Long-term Rental', daily: 'Short-stay / Nightly' },
  zh: { monthly: '月租/长租收益', daily: '日租/短租收益' },
  ru: { monthly: 'Долгосрочная аренда', daily: 'Краткосрочная аренда' },
  fr: { monthly: 'Location longue durée', daily: 'Location courte durée' },
  de: { monthly: 'Langzeitmiete', daily: 'Kurzzeitmiete' },
  es: { monthly: 'Alquiler a largo plazo', daily: 'Alquiler a corto plazo' },
  it: { monthly: 'Affitto a lungo termine', daily: 'Affitto a breve termine' },
}

const TITLE_LABELS: Record<string, string> = {
  en: 'Investment Returns',
  zh: '投资回报分析',
  ru: 'Инвестиционный доход',
  fr: 'Rendement locatif',
  de: 'Investitionsrendite',
  es: 'Retorno de inversión',
  it: 'Rendimento dell\'investimento',
}

const RENT_LABELS: Record<string, { monthly: string; daily: string }> = {
  en: { monthly: 'per month', daily: 'per night' },
  zh: { monthly: '每月', daily: '每晚' },
  ru: { monthly: 'в месяц', daily: 'в сутки' },
  fr: { monthly: 'par mois', daily: 'par nuit' },
  de: { monthly: 'pro Monat', daily: 'pro Nacht' },
  es: { monthly: 'por mes', daily: 'por noche' },
  it: { monthly: 'al mese', daily: 'a notte' },
}

export default function InvestmentCard({ investment: inv, locale }: Props) {
  const hasMonthly = (inv.monthly_rent_thb ?? 0) > 0 ||
    (inv.monthly_annual_income ?? 0) > 0 || (inv.monthly_roi ?? 0) > 0
  const hasDaily = (inv.daily_rent_thb ?? 0) > 0 ||
    (inv.daily_annual_income ?? 0) > 0 || (inv.daily_roi ?? 0) > 0

  if (!hasMonthly && !hasDaily) return null

  const labels = SECTION_LABELS[locale] ?? SECTION_LABELS.en
  const rentLabels = RENT_LABELS[locale] ?? RENT_LABELS.en
  const title = TITLE_LABELS[locale] ?? TITLE_LABELS.en

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-blue-100">
      {/* Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">💹</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>

      {/* Monthly */}
      {hasMonthly && (
        <RentalSection
          title={labels.monthly}
          icon="🏠"
          color="bg-blue-500"
          locale={locale}
          data={{
            rent: inv.monthly_rent_thb ?? 0,
            rentLabel: rentLabels.monthly,
            occupancy: inv.monthly_occupancy_rate,
            annualIncome: inv.monthly_annual_income,
            roi: inv.monthly_roi,
            payback: inv.monthly_payback_years,
            mgmtFee: inv.monthly_mgmt_fee,
          }}
        />
      )}

      {/* Daily */}
      {hasDaily && (
        <RentalSection
          title={labels.daily}
          icon="🌴"
          color="bg-amber-500"
          locale={locale}
          data={{
            rent: inv.daily_rent_thb ?? 0,
            rentLabel: rentLabels.daily,
            occupancy: inv.daily_occupancy_rate,
            annualIncome: inv.daily_annual_income,
            roi: inv.daily_roi,
            payback: inv.daily_payback_years,
            mgmtFee: inv.daily_mgmt_fee,
          }}
        />
      )}
    </div>
  )
}
