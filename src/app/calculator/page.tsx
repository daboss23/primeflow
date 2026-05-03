import { RevenueCalculator } from '@/components/calculator/RevenueCalculator'
import { PageHeader } from '@/components/ui/PageHeader'

export default function CalculatorPage() {
  return (
    <div className="p-7 max-w-[860px]">
      <PageHeader
        title="Revenue Gap Calculator"
        subtitle="See how much revenue your store is likely leaving on the table every month — and what you could recover."
      />
      <RevenueCalculator />
    </div>
  )
}
