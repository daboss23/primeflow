import type { HealthBand, CustomerState } from '@/types'
import { bandColor, stateColor, stateLabel } from '@/lib/utils'

// ─── Health Dot ───────────────────────────────────────────────────────────────
export function HealthDot({ band, size = 7 }: { band: HealthBand; size?: number }) {
  const color = bandColor(band)
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${size}px ${color}88`,
        flexShrink: 0,
      }}
    />
  )
}

// ─── State Badge ──────────────────────────────────────────────────────────────
export function StateBadge({ state }: { state: CustomerState }) {
  const color = stateColor(state)
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border"
      style={{
        color,
        borderColor: color + '44',
        background: color + '14',
      }}
    >
      {stateLabel(state)}
    </span>
  )
}

// ─── Score Bar ────────────────────────────────────────────────────────────────
export function ScoreBar({
  value,
  color,
  label,
}: {
  value: number
  color: string
  label: string
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[9px] uppercase tracking-[0.1em] text-white/30">{label}</span>
        <span
          className="text-xl font-medium"
          style={{ fontFamily: 'var(--font-jetbrains)', color }}
        >
          {value}
        </span>
      </div>
      <div className="h-[2px] rounded-full bg-white/[0.07] overflow-hidden">
        <div
          className="h-full rounded-full score-bar-fill"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  )
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-[11px] text-white/35 shrink-0">{label}</span>
      <span className="text-[12px] text-white/75 text-right font-medium">{value}</span>
    </div>
  )
}

// ─── Section Label ────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] uppercase tracking-[0.12em] text-white/30 mb-2">
      {children}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 ${className}`}
    >
      {children}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  color,
  sub,
}: {
  label: string
  value: string | number
  color?: string
  sub?: string
}) {
  return (
    <div className="rounded-lg bg-white/[0.025] border border-white/[0.05] p-3.5">
      <div className="text-[9px] uppercase tracking-[0.1em] text-white/30 mb-1.5">{label}</div>
      <div
        className="text-2xl font-medium"
        style={{ fontFamily: 'var(--font-jetbrains)', color: color ?? '#e8e8f4' }}
      >
        {value}
      </div>
      {sub && <div className="text-[10px] text-white/25 mt-1">{sub}</div>}
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  children,
  onClick,
  variant = 'default',
  disabled = false,
  className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  disabled?: boolean
  className?: string
}) {
  const variants = {
    default:
      'border-white/[0.12] text-white/60 hover:text-white/90 hover:border-white/25 hover:bg-white/[0.04]',
    primary:
      'border-transparent bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90',
    danger:
      'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50',
    ghost:
      'border-transparent text-white/40 hover:text-white/70',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
        text-[12px] font-medium border transition-all
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({
  initials,
  band,
  size = 40,
}: {
  initials: string
  band: HealthBand
  size?: number
}) {
  const gradients: Record<HealthBand, string> = {
    red: 'linear-gradient(135deg,#8b1a2e,#c0253a)',
    yellow: 'linear-gradient(135deg,#7a4f00,#b37700)',
    green: 'linear-gradient(135deg,#005c33,#00a854)',
  }
  return (
    <div
      className="flex items-center justify-center text-white font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: gradients[band],
        fontSize: size * 0.3,
      }}
    >
      {initials}
    </div>
  )
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className="animate-spin"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
      <path
        d="M8 2a6 6 0 0 1 6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function Empty({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-white/25 text-[13px]">
      {message}
    </div>
  )
}
