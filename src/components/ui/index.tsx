import type { HealthBand, CustomerState } from '@/types'
import { bandColor, stateColor, stateLabel } from '@/lib/utils'

/* ─── Design tokens (mirror of globals.css for inline usage) ─────────────── */
export const tokens = {
  surface:        'rgba(255,255,255,0.022)',
  surfaceHover:   'rgba(255,255,255,0.035)',
  elevated:       'rgba(255,255,255,0.045)',
  borderSubtle:   'rgba(255,255,255,0.06)',
  borderDefault:  'rgba(255,255,255,0.08)',
  borderStrong:   'rgba(255,255,255,0.12)',
  textPrimary:    'rgba(255,255,255,0.95)',
  textSecondary:  'rgba(255,255,255,0.62)',
  textTertiary:   'rgba(255,255,255,0.45)',
  textMuted:      'rgba(255,255,255,0.32)',
  textFaint:      'rgba(255,255,255,0.22)',
  accent:         '#00d4ff',
  accentSoft:     'rgba(0,212,255,0.10)',
  accentBorder:   'rgba(0,212,255,0.22)',
  violet:         '#a78bfa',
  success:        '#3ddc97',
  warn:           '#ffaa00',
  danger:         '#ff4d6a',
} as const

/* ─── Section / eyebrow labels ───────────────────────────────────────────── */
export function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`eyebrow ${className}`}>{children}</div>
}

export function MetaLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-[11px] font-medium ${className}`} style={{ color: tokens.textTertiary }}>
      {children}
    </span>
  )
}

/* ─── Card ───────────────────────────────────────────────────────────────── */
type CardProps = {
  children: React.ReactNode
  className?: string
  padded?: boolean
  tone?: 'default' | 'elevated' | 'accent' | 'danger'
}
export function Card({ children, className = '', padded = true, tone = 'default' }: CardProps) {
  const tones: Record<string, React.CSSProperties> = {
    default:  { background: tokens.surface,    borderColor: tokens.borderSubtle },
    elevated: { background: tokens.elevated,   borderColor: tokens.borderDefault },
    accent:   { background: 'linear-gradient(180deg, rgba(0,212,255,0.05), rgba(0,212,255,0.01))', borderColor: tokens.accentBorder },
    danger:   { background: 'linear-gradient(180deg, rgba(255,77,106,0.05), rgba(255,77,106,0.01))', borderColor: 'rgba(255,77,106,0.22)' },
  }
  return (
    <div
      className={`rounded-[14px] border ${padded ? 'p-6' : ''} ${className}`}
      style={{ ...tones[tone], boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset' }}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  label, action, className = '',
}: { label: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between mb-5 ${className}`}>
      <SectionLabel>{label}</SectionLabel>
      {action}
    </div>
  )
}

