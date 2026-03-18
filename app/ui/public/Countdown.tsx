'use client'
import { useState, useEffect } from 'react'

export type Delta = { d: number; h: number; m: number; s: number }

export function computeDelta(endsAt: Date): Delta | null {
  const diff = endsAt.getTime() - Date.now()
  if (diff <= 0) return null

  const totalSeconds = Math.floor(diff / 1000)
  const d = Math.floor(totalSeconds / 86400)
  const h = Math.floor((totalSeconds % 86400) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  return { d, h, m, s }
}

export function Countdown({ endsAt }: { endsAt: Date }) {
  const [delta, setDelta] = useState<Delta | null>(null)

  useEffect(() => {
    setDelta(computeDelta(endsAt))
    const id = setInterval(() => {
      setDelta(computeDelta(endsAt))
    }, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  if (delta === null && typeof window === 'undefined') {
    return <span className="text-zinc-400">Loading...</span>
  }

  if (delta === null) {
    return <span className="font-[tabular-nums] text-zinc-900">Deadline passed</span>
  }

  return (
    <span className="font-[tabular-nums] text-zinc-900">
      {delta.d}d {delta.h}h {delta.m}m {delta.s}s
    </span>
  )
}
