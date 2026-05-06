'use client'

import Image from 'next/image'

interface LogoPulseProps {
  width?: number
  variant?: 'sidebar' | 'dashboard' | 'standalone'
  className?: string
}

export function LogoPulse({ width = 200, variant = 'sidebar', className = '' }: LogoPulseProps) {
  const height = Math.round(width * 0.667) // roughly square-ish for this logo

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative select-none" style={{ width, height }}>

        {/* Outer pulse ring */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: width * 0.55, height: width * 0.55,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(130,60,255,0.15) 0%, transparent 70%)',
          animation: 'logoPulseOuter 3s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* Inner pulse ring */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: width * 0.32, height: width * 0.32,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, rgba(130,60,255,0.1) 50%, transparent 70%)',
          animation: 'logoPulseInner 3s ease-in-out infinite 0.5s',
          pointerEvents: 'none',
          zIndex: 2,
        }} />

        {/* The actual logo */}
        <Image
          src="/axiom-logo.png"
          alt="AXIOM AI"
          width={width}
          height={height}
          priority
          style={{
            width: '100%',
            height: 'auto',
            mixBlendMode: 'lighten',
            position: 'relative',
            zIndex: 10,
            animation: 'logoGlow 3s ease-in-out infinite',
          }}
        />

        <style>{`
          @keyframes logoPulseOuter {
            0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 0.6; }
            50%      { transform: translate(-50%,-50%) scale(2.4); opacity: 0; }
          }
          @keyframes logoPulseInner {
            0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 0.8; }
            50%      { transform: translate(-50%,-50%) scale(2.0); opacity: 0; }
          }
          @keyframes logoGlow {
            0%,100% { filter: drop-shadow(0 0 6px rgba(0,212,255,0.35)) drop-shadow(0 0 14px rgba(130,60,255,0.2)); }
            50%      { filter: drop-shadow(0 0 14px rgba(0,212,255,0.65)) drop-shadow(0 0 28px rgba(130,60,255,0.45)); }
          }
        `}</style>
      </div>

      {(variant === 'dashboard' || variant === 'sidebar') && (
        <div className="text-[9px] tracking-[0.28em] text-[#00d4ff]/60 uppercase mt-1 font-medium">
          Intelligence Core
        </div>
      )}
    </div>
  )
}