/* ─── Stat / Metric Card ─────────────────────────────────────────────────── */
export function StatCard({
  label, value, sub, accent, icon, trend,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: string
  icon?: React.ReactNode
  trend?: { value: string; positive?: boolean }
}) {
  const c = accent ?? tokens.textPrimary
  return (
    <Card padded={false} className="px-5 py-5">
      <div className="flex items-start justify-between mb-3">
        <SectionLabel>{label}</SectionLabel>
        {icon && (
          <div
            className="w-7 h-7 rounded-[8px] flex items-center justify-center"
            style={{ background: `${c}14`, color: c, border: `1px solid ${c}22` }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="metric-num text-[30px] leading-none" style={{ color: c }}>
          {value}
        </div>
        {trend && (
          <span className="text-[11px] font-medium" style={{ color: trend.positive ? tokens.success : tokens.danger }}>
            {trend.value}
          </span>
        )}
      </div>
      {sub && <div className="text-[11.5px] mt-2" style={{ color: tokens.textMuted }}>{sub}</div>}
    </Card>
  )
}

/* ─── Buttons ────────────────────────────────────────────────────────────── */
type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'default'
  size?: 'sm' | 'md'
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
  icon?: React.ReactNode
}
export function Button({
  children, onClick, variant = 'secondary', size = 'md', disabled, type = 'button', className = '', icon,
}: ButtonProps) {
  const sizes = {
    sm: 'h-8 px-3 text-[12px]',
    md: 'h-9 px-4 text-[12.5px]',
  }
  const variants: Record<string, string> = {
    primary:
      'text-white border border-[rgba(0,212,255,0.35)] bg-[rgba(0,212,255,0.12)] hover:bg-[rgba(0,212,255,0.18)] hover:border-[rgba(0,212,255,0.55)]',
    secondary:
      'text-white/85 border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.025)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.20)] hover:text-white',
    default:
      'text-white/85 border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.025)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.20)] hover:text-white',
    ghost:
      'text-white/55 border border-transparent hover:text-white/90 hover:bg-[rgba(255,255,255,0.04)]',
    danger:
      'text-[#ff4d6a] border border-[rgba(255,77,106,0.30)] bg-[rgba(255,77,106,0.06)] hover:bg-[rgba(255,77,106,0.12)]',
    success:
      'text-[#3ddc97] border border-[rgba(61,220,151,0.30)] bg-[rgba(61,220,151,0.06)] hover:bg-[rgba(61,220,151,0.12)]',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-1.5 rounded-[10px] font-medium
        transition-all whitespace-nowrap
        disabled:opacity-40 disabled:cursor-not-allowed
        ${sizes[size]} ${variants[variant]} ${className}
      `}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  )
}

/* ─── Inputs ─────────────────────────────────────────────────────────────── */
type InputProps = React.InputHTMLAttributes<HTMLInputElement>
export function Input({ className = '', ...rest }: InputProps) {
  return (
    <input
      {...rest}
      className={`
        w-full h-10 rounded-[10px] px-3.5 text-[13px] text-white/90
        bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]
        placeholder:text-white/30
        transition-all focus:outline-none focus:border-[rgba(0,212,255,0.40)]
        focus:shadow-[0_0_0_3px_rgba(0,212,255,0.10)]
        ${className}
      `}
    />
  )
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>
export function Textarea({ className = '', ...rest }: TextareaProps) {
  return (
    <textarea
      {...rest}
      className={`
        w-full rounded-[10px] px-3.5 py-3 text-[13px] text-white/90 leading-relaxed
        bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]
        placeholder:text-white/30 resize-none
        transition-all focus:outline-none focus:border-[rgba(0,212,255,0.40)]
        focus:shadow-[0_0_0_3px_rgba(0,212,255,0.10)]
        ${className}
      `}
    />
  )
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>
export function Select({ className = '', children, ...rest }: SelectProps) {
  return (
    <select
      {...rest}
      className={`
        h-9 rounded-[10px] px-3 text-[12.5px] text-white/85 cursor-pointer
        bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]
        transition-all focus:outline-none focus:border-[rgba(0,212,255,0.40)]
        focus:shadow-[0_0_0_3px_rgba(0,212,255,0.10)]
        ${className}
      `}
    >
      {children}
    </select>
  )
}

export function Field({
  label, hint, children, className = '',
}: { label?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <div className="eyebrow">{label}</div>}
      {children}
      {hint && <div className="text-[11.5px] text-white/35">{hint}</div>}
    </div>
  )
}

/* ─── Pill / Badge / Status dot ──────────────────────────────────────────── */
type PillTone = 'neutral' | 'accent' | 'violet' | 'success' | 'warn' | 'danger'
const PILL_TONES: Record<PillTone, { c: string; bg: string; bd: string }> = {
  neutral: { c: 'rgba(255,255,255,0.75)', bg: 'rgba(255,255,255,0.05)', bd: 'rgba(255,255,255,0.10)' },
  accent:  { c: '#00d4ff',  bg: 'rgba(0,212,255,0.10)',   bd: 'rgba(0,212,255,0.25)' },
  violet:  { c: '#a78bfa',  bg: 'rgba(167,139,250,0.10)', bd: 'rgba(167,139,250,0.25)' },
  success: { c: '#3ddc97',  bg: 'rgba(61,220,151,0.10)',  bd: 'rgba(61,220,151,0.25)' },
  warn:    { c: '#ffaa00',  bg: 'rgba(255,170,0,0.10)',   bd: 'rgba(255,170,0,0.25)' },
  danger:  { c: '#ff4d6a',  bg: 'rgba(255,77,106,0.10)',  bd: 'rgba(255,77,106,0.28)' },
}
export function Pill({
  children, tone = 'neutral', className = '',
}: { children: React.ReactNode; tone?: PillTone; className?: string }) {
  const t = PILL_TONES[tone]
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-5 px-2 rounded-[6px] text-[10.5px] font-medium tracking-wide ${className}`}
      style={{ color: t.c, background: t.bg, border: `1px solid ${t.bd}` }}
    >
      {children}
    </span>
  )
}

