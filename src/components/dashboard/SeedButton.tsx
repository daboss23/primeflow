'use client'

import { useState } from 'react'
import { Button, Spinner } from '@/components/ui'

export function SeedButton({ hasData }: { hasData: boolean }) {
  const [status, setStatus] = useState<'idle' | 'seeding' | 'scoring' | 'done' | 'error'>('idle')

  const seed = async () => {
    if (status === 'seeding' || status === 'scoring') return
    setStatus('seeding')
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      if (!res.ok) throw new Error('Seed failed')

      setStatus('scoring')
      await new Promise((r) => setTimeout(r, 400))
      setStatus('done')
      setTimeout(() => window.location.reload(), 300)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const rescore = async () => {
    setStatus('seeding')
    try {
      await fetch('/api/score', { method: 'POST' })
      window.location.reload()
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const isLoading = status === 'seeding' || status === 'scoring'

  const label = {
    idle:    hasData ? 'Re-seed Demo' : 'Load Demo Data →',
    seeding: 'Loading customers…',
    scoring: 'Scoring engine running…',
    done:    '✓ Ready',
    error:   'Failed — retry?',
  }[status as 'idle' | 'seeding' | 'scoring' | 'done' | 'error']

  return (
    <div className="flex gap-2 items-center">
      <Button
        onClick={seed}
        disabled={isLoading}
        variant={hasData ? 'default' : 'primary'}
        className={hasData ? '' : 'px-4 py-2 text-[13px]'}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Spinner size={12} />
            {label}
          </span>
        ) : (
          label
        )}
      </Button>
      {hasData && (
        <Button onClick={rescore} disabled={isLoading} variant="default">
          Run Scoring
        </Button>
      )}
    </div>
  )
}
