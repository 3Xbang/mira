import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getProjectById } from '@/lib/db'
import { t as tl } from '@/lib/types'
import ContactButton from '@/components/common/ContactButton'
import ProjectNav from '@/components/project/ProjectNav'

export const dynamic = 'force-dynamic'

// ─── Nearby places data ───────────────────────────────────────────────────────

const NEARBY = {
  transport: [
    {
      icon: '✈️',
      en: 'Samui Airport (USM)', zh: '苏梅岛机场', th: 'สนามบินสมุย',
      dist: { en: '8 min drive', zh: '开车8分钟', th: 'ขับรถ 8 นาที' },
      tag: { en: 'Airport', zh: '机场', th: 'สนามบิน' },
    },
    {
      icon: '⛴️',
      en: 'Bangrak Ferry Pier', zh: 'Bangrak 渡轮码头', th: 'ท่าเรือบางรัก',
      dist: { en: '6 min drive', zh: '开车6分钟', th: 'ขับรถ 6 นาที' },
      tag: { en: 'Pier', zh: '码头', th: 'ท่าเรือ' },
    },
    {
      icon: '🚗',
      en: 'Ring Road Access', zh: '环岛公路', th: 'ถนนวงแหวน',
      dist: { en: '2 min drive', zh: '开车2分钟', th: 'ขับรถ 2 นาที' },
      tag: { en: 'Road', zh: '交通', th: 'การเดินทาง' },
    },
  ],
  attractions: [
    {
      icon: '🛕',
      en: 'Wat Plai Laem Temple', zh: '帕莱庙（网红景点）', th: 'วัดปลายแหลม',
      dist: { en: '5 min walk', zh: '步行5分钟', th: 'เดินเท้า 5 นาที' },
      tag: { en: 'Temple', zh: '寺庙', th: 'วัด' },
    },
    {
      icon: '🙏',
      en: 'Big Buddha (Wat Phra Yai)', zh: '大佛寺', th: 'วัดพระใหญ่',
      dist: { en: '3 min drive', zh: '开车3分钟', th: 'ขับรถ 3 นาที' },
      tag: { en: 'Landmark', zh: '地标', th: 'สถานที่สำคัญ' },
    },
    {
      icon: '🏖️',
      en: 'Choeng Mon Beach', zh: 'Choeng Mon 海滩', th: 'หาดเชิงมน',
      dist: { en: '5 min drive', zh: '开车5分钟', th: 'ขับรถ 5 นาที' },
      tag: { en: 'Beach', zh: '海滩', th: 'หาดทราย' },
    },
    {
      icon: '🐟',
      en: "Fisherman's Village (Bo Put)", zh: '渔人村 (Bo Put)', th: 'หมู่บ้านชาวประมง',
      dist: { en: '8 min drive', zh: '开车8分钟', th: 'ขับรถ 8 นาที' },
      tag: { en: 'Dining', zh: '美食街', th: 'ร้านอาหาร' },
    },
    {
      icon: '🌊',
      en: 'Chaweng Beach', zh: 'Chaweng 海滩', th: 'หาดเฉวง',
      dist: { en: '15 min drive', zh: '开车15分钟', th: 'ขับรถ 15 นาที' },
      tag: { en: 'Beach', zh: '海滩', th: 'หาดทราย' },
    },
  ],
  lifestyle: [
    {
      icon: '🛒',
      en: 'Big C Supermarket', zh: 'Big C 超市', th: 'บิ๊กซี',
      dist: { en: '5 min drive', zh: '开车5分钟', th: 'ขับรถ 5 นาที' },
      tag: { en: 'Shopping', zh: '购物', th: 'ช้อปปิ้ง' },
    },
    {
      icon: '🏥',
      en: 'Bangkok Hospital Samui', zh: '曼谷医院苏梅岛分院', th: 'โรงพยาบาลกรุงเทพสมุย',
      dist: { en: '10 min drive', zh: '开车10分钟', th: 'ขับรถ 10 นาที' },
      tag: { en: 'Hospital', zh: '医院', th: 'โรงพยาบาล' },
    },
    {
      icon: '🍽️',
      en: 'Restaurants & Cafes', zh: '餐厅和咖啡馆', th: 'ร้านอาหาร',
      dist: { en: '2 min walk', zh: '步行2分钟', th: 'เดินเท้า 2 นาที' },
      tag: { en: 'Dining', zh: '餐饮', th: 'ร้านอาหาร' },
    },
    {
      icon: '🏫',
      en: 'International Schools', zh: '国际学校', th: 'โรงเรียนนานาชาติ',
      dist: { en: '10 min drive', zh: '开车10分钟', th: 'ขับรถ 10 นาที' },
      tag: { en: 'Education', zh: '教育', th: 'การศึกษา' },
    },
  ],
}

type Lang = 'en' | 'zh' | 'th'

