import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Certificates.css'

function Card({ cert, onOpen }) {
  const hasMeta = cert.title || cert.issuer || cert.date
  return (
    <button
      type="button"
      className="cert-card"
      onClick={() => cert.image && onOpen(cert)}
      aria-label={`View ${cert.title || cert.issuer || 'certificate'}`}
    >
      {cert.image ? (
        <img src={cert.image} alt={cert.title || cert.issuer || 'Certificate'} className="cert-card-image" loading="lazy" />
      ) : (
        <div className="cert-card-placeholder" aria-hidden="true" />
      )}
      {hasMeta && (
        <div className="cert-card-meta">
          {cert.title && <span className="cert-card-title">{cert.title}</span>}
          {cert.issuer && <span className="cert-card-issuer">{cert.issuer}</span>}
          {cert.date && <span className="cert-card-date">{cert.date}</span>}
        </div>
      )}
    </button>
  )
}

export default function Certificates({ open, items, user }) {
  const [active, setActive] = useState(null)
  const marqueeRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const onKey = (e) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active])

  const set = []
  if (items.length > 0) while (set.length < 8) set.push(...items)
  const loop = [...set, ...set]
  const duration = Math.max(30, set.length * 5)

  // Drive the carousel through scrollLeft so the auto-scroll animation and
  // manual mouse-wheel scrolling share one mechanism. The content is doubled,
  // so wrapping at the halfway point keeps the loop seamless in both directions.
  useEffect(() => {
    const el = marqueeRef.current
    if (!open || !el || items.length === 0) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let hovering = false
    let last = null
    let raf = 0
    // Track position as a float so tiny per-frame steps aren't lost to the
    // browser's pixel-snapping of scrollLeft — that keeps the loop moving.
    let pos = el.scrollLeft

    const norm = (x) => {
      const half = el.scrollWidth / 2
      if (x >= half) return x - half
      if (x < 0) return x + half
      return x
    }

    const step = (t) => {
      const dt = last == null ? 0 : Math.min(t - last, 50)
      last = t
      if (!hovering && dt > 0) {
        pos = norm(pos + (el.scrollWidth / 2 / (duration * 1000)) * dt)
        el.scrollLeft = pos
      }
      raf = requestAnimationFrame(step)
    }

    const onEnter = () => { hovering = true }
    const onLeave = () => { hovering = false; last = null; pos = el.scrollLeft }
    const onWheel = (e) => {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      if (!delta) return
      e.preventDefault()
      pos = norm(el.scrollLeft + delta)
      el.scrollLeft = pos
    }

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('wheel', onWheel, { passive: false })
    if (!reduce) raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('wheel', onWheel)
    }
  }, [open, items, duration])

  if (!open) return null

  const caption = active && (active.title || active.issuer || active.date || active.url)

  return (
    <div className="about-certificates">
      <div className="admin-section-header">
        <h2 className="about-section-title">Certificates</h2>
        {user && <Link to="/admin/certificates" className="admin-edit-link">Edit</Link>}
      </div>

      {items.length === 0 ? (
        <p className="cert-empty">No certificates yet.</p>
      ) : (
        <div className="cert-marquee" ref={marqueeRef}>
          <div className="cert-track">
            {loop.map((cert, i) => (
              <Card key={i} cert={cert} onOpen={setActive} />
            ))}
          </div>
        </div>
      )}

      {active && (
        <div className="cert-lightbox" onClick={() => setActive(null)}>
          <button className="cert-lightbox-close" aria-label="Close" onClick={() => setActive(null)}>×</button>
          <figure className="cert-lightbox-figure" onClick={(e) => e.stopPropagation()}>
            <img src={active.image} alt={active.title || active.issuer || 'Certificate'} className="cert-lightbox-image" />
            {caption && (
              <figcaption className="cert-lightbox-caption">
                {active.title && <span className="cert-lightbox-title">{active.title}</span>}
                {(active.issuer || active.date) && (
                  <span className="cert-lightbox-sub">
                    {[active.issuer, active.date].filter(Boolean).join(' · ')}
                  </span>
                )}
                {active.url && (
                  <a href={active.url} target="_blank" rel="noopener noreferrer" className="cert-lightbox-link">
                    Verify credential →
                  </a>
                )}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  )
}
