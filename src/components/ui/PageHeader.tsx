// FILE: src/components/ui/PageHeader.tsx
// Shared page heading component — use on every top-level page

export function PageHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-start gap-3 mb-8">
      {/* Left accent bar — matches Intelligence Core */}
      <div
        className="mt-1 flex-shrink-0 rounded-full"
        style={{
          width: 3,
          height: 28,
          background: 'linear-gradient(180deg, #00d4ff 0%, #7c3aed 100%)',
          boxShadow: '0 0 10px rgba(0,212,255,0.4)',
        }}
      />
      <div>
        <h1
          className="text-[26px] font-bold text-white tracking-tight leading-tight"
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-[13px] mt-1 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
