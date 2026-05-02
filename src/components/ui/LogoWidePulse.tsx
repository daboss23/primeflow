'use client'

import Image from 'next/image'

export function LogoWidePulse({ width = 420 }: { width?: number }) {
  const height = Math.round(width * (220 / 1200))

  return (
    <div style={{ position: 'relative', display: 'inline-block', width }}>

      {/* Logo image */}
      <div style={{ position: 'relative', width, height, zIndex: 10 }}>
        <Image
          src="/rre-logo-wide.png"
          alt="Revenue Recovery Engine"
          width={width}
          height={height}
          priority
          style={{ width: '100%', height: 'auto', display: 'block', mixBlendMode: 'lighten' }}
        />

        {/* Subtle electric glow that breathes over the logo */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,212,255,0.07) 0%, rgba(120,80,255,0.04) 50%, transparent 75%)',
          animation: 'wide-glow-pulse 3s ease-in-out infinite',
          borderRadius: 4,
        }} />
      </div>

      {/* Small spark particles — only around the logo edges, not above */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }} aria-hidden="true">
        {[
          { left: '3%',  top: '20%', delay: '0.0s', color: '#00d4ff', dur: '3.2s' },
          { left: '12%', top: '10%', delay: '0.8s', color: '#a78bfa', dur: '2.9s' },
          { left: '28%', top: '8%',  delay: '1.5s', color: '#00d4ff', dur: '3.5s' },
          { left: '50%', top: '5%',  delay: '0.4s', color: '#ffffff', dur: '3.0s' },
          { left: '68%', top: '9%',  delay: '1.1s', color: '#a78bfa', dur: '2.8s' },
          { left: '82%', top: '15%', delay: '0.6s', color: '#00d4ff', dur: '3.3s' },
          { left: '95%', top: '25%', delay: '1.9s', color: '#00d4ff', dur: '2.7s' },
          { left: '90%', top: '60%', delay: '2.3s', color: '#a78bfa', dur: '3.1s' },
          { left: '2%',  top: '65%', delay: '1.2s', color: '#00d4ff', dur: '2.6s' },
          { left: '45%', top: '88%', delay: '0.9s', color: '#ffffff', dur: '3.4s' },
        ].map((s, i) => (
          <span key={i} style={{
            position: 'absolute', left: s.left, top: s.top,
            width: '2px', height: '2px', borderRadius: '50%',
            background: s.color,
            boxShadow: `0 0 4px 2px ${s.color}99`,
            animation: `spark-rise ${s.dur} ease-out infinite ${s.delay}`,
          }} />
        ))}
      </div>

      {/* INTELLIGENCE CORE */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '10px', marginTop: '6px', position: 'relative', zIndex: 40,
      }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5))' }} />
        <span style={{
          fontFamily: 'var(--font-cinzel), Georgia, serif',
          fontSize: '10px', fontWeight: 600, letterSpacing: '0.3em',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
          color: 'rgba(0,212,255,0.8)',
          textShadow: '0 0 10px rgba(0,212,255,0.5)',
          animation: 'core-label-pulse 3.2s ease-in-out infinite',
        }}>
          INTELLIGENCE CORE
        </span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(0,212,255,0.5), transparent)' }} />
      </div>

    </div>
  )
}
