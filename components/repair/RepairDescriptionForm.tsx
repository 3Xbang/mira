'use client'

import { useState } from 'react'

type Lang = 'en' | 'zh' | 'th'

// ─── Type definitions ────────────────────────────────────────────────────────

interface QuestionOption {
  value: string
  en: string
  zh: string
  th: string
}

interface Question {
  id: string
  en: string
  zh: string
  th: string
  options: QuestionOption[]
}

interface ServiceType {
  id: string
  icon: string
  en: string
  zh: string
  th: string
  questions: Question[]
}

// ─── Service types with guided questions ─────────────────────────────────────

const SERVICE_TYPES: ServiceType[] = [
  {
    id: 'plumbing',
    icon: '🚿',
    en: 'Plumbing / Water Leak',
    zh: '水管 / 漏水',
    th: 'ประปา / น้ำรั่ว',
    questions: [
      {
        id: 'location',
        en: 'Where is the problem?',
        zh: '漏水位置',
        th: 'ตำแหน่งที่รั่ว',
        options: [
          { value: 'ceiling', en: 'Ceiling', zh: '天花板', th: 'เพดาน' },
          { value: 'wall', en: 'Wall', zh: '墙面', th: 'ผนัง' },
          { value: 'floor', en: 'Floor / Drain', zh: '地面/排水', th: 'พื้น/ท่อระบาย' },
          { value: 'pipe', en: 'Visible pipe', zh: '外露管道', th: 'ท่อที่มองเห็น' },
          { value: 'toilet', en: 'Toilet / Basin', zh: '马桶/水盆', th: 'ชักโครก/อ่าง' },
        ],
      },
      {
        id: 'severity',
        en: 'How bad is the leak?',
        zh: '漏水严重程度',
        th: 'ความรุนแรงของการรั่ว',
        options: [
          { value: 'dripping', en: 'Dripping slowly', zh: '慢慢滴水', th: 'หยดช้าๆ' },
          { value: 'small', en: 'Small continuous flow', zh: '持续小漏', th: 'ไหลน้อยๆ ต่อเนื่อง' },
          { value: 'heavy', en: 'Heavy leak / flooding', zh: '大量漏水/积水', th: 'รั่วมาก/น้ำท่วม' },
        ],
      },
    ],
  },
  {
    id: 'electrical',
    icon: '⚡',
    en: 'Electrical / Wiring',
    zh: '电路 / 电器',
    th: 'ไฟฟ้า / สายไฟ',
    questions: [
      {
        id: 'problem',
        en: 'What is the issue?',
        zh: '电路问题类型',
        th: 'ประเภทปัญหาไฟฟ้า',
        options: [
          { value: 'no_power', en: 'No power / tripped breaker', zh: '断电/跳闸', th: 'ไฟดับ/เซอร์กิตตก' },
          { value: 'short', en: 'Short circuit / sparks', zh: '短路/打火花', th: 'ไฟฟ้าลัดวงจร/ประกาย' },
          { value: 'socket', en: 'Faulty socket / switch', zh: '插座/开关损坏', th: 'ปลั๊ก/สวิตช์เสีย' },
          { value: 'light', en: 'Light fixture problem', zh: '灯具问题', th: 'ปัญหาโคมไฟ' },
          { value: 'new', en: 'New wiring / installation', zh: '新装/增设线路', th: 'เดินสายใหม่' },
        ],
      },
      {
        id: 'area',
        en: 'Affected area',
        zh: '影响范围',
        th: 'พื้นที่ที่ได้รับผลกระทบ',
        options: [
          { value: 'one_point', en: 'Single outlet / light', zh: '单个插座/灯', th: 'จุดเดียว' },
          { value: 'one_room', en: 'One room', zh: '一个房间', th: 'ห้องเดียว' },
          { value: 'whole_house', en: 'Whole house', zh: '全屋', th: 'ทั้งบ้าน' },
        ],
      },
    ],
  },
  {
    id: 'painting',
    icon: '🎨',
    en: 'Painting / Wall Repair',
    zh: '油漆 / 墙面',
    th: 'ทาสี / ผนัง',
    questions: [
      {
        id: 'problem',
        en: 'What needs to be done?',
        zh: '需要做什么',
        th: 'ต้องการทำอะไร',
        options: [
          { value: 'peeling', en: 'Paint peeling / flaking', zh: '油漆脱落/起皮', th: 'สีลอก/หลุด' },
          { value: 'mold', en: 'Mold / damp stains', zh: '发霉/水渍', th: 'ราขึ้น/คราบชื้น' },
          { value: 'crack', en: 'Cracks in wall', zh: '墙面裂缝', th: 'ผนังแตกร้าว' },
          { value: 'repaint', en: 'Full repaint', zh: '全部重新刷漆', th: 'ทาสีใหม่ทั้งหมด' },
        ],
      },
      {
        id: 'size',
        en: 'Approximate area',
        zh: '大概面积',
        th: 'พื้นที่โดยประมาณ',
        options: [
          { value: 'small', en: 'Small (< 5 sq.m)', zh: '小面积（5平米以内）', th: 'เล็ก (< 5 ตร.ม.)' },
          { value: 'medium', en: 'Medium (5-20 sq.m)', zh: '中等（5-20平米）', th: 'กลาง (5-20 ตร.ม.)' },
          { value: 'large', en: 'Large (> 20 sq.m)', zh: '大面积（20平米以上）', th: 'ใหญ่ (> 20 ตร.ม.)' },
        ],
      },
    ],
  },
  {
    id: 'flooring',
    icon: '🏠',
    en: 'Flooring / Tiles',
    zh: '地板 / 瓷砖',
    th: 'พื้น / กระเบื้อง',
    questions: [
      {
        id: 'problem',
        en: 'What is the problem?',
        zh: '地板问题类型',
        th: 'ประเภทปัญหาพื้น',
        options: [
          { value: 'cracked', en: 'Cracked / broken tile', zh: '瓷砖破裂', th: 'กระเบื้องแตก' },
          { value: 'loose', en: 'Loose / hollow tile', zh: '瓷砖松动/空鼓', th: 'กระเบื้องหลวม' },
          { value: 'new', en: 'New tile installation', zh: '新铺瓷砖', th: 'ปูกระเบื้องใหม่' },
          { value: 'grout', en: 'Grout / joint repair', zh: '填缝修复', th: 'ซ่อมยาแนว' },
        ],
      },
      {
        id: 'size',
        en: 'Area size',
        zh: '面积大小',
        th: 'ขนาดพื้นที่',
        options: [
          { value: 'few', en: 'Few tiles (< 5 pcs)', zh: '少量瓷砖（5块以内）', th: 'น้อย (< 5 แผ่น)' },
          { value: 'room', en: 'One room', zh: '一个房间', th: 'ห้องเดียว' },
          { value: 'large', en: 'Multiple rooms', zh: '多个房间', th: 'หลายห้อง' },
        ],
      },
    ],
  },
  {
    id: 'carpentry',
    icon: '🪟',
    en: 'Doors / Windows / Carpentry',
    zh: '门窗 / 木工',
    th: 'ประตู / หน้าต่าง / ช่างไม้',
    questions: [
      {
        id: 'item',
        en: 'What needs fixing?',
        zh: '需要修理什么',
        th: 'อะไรที่ต้องซ่อม',
        options: [
          { value: 'door', en: 'Door (stuck / broken)', zh: '门（变形/损坏）', th: 'ประตู (ติด/แตก)' },
          { value: 'window', en: 'Window (broken / leak)', zh: '窗户（破损/漏雨）', th: 'หน้าต่าง (แตก/รั่ว)' },
          { value: 'lock', en: 'Lock / handle', zh: '锁/门把手', th: 'กุญแจ/มือจับ' },
          { value: 'furniture', en: 'Built-in furniture', zh: '定制家具/橱柜', th: 'เฟอร์นิเจอร์ build-in' },
          { value: 'partition', en: 'Partition wall', zh: '隔断墙', th: 'ผนังกั้นห้อง' },
        ],
      },
    ],
  },
  {
    id: 'aircon',
    icon: '❄️',
    en: 'Air Conditioning',
    zh: '空调',
    th: 'แอร์คอนดิชัน',
    questions: [
      {
        id: 'problem',
        en: 'What is the issue?',
        zh: '空调问题',
        th: 'ปัญหาแอร์',
        options: [
          { value: 'not_cooling', en: 'Not cooling properly', zh: '不制冷/效果差', th: 'ไม่เย็น/เย็นน้อย' },
          { value: 'water_leak', en: 'Water dripping inside', zh: '内机漏水', th: 'น้ำหยดในห้อง' },
          { value: 'noise', en: 'Strange noise', zh: '有异响', th: 'มีเสียงผิดปกติ' },
          { value: 'not_working', en: 'Not turning on', zh: '无法开机', th: 'เปิดไม่ติด' },
          { value: 'install', en: 'New installation', zh: '新装/移机', th: 'ติดตั้งใหม่/ย้าย' },
          { value: 'clean', en: 'Cleaning / service', zh: '清洗/保养', th: 'ล้าง/บำรุงรักษา' },
        ],
      },
      {
        id: 'units',
        en: 'Number of units',
        zh: '空调台数',
        th: 'จำนวนเครื่องแอร์',
        options: [
          { value: '1', en: '1 unit', zh: '1台', th: '1 เครื่อง' },
          { value: '2-3', en: '2-3 units', zh: '2-3台', th: '2-3 เครื่อง' },
          { value: '4+', en: '4+ units', zh: '4台以上', th: '4 เครื่องขึ้นไป' },
        ],
      },
    ],
  },
  {
    id: 'roofing',
    icon: '🏚️',
    en: 'Roof / Waterproofing',
    zh: '屋顶 / 防水',
    th: 'หลังคา / กันรั่ว',
    questions: [
      {
        id: 'problem',
        en: 'What is the problem?',
        zh: '屋顶问题',
        th: 'ปัญหาหลังคา',
        options: [
          { value: 'leak', en: 'Roof leaking into room', zh: '屋顶漏雨进室内', th: 'หลังคารั่วเข้าห้อง' },
          { value: 'tile', en: 'Broken / missing roof tiles', zh: '屋顶瓦片损坏/缺失', th: 'กระเบื้องแตก/หาย' },
          { value: 'waterproof', en: 'Waterproofing needed', zh: '需要做防水', th: 'ต้องทำกันซึม' },
          { value: 'gutter', en: 'Gutter / drain blocked', zh: '排水沟堵塞', th: 'รางน้ำอุด' },
        ],
      },
    ],
  },
  {
    id: 'construction',
    icon: '🏗️',
    en: 'Construction / Renovation',
    zh: '小型建筑 / 装修',
    th: 'งานก่อสร้าง / รีโนเวท',
    questions: [
      {
        id: 'work',
        en: 'Type of work',
        zh: '工程类型',
        th: 'ประเภทงาน',
        options: [
          { value: 'wall', en: 'Build / remove wall', zh: '砌墙/拆墙', th: 'ก่อ/รื้อผนัง' },
          { value: 'bathroom', en: 'Bathroom renovation', zh: '卫生间翻新', th: 'รีโนเวทห้องน้ำ' },
          { value: 'kitchen', en: 'Kitchen renovation', zh: '厨房翻新', th: 'รีโนเวทครัว' },
          { value: 'extension', en: 'Room extension', zh: '房间扩建', th: 'ต่อเติมห้อง' },
          { value: 'fence', en: 'Fence / gate', zh: '围墙/大门', th: 'รั้ว/ประตู' },
          { value: 'pool', en: 'Pool repair / renovation', zh: '泳池维修/翻新', th: 'ซ่อม/รีโนเวทสระ' },
        ],
      },
    ],
  },
  {
    id: 'general',
    icon: '🔧',
    en: 'Other / Not Listed',
    zh: '其他 / 未列出的问题',
    th: 'อื่นๆ / ไม่อยู่ในรายการ',
    questions: [], // free text
  },
]

