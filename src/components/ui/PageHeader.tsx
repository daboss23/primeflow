// Canonical page header — used on every top-level page.

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className = '',
}: {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header className={`flex items-start justify-between gap-6 mb-9 ${className}`}>
      <div className="flex items-stretch gap-4 min-w-0">
        <div
          className="flex-shrink-0 rounded-full self-stretch"
          style={{
            width: 2,
            minHeight: 48,
            background: 'linear-gradient(180deg, #00d4ff 0%, rgba(167,139,250,0.85) 100%)',
            boxShadow: '0 0 16px rgba(0,212,255,0.35)',
          }}
        />
        <div className="min-w-0">
          {eyebrow && (
            <div className="eyebrow mb-2">{eyebrow}</div>
          )}
          <h1
            className="text-[29px] font-semibold tracking-[-0.015em] leading-tight"
            style={{ color: 'rgba(255,255,255,0.97)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-[14px] mt-2 leading-relaxed max-w-[68ch]"
              style={{ color: 'rgba(255,255,255,0.56)' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </header>
  )
}
