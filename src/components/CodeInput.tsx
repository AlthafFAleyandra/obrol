import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  length?: number
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

/** Kotak kode: auto-pindah fokus, backspace mundur, dan bisa paste 6 digit. */
export function CodeInput({ length = 6, value, onChange, autoFocus }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  function set(next: string[], focusIndex?: number) {
    onChange(next.join('').slice(0, length))
    if (focusIndex !== undefined) refs.current[Math.min(focusIndex, length - 1)]?.focus()
  }

  function handleInput(i: number, raw: string) {
    const clean = raw.replace(/\D/g, '')
    if (!clean) {
      const next = [...digits]
      next[i] = ''
      set(next)
      return
    }
    const next = [...digits]
    let pos = i
    for (const ch of clean) {
      if (pos >= length) break
      next[pos++] = ch
    }
    set(next, pos)
  }

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="Kode 6 digit">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleInput(i, e.target.value)}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[i] && i > 0) {
              const next = [...digits]
              next[i - 1] = ''
              set(next, i - 1)
              e.preventDefault()
            } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
            else if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus()
          }}
          onPaste={(e) => {
            e.preventDefault()
            const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
            if (!text) return
            set(Array.from({ length }, (_, k) => text[k] ?? ''), text.length)
          }}
          className={cn(
            'size-11 rounded-md border border-border bg-elevated text-center text-lg font-semibold text-foreground sm:size-12',
            d && 'border-accent',
          )}
        />
      ))}
    </div>
  )
}