function NearbyCard({ item, lang }: { item: any; lang: Lang }) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100 hover:border-sky-200 hover:shadow-sm transition-all">
      <span className="text-2xl shrink-0">{item.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{item[lang] ?? item.en}</p>
        <p className="text-xs text-sky-600 mt-0.5">{item.dist[lang]}</p>
      </div>
      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
        {item.tag[lang]}
      </span>
    </div>
  )
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const project = await getProjectById(id).catch(() => null)
  if (!project) notFound()

  const t = await getTranslations('project')
  const name = tl(project.name, locale)
  const lang = locale as Lang

  // Use project coordinates or default to exact project location
  const lat = project.location_lat ?? 9.5655
  const lng = project.location_lng ?? 100.0689
  const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`

  const LABELS = {
    transport: { en: '🚗 Transport & Connectivity', zh: '🚗 交通便利', th: '🚗 การเดินทาง' },
    attractions: { en: '🌴 Tourist Attractions', zh: '🌴 旅游景点', th: '🌴 สถานที่ท่องเที่ยว' },
    lifestyle: { en: '🛒 Daily Life & Services', zh: '🛒 生活配套', th: '🛒 บริการและสิ่งอำนวยความสะดวก' },
    why: { en: 'Why This Location?', zh: '为什么选择这里？', th: 'ทำไมต้องเลือกทำเลนี้?' },
    highlight1: {
      en: 'Prime Central Location',
      zh: '苏梅岛中心黄金地段',
      th: 'ทำเลใจกลางเกาะสมุย',
    },
    highlight1desc: {
      en: 'Situated in the heart of Ko Samui — equal distance to the airport, main ferry pier, top beaches and the island\'s best dining and shopping.',
      zh: '位于苏梅岛中心地带，到机场、主要渡轮码头、顶级海滩、最佳餐饮和购物区距离相当，出行极为便利。',
      th: 'ตั้งอยู่ใจกลางเกาะสมุย ใกล้ทั้งสนามบิน ท่าเรือหลัก หาดทรายชั้นนำ และแหล่งช้อปปิ้งที่ดีที่สุด',
    },
    highlight2: {
      en: 'Near Iconic Landmarks',
      zh: '毗邻著名地标',
      th: 'ใกล้สถานที่สำคัญ',
    },
    highlight2desc: {
      en: 'Walking distance to Wat Plai Laem — one of Ko Samui\'s most photographed temples. Big Buddha Temple just 3 minutes away.',
      zh: '步行即可到达帕莱庙——苏梅岛最上镜的寺庙之一。大佛寺仅需3分钟车程。',
      th: 'เดินเท้าถึงวัดปลายแหลม วัดที่ถ่ายรูปมากที่สุดในสมุย และวัดพระใหญ่อยู่ห่างเพียง 3 นาที',
    },
    highlight3: {
      en: 'Quiet Yet Connected',
      zh: '静谧而便捷',
      th: 'สงบแต่เชื่อมต่อได้',
    },
    highlight3desc: {
      en: 'Enjoy the peace of a residential neighborhood while staying minutes from everything. Perfect for families, expats and holiday homeowners.',
      zh: '享受宁静住宅区的同时，距离一切便利设施只需数分钟。非常适合家庭、外籍人士和度假屋业主。',
      th: 'เพลิดเพลินกับความสงบของย่านที่พักอาศัย ขณะที่ทุกอย่างอยู่ใกล้แค่ไม่กี่นาที เหมาะสำหรับครอบครัว ชาวต่างชาติ',
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/50 text-sm mb-1">{name}</p>
          <h1 className="text-3xl font-bold text-white">{t('location')}</h1>
          {project.location_address && (
            <p className="text-white/50 text-sm mt-2">📍 {project.location_address}</p>
          )}
        </div>
      </div>

      <ProjectNav locale={locale} projectId={id} active="location" />

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* ── Why this location ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{LABELS.why[lang]}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: '🎯', title: LABELS.highlight1[lang], desc: LABELS.highlight1desc[lang] },
              { icon: '🛕', title: LABELS.highlight2[lang], desc: LABELS.highlight2desc[lang] },
              { icon: '🌿', title: LABELS.highlight3[lang], desc: LABELS.highlight3desc[lang] },
            ].map((h, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <span className="text-3xl">{h.icon}</span>
                <h3 className="font-bold text-gray-900 mt-3 mb-2">{h.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Map ── */}
        <section>
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: '420px' }}>
            <iframe
              title="Project location map"
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
            />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sky-500">📍</span>
            <p className="text-sm text-gray-600">{project.location_address}</p>
            <a
              href={`https://maps.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-xs text-sky-500 hover:underline shrink-0"
            >
              {lang === 'zh' ? '在 Google Maps 打开 →' :
               lang === 'th' ? 'เปิดใน Google Maps →' :
               'Open in Google Maps →'}
            </a>
          </div>
        </section>

        {/* ── Transport ── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{LABELS.transport[lang]}</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {NEARBY.transport.map((item, i) => (
              <NearbyCard key={i} item={item} lang={lang} />
            ))}
          </div>
        </section>

        {/* ── Attractions ── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{LABELS.attractions[lang]}</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {NEARBY.attractions.map((item, i) => (
              <NearbyCard key={i} item={item} lang={lang} />
            ))}
          </div>
        </section>

        {/* ── Lifestyle ── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{LABELS.lifestyle[lang]}</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {NEARBY.lifestyle.map((item, i) => (
              <NearbyCard key={i} item={item} lang={lang} />
            ))}
          </div>
        </section>

        {/* ── Location photos from project gallery ── */}
        {project.gallery && project.gallery.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {lang === 'zh' ? '📸 项目实景' :
               lang === 'th' ? '📸 ภาพจริงของโครงการ' :
               '📸 Project Photos'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {project.gallery.slice(0, 6).map((img, i) => (
                <a key={i} href={img} target="_blank" rel="noreferrer"
                  className={`relative overflow-hidden rounded-xl bg-gray-100 hover:opacity-90 transition-opacity ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                  style={{ aspectRatio: i === 0 ? '16/9' : '4/3' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </section>
        )}

      </div>

      <ContactButton whatsappNumber="66835234777" lineId="0835234777" />
    </div>
  )
}
