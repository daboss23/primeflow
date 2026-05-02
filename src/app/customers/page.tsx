import { CustomerListView } from '@/components/customers/CustomerListView'
import type { HealthBand, CustomerState } from '@/types'

interface Props {
  searchParams: Promise<{ band?: string; state?: string }>
}

export default async function CustomersPage({ searchParams }: Props) {
  const params = await searchParams
  const band = (params.band as HealthBand) || null
  const state = (params.state as CustomerState) || null

  return (
    <div className="flex h-screen overflow-hidden">
      <CustomerListView initialBand={band} initialState={state} />
    </div>
  )
}
