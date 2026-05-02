'use client'

import { useState } from 'react'
import { Button, Spinner } from '@/components/ui'

export function SeedButton({ hasData }: { hasData: boolean }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'seeding' | 'scoring' | 'done'>('idle')

  const seed = async () => {
    setLoading(true)
    try {
      setStatus('seeding')
      const res = await fetch('/api/seed', { method: 'POST' })
      if (!res.ok) throw new Error('Seed failed')

      setStatus('scoring')
      // scoring is already done inside seed, this just gives visual feedback
      await new Promise((r) => setTimeout(r, 600))

      setStatus('done')
      setTimeout(() => window.location.reload(), 500)
    } catch (e) {
      console.error(e)
      setStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  const rescore = async () => {
    setLoading(true)
    try {
      await fetch('/api/score', { method: 'POST' })
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  const label = {
    idle: hasData ? 'Re-seed Demo' : 'Load Demo Data →',
    seeding: 'Loading customers...',
    scoring: 'Running scoring engine...',
    done: '✓ Ready',
  }[status]

  return (
    <div className="flex gap-2 items-center">
      <Button
        onClick={seed}
        disabled={loading}
        variant={hasData ? 'default' : 'primary'}
        className={hasData ? '' : 'px-4 py-2 text-[13px]'}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Spinner size={12} />
            {label}
          </span>
        ) : (
          label
        )}
      </Button>
      {hasData && (
        <Button onClick={rescore} disabled={loading} variant="default">
          Run Scoring
        </Button>
      )}
    </div>
  )
}