// ─── Labels ───────────────────────────────────────────────────────────────────

const LABELS = {
  selectType: { en: 'Select the type of work', zh: '选择服务类型', th: 'เลือกประเภทงาน' },
  additionalNotes: { en: 'Additional notes (optional)', zh: '补充说明（可选）', th: 'หมายเหตุเพิ่มเติม (ไม่บังคับ)' },
  freeText: { en: 'Describe your problem', zh: '描述您的问题', th: 'อธิบายปัญหาของคุณ' },
  freeTextPlaceholder: {
    en: 'e.g. The toilet is overflowing, water coming out from under the cistern...',
    zh: '例如：马桶持续溢水，水从水箱底部渗出...',
    th: 'เช่น ชักโครกน้ำล้น น้ำออกจากใต้แท็งค์...',
  },
  notesPlaceholder: {
    en: 'Any additional details...',
    zh: '其他补充信息...',
    th: 'รายละเอียดเพิ่มเติม...',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  lang: Lang
  onChange: (summary: string, category: string) => void
}

export default function RepairDescriptionForm({ lang, onChange }: Props) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [freeText, setFreeText] = useState('')

  const serviceType = SERVICE_TYPES.find(s => s.id === selectedType)

  function handleTypeSelect(typeId: string) {
    setSelectedType(typeId)
    setAnswers({})
    setFreeText('')
    setNotes('')
    // Notify parent immediately with just the category
    const type = SERVICE_TYPES.find(s => s.id === typeId)
    if (type) {
      onChange(type[lang], typeId)
    }
  }

  function handleAnswer(questionId: string, value: string) {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    buildAndNotify(newAnswers, notes, freeText)
  }

  function handleNotes(val: string) {
    setNotes(val)
    buildAndNotify(answers, val, freeText)
  }

  function handleFreeText(val: string) {
    setFreeText(val)
    buildAndNotify(answers, notes, val)
  }

  function buildAndNotify(
    ans: Record<string, string>,
    note: string,
    free: string
  ) {
    if (!serviceType) return

    const parts: string[] = []
    const category = serviceType.id

    // Type name
    parts.push(`Type: ${serviceType.en}`)

    if (serviceType.id === 'general') {
      if (free) parts.push(free)
    } else {
      // Add question answers
      for (const q of serviceType.questions) {
        const val = ans[q.id]
        if (val) {
          const opt = q.options.find(o => o.value === val)
          if (opt) parts.push(`${q.en}: ${opt.en}`)
        }
      }
    }

    if (note) parts.push(`Additional info: ${note}`)

    onChange(parts.join('. '), category)
  }

  const l = (obj: Record<Lang, string>) => obj[lang]

  return (
    <div className="space-y-5">
      {/* Type selector */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">{l(LABELS.selectType)}</p>
        <div className="grid grid-cols-4 gap-2">
          {SERVICE_TYPES.map(type => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleTypeSelect(type.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all ${
                selectedType === type.id
                  ? 'border-sky-500 bg-sky-50 text-sky-700'
                  : 'border-gray-100 bg-white text-gray-600 hover:border-sky-200 hover:bg-sky-50'
              }`}
            >
              <span className="text-2xl">{type.icon}</span>
              <span className="text-xs font-medium leading-tight">{type[lang]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Guided questions */}
      {serviceType && (
        <div className="space-y-4 animate-fadeIn">
          {serviceType.id === 'general' ? (
            // Free text for "other"
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {l(LABELS.freeText)}
              </label>
              <textarea
                value={freeText}
                onChange={e => handleFreeText(e.target.value)}
                rows={4}
                placeholder={l(LABELS.freeTextPlaceholder)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
              />
            </div>
          ) : (
            serviceType.questions.map(q => (
              <div key={q.id}>
                <p className="text-sm font-medium text-gray-700 mb-2">{q[lang]}</p>
                <div className="flex flex-wrap gap-2">
                  {q.options.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleAnswer(q.id, opt.value)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        answers[q.id] === opt.value
                          ? 'bg-sky-500 text-white border-sky-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:text-sky-600'
                      }`}
                    >
                      {opt[lang]}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Additional notes */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              {l(LABELS.additionalNotes)}
            </label>
            <textarea
              value={notes}
              onChange={e => handleNotes(e.target.value)}
              rows={2}
              placeholder={l(LABELS.notesPlaceholder)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none text-gray-600"
            />
          </div>
        </div>
      )}
    </div>
  )
}
