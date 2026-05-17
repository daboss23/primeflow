import { RevenueCalculator } from '@/components/calculator/RevenueCalculator'
import { PageHeader } from '@/components/ui/PageHeader'

export default function CalculatorPage() {
  return (
    <div className="px-10 py-10 max-w-[1100px]">
      <PageHeader
        eyebrow="Revenue Intelligence"
        title="Revenue Gap Calculator"
        subtitle="See how much revenue your store is likely leaving on the table every month — and what you could recover."
      />
      <RevenueCalculator />
    </div>
  )
}
