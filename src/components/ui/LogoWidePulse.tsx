'use client'

import Image from 'next/image'

export function LogoWidePulse({ width = 420 }: { width?: number }) {
  const height = Math.round(width * 0.667)

  return (
    <div style={{ position: 'relative', display: 'inline-block', width }}>

      {/* Logo image */}
      <div style={{ position: 'relative', width, height, zIndex: 10 }}>
        <Image
          src="/axiom-logo.png"
          alt="AXIOM AI — Precision Intelligence Engine"
          width={width}
          height={height}
          priority
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            mixBlendMode: 'lighten',
            animation: 'wideLogoGlow 3.2s ease-in-out infinite',
          }}
        />

        {/* Breathing glow overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,212,255,0.07) 0%, rgba(120,80,255,0.04) 50%, transparent 75%)',
          animation: 'wideGlowPulse 3s ease-in-out infinite',
          borderRadius: 4,
        }} />
      </div>

      {/* Spark particles around the logo */}
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
            animation: `sparkRise ${s.dur} ease-out infinite ${s.delay}`,
          }} />
        ))}
      </div>

      {/* INTELLIGENCE CORE label */}
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
          animation: 'coreLabelPulse 3.2s ease-in-out infinite',
        }}>
          INTELLIGENCE CORE
        </span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(0,212,255,0.5), transparent)' }} />
      </div>

      <style>{`
        @keyframes wideLogoGlow {
          0%,100% { filter: drop-shadow(0 0 8px rgba(0,212,255,0.3)) drop-shadow(0 0 20px rgba(130,60,255,0.2)); }
          50%      { filter: drop-shadow(0 0 18px rgba(0,212,255,0.6)) drop-shadow(0 0 40px rgba(130,60,255,0.4)); }
        }
        @keyframes wideGlowPulse {
          0%,100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
        @keyframes sparkRise {
          0%   { opacity: 0; transform: translateY(0) scale(0.5); }
          20%  { opacity: 1; }
          80%  { opacity: 0.4; }
          100% { opacity: 0; transform: translateY(-12px) scale(1.2); }
        }
        @keyframes coreLabelPulse {
          0%,100% { opacity: 0.7; }
          50%      { opacity: 1; text-shadow: 0 0 16px rgba(0,212,255,0.8); }
        }
      `}</style>
    </div>
  )
}
