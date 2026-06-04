import { Fragment, useEffect, useState } from 'react'
import '../styles/Typewriter.css'

// Types out the segments marked `typed: true` one character at a time, while
// static segments render in full immediately. The cursor blinks a few times and
// hides once typing finishes.
//   anchor="left"  (default) — normal left-to-right typing; the cursor advances
//                              and letters appear in place.
//   anchor="right"          — the word is right-anchored, so the cursor stays
//                              fixed on the right and letters push to the left.
// Each typed word reserves its full width either way, so the line never reflows.
// segments: array of { text, em?, typed? } or { br: true } for line breaks.
export default function Typewriter({ segments, anchor = 'left', speed = 110, startDelay = 600, className = '', ariaLabel }) {
  const total = segments.reduce((n, s) => n + (s.typed && s.text ? s.text.length : 0), 0)
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [count, setCount] = useState(prefersReduced ? total : 0)

  useEffect(() => {
    if (prefersReduced) return
    let i = 0
    let timer
    const tick = () => {
      i += 1
      setCount(i)
      if (i < total) timer = setTimeout(tick, speed)
    }
    const start = setTimeout(tick, startDelay)
    return () => { clearTimeout(start); clearTimeout(timer) }
  }, [total, speed, startDelay, prefersReduced])

  const done = count >= total
  const label = ariaLabel ?? segments.map((s) => (s.br ? ' ' : s.text)).join('')

  // Reveal each typed segment up to `count`.
  let remaining = count
  const parts = segments.map((s, idx) => {
    if (s.br) return { br: true, idx }
    if (!s.typed) return { text: s.text, em: s.em, idx }
    const consumed = Math.max(0, Math.min(s.text.length, remaining))
    remaining -= s.text.length
    return {
      idx,
      em: s.em,
      typed: true,
      full: s.text,
      shown: s.text.slice(0, consumed),
      pending: s.text.slice(consumed),
      complete: consumed >= s.text.length,
    }
  })

  // Cursor goes on the first not-yet-complete typed segment (or the last one).
  const typed = parts.filter((p) => p.typed)
  const active = typed.find((p) => !p.complete) ?? typed[typed.length - 1]
  const cursorIdx = active ? active.idx : -1

  const wrap = (text, em) => (em ? <em>{text}</em> : text)
  const cursor = (idx) =>
    idx === cursorIdx && <span className={`tw-cursor${done ? ' tw-cursor--ending' : ''}`} />

  return (
    <span className={className} role="text" aria-label={label}>
      <span aria-hidden="true">
        {parts.map((p) => {
          if (p.br) return <br key={p.idx} />
          if (!p.typed) return <Fragment key={p.idx}>{wrap(p.text, p.em)}</Fragment>

          if (anchor === 'right') {
            // Right-anchored: cursor fixed on the right, letters push left.
            return (
              <span key={p.idx} className="tw-typed tw-typed--right">
                <span className="tw-sizer">{wrap(p.full, p.em)}</span>
                <span className="tw-fill">
                  {wrap(p.shown, p.em)}
                  {cursor(p.idx)}
                </span>
              </span>
            )
          }

          // Left-to-right: cursor advances, untyped tail reserves its width.
          return (
            <span key={p.idx} className="tw-typed tw-typed--left">
              {wrap(p.shown, p.em)}
              {cursor(p.idx)}
              {p.pending && <span className="tw-pending">{wrap(p.pending, p.em)}</span>}
            </span>
          )
        })}
      </span>
    </span>
  )
}
