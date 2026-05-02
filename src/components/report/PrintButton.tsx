'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.12] text-white/60 text-[13px] hover:text-white hover:border-white/25 transition-all"
    >
      <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
        <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Download PDF
    </button>
  )
}
