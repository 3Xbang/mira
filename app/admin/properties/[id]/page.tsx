import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getPropertyByIdFromDB } from '@/lib/dynamodb'
import AdminSidebar from '@/components/admin/AdminSidebar'
import PropertyForm from './PropertyForm'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PropertyEditPage({ params }: Props) {
  if (!isAuthenticated()) redirect('/admin/login')

  const { id } = await params
  const isNew = id === 'new'

  let property = null
  if (!isNew) {
    property = await getPropertyByIdFromDB(id).catch(() => null)
    if (!property) redirect('/admin/properties')
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? '新增房产' : '编辑房产'}
            </h1>
            {!isNew && (
              <p className="text-gray-400 text-sm mt-1">ID: {id}</p>
            )}
          </div>
          <PropertyForm property={property} isNew={isNew} />
        </div>
      </main>
    </div>
  )
}
