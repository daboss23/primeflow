import { RevenueCalculator } from '@/components/calculator/RevenueCalculator'

export default function CalculatorPage() {
  return (
    <div className="p-7 max-w-[860px]">
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.16em] text-[#00d4ff] mb-2">
          Revenue Recovery Engine
        </div>
        <h1 className="text-[28px] font-bold text-white mb-2">
          Revenue Gap Calculator
        </h1>
        <p className="text-[15px] text-white/55 max-w-lg">
          See how much revenue your store is likely leaving on the table every month — and what you could recover.
        </p>
      </div>
      <RevenueCalculator />
    </div>
  )
}
