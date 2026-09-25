// ─── Service Categories ───────────────────────────────────────────────────────

export type ServiceType = 'repair' | 'construction'

export type RepairCategory =
  | 'plumbing'      // 水管/漏水
  | 'electrical'    // 电路/电器
  | 'painting'      // 油漆/粉刷
  | 'flooring'      // 地板/瓷砖
  | 'carpentry'     // 木工/门窗
  | 'aircon'        // 空调
  | 'roofing'       // 屋顶/防水
  | 'general'       // 一般维修
  | 'construction'  // 小型建筑工程

export type OrderStatus =
  | 'pending'       // 待确认
  | 'confirmed'     // 已确认
  | 'paid'          // 已付定金
  | 'in_progress'   // 施工中
  | 'completed'     // 已完成
  | 'cancelled'     // 已取消

// ─── AI Analysis Result ───────────────────────────────────────────────────────

export interface MaterialItem {
  item: string          // material name
  quantity: string      // e.g. "2 meters", "4 pcs"
  unit_price_thb?: number
}

export interface AIAnalysisResult {
  // For customer
  problem_summary: string
  category: RepairCategory
  estimated_labor_min: number
  estimated_labor_max: number
  estimated_material_min: number
  estimated_material_max: number
  estimated_days: string
  workers_needed: string
  workers_count?: number
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  is_new_construction: boolean
  materials_needed?: MaterialItem[]   // list of materials for customer

  // Internal only (for admin)
  internal_diagnosis: string
  tools_required: string[]
  worker_types: string[]
  worker_count_needed?: number
  work_steps: string[]
  risk_notes: string
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface RepairOrder {
  id: string                       // 订单号 e.g. "MR-20260921-001"
  service_type: ServiceType
  category: RepairCategory
  status: OrderStatus

  // Customer info
  customer_name: string
  customer_phone: string
  customer_line?: string
  customer_whatsapp?: string
  address: string
  preferred_date: string           // 预约日期
  preferred_time: string           // 上午/下午/全天
  notes?: string                   // 客户备注
  language: 'en' | 'zh' | 'th'    // 客户使用的语言

  // Images
  images: string[]                 // Cloudinary URLs

  // AI analysis
  ai_analysis?: AIAnalysisResult

  // Pricing
  labor_fee: number                // 确认的人工费
  material_fee: number             // 确认的材料费
  total_fee: number                // 总费用
  deposit_fee: number              // 预付定金（50%工时费）
  deposit_paid: boolean
  deposit_paid_at?: string
  deposit_screenshot?: string      // 付款截图

  // Timestamps
  created_at: string
  updated_at: string
  completed_at?: string
}

// ─── Category Labels (3 languages) ───────────────────────────────────────────

export const CATEGORY_LABELS: Record<RepairCategory, Record<string, string>> = {
  plumbing:      { en: 'Plumbing / Water Leak', zh: '水管 / 漏水', th: 'ประปา / น้ำรั่ว' },
  electrical:    { en: 'Electrical / Wiring', zh: '电路 / 电器', th: 'ไฟฟ้า / สายไฟ' },
  painting:      { en: 'Painting / Wall Repair', zh: '油漆 / 粉刷', th: 'ทาสี / ปูนผนัง' },
  flooring:      { en: 'Flooring / Tiles', zh: '地板 / 瓷砖', th: 'พื้น / กระเบื้อง' },
  carpentry:     { en: 'Carpentry / Doors & Windows', zh: '木工 / 门窗', th: 'ช่างไม้ / ประตูหน้าต่าง' },
  aircon:        { en: 'Air Conditioning', zh: '空调维修', th: 'แอร์คอนดิชัน' },
  roofing:       { en: 'Roofing / Waterproofing', zh: '屋顶 / 防水', th: 'หลังคา / กันรั่ว' },
  general:       { en: 'General Maintenance', zh: '一般维修', th: 'งานซ่อมทั่วไป' },
  construction:  { en: 'Small Construction / Renovation', zh: '小型建筑 / 装修改造', th: 'งานก่อสร้าง / รีโนเวท' },
}

export const STATUS_LABELS: Record<OrderStatus, Record<string, string>> = {
  pending:     { en: 'Pending', zh: '待确认', th: 'รอยืนยัน' },
  confirmed:   { en: 'Confirmed', zh: '已确认', th: 'ยืนยันแล้ว' },
  paid:        { en: 'Deposit Paid', zh: '已付定金', th: 'ชำระมัดจำแล้ว' },
  in_progress: { en: 'In Progress', zh: '施工中', th: 'กำลังดำเนินการ' },
  completed:   { en: 'Completed', zh: '已完成', th: 'เสร็จสิ้น' },
  cancelled:   { en: 'Cancelled', zh: '已取消', th: 'ยกเลิก' },
}

export const URGENCY_LABELS: Record<string, Record<string, string>> = {
  low:       { en: 'Low', zh: '低', th: 'ต่ำ' },
  medium:    { en: 'Medium', zh: '中等', th: 'ปานกลาง' },
  high:      { en: 'High', zh: '紧急', th: 'สูง' },
  emergency: { en: 'Emergency', zh: '非常紧急', th: 'ฉุกเฉิน' },
}

export const MINIMUM_LABOR_FEE = 2000 // THB — covers minimum 2 workers
export const MINIMUM_WORKERS = 2      // Always send at least 2 workers
export const DEPOSIT_RATE = 0.5       // 50%
