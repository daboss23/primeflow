'use client'

import Image from 'next/image'

interface LogoPulseProps {
  width?: number
  variant?: 'sidebar' | 'dashboard' | 'standalone'
  className?: string
}

const EMBLEM_X = '50%'
const EMBLEM_Y = '29%'

export function LogoPulse({ width = 200, variant = 'sidebar', className = '' }: LogoPulseProps) {
  const height = Math.round(width * (187 / 280))

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative select-none" style={{ width, height }}>
        <Image
          src="/rre-logo-sm.png"
          alt="Revenue Recovery Engine"
          width={width}
          height={height}
          className="relative z-10"
          priority
          style={{ width: '100%', height: 'auto', mixBlendMode: 'screen' }}
        />
        <div
          className="logo-pulse-inner"
          style={{
            position: 'absolute',
            left: EMBLEM_X,
            top: EMBLEM_Y,
            transform: 'translate(-50%, -50%)',
            width: width * 0.19,
            height: width * 0.19,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,255,0.55) 0%, rgba(0,212,255,0.18) 45%, transparent 70%)',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        />
        <div
          className="logo-pulse-outer"
          style={{
            position: 'absolute',
            left: EMBLEM_X,
            top: EMBLEM_Y,
            transform: 'translate(-50%, -50%)',
            width: width * 0.34,
            height: width * 0.34,
            borderRadius: '50%',
            background: 'radial-gradient(circle, transparent 30%, rgba(120,80,255,0.12) 60%, transparent 80%)',
            zIndex: 19,
            pointerEvents: 'none',
          }}
        />
      </div>
      {(variant === 'dashboard' || variant === 'sidebar') && (
        <div className="text-[9px] tracking-[0.28em] text-[#00d4ff]/60 uppercase mt-1 font-medium">
          Intelligence Core
        </div>
      )}
    </div>
  )
}
