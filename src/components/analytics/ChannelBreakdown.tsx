'use client'

import type { ChannelBreakdown as ChannelBreakdownType } from '@/types'

export function ChannelBreakdown({ channels }: { channels: ChannelBreakdownType[] }) {
  if (!channels || channels.length === 0) {
    return <div className="text-white/25 text-xs py-4">No outreach data yet</div>
  }

  const cols = ['Channel', 'Sent', 'Replied', 'Converted']

  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr>
          {cols.map((col) => (
            <th
              key={col}
              className="text-left pb-3 text-[9px] uppercase tracking-[0.1em] text-white/30 font-normal"
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {channels.map((ch) => (
          <tr key={ch.channel} className="border-t border-white/[0.04]">
            <td className="py-3 capitalize text-white/70 font-medium">{ch.channel}</td>
            <td className="py-3 text-white/50" style={{ fontFamily: 'var(--font-jetbrains)' }}>
              {ch.sent}
            </td>
            <td className="py-3 text-[#00d4ff]" style={{ fontFamily: 'var(--font-jetbrains)' }}>
              {ch.replied}
            </td>
            <td className="py-3 text-[#00e676]" style={{ fontFamily: 'var(--font-jetbrains)' }}>
              {ch.converted}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
