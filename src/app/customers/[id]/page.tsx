import { supabaseAdmin } from '@/lib/supabase'
import { CustomerDetail } from '@/components/customers/CustomerDetail'
import type { CustomerWithHealth } from '@/types'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

async function getCustomer(id: string): Promise<CustomerWithHealth | null> {
  const { data } = await supabaseAdmin
    .from('current_customer_health')
    .select('*')
    .eq('customer_id', id)
    .single()
  return data
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params
  const customer = await getCustomer(id)
  if (!customer) notFound()

  return <CustomerDetail customer={customer!} onRefresh={async () => {}} />
}