export function StatusDot({ tone, glow = true, size = 6 }: { tone: PillTone; glow?: boolean; size?: number }) {
  const c = PILL_TONES[tone].c
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{
        width: size, height: size, background: c,
        boxShadow: glow ? `0 0 ${size}px ${c}88` : undefined,
      }}
    />
  )
}

/* ─── Health dot (legacy band) ───────────────────────────────────────────── */
export function HealthDot({ band, size = 7 }: { band: HealthBand; size?: number }) {
  const color = bandColor(band)
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{ width: size, height: size, background: color, boxShadow: `0 0 ${size}px ${color}88` }}
    />
  )
}

/* ─── State Badge ────────────────────────────────────────────────────────── */
export function StateBadge({ state }: { state: CustomerState }) {
  const color = stateColor(state)
  return (
    <span
      className="inline-flex items-center h-5 px-2 rounded-[6px] text-[10.5px] font-medium tracking-wide"
      style={{ color, background: color + '14', border: `1px solid ${color}38` }}
    >
      {stateLabel(state)}
    </span>
  )
}

/* ─── Score / progress bars ──────────────────────────────────────────────── */
export function ScoreBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="eyebrow">{label}</span>
        <span className="metric-num text-[18px]" style={{ color }}>{value}</span>
      </div>
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full score-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}

export function ProgressBar({ value, max = 100, color = tokens.accent, height = 3 }: {
  value: number; max?: number; color?: string; height?: number
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="rounded-full overflow-hidden" style={{ height, background: 'rgba(255,255,255,0.06)' }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

/* ─── Info row ───────────────────────────────────────────────────────────── */
export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b last:border-0" style={{ borderColor: tokens.borderSubtle }}>
      <span className="text-[11.5px]" style={{ color: tokens.textTertiary }}>{label}</span>
      <span className="text-[12.5px] font-medium text-right" style={{ color: tokens.textPrimary }}>{value}</span>
    </div>
  )
}

export function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px w-full ${className}`} style={{ background: tokens.borderSubtle }} />
}

/* ─── Avatar ─────────────────────────────────────────────────────────────── */
export function Avatar({ initials, band, size = 36 }: { initials: string; band: HealthBand; size?: number }) {
  const gradients: Record<HealthBand, string> = {
    red:    'linear-gradient(135deg, #4a0d1a 0%, #7d1a30 100%)',
    yellow: 'linear-gradient(135deg, #3d2a00 0%, #6e4d00 100%)',
    green:  'linear-gradient(135deg, #003824 0%, #006b42 100%)',
  }
  const rings: Record<HealthBand, string> = {
    red:    'rgba(255,77,106,0.30)',
    yellow: 'rgba(255,170,0,0.30)',
    green:  'rgba(61,220,151,0.30)',
  }
  return (
    <div
      className="flex items-center justify-center text-white font-semibold shrink-0 select-none"
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: gradients[band],
        fontSize: Math.round(size * 0.32),
        border: `1px solid ${rings[band]}`,
        letterSpacing: '0.02em',
      }}
    >
      {initials}
    </div>
  )
}

/* ─── Spinner ────────────────────────────────────────────────────────────── */
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="animate-spin">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
export function Empty({
  message, icon, action,
}: { message: string; icon?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div
          className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-4"
          style={{ background: tokens.surface, border: `1px solid ${tokens.borderSubtle}`, color: tokens.textTertiary }}
        >
          {icon}
        </div>
      )}
      <p className="text-[13px]" style={{ color: tokens.textTertiary }}>{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/* ─── Icon — monoline stroke wrapper ─────────────────────────────────────── */
export function Icon({ children, size = 14 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}

export { PageHeader } from './PageHeader'
