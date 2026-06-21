import { useState, useEffect } from 'react'
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

  if (!open) return null

  const caption = active && (active.title || active.issuer || active.date || active.url)
  const set = []
  if (items.length > 0) while (set.length < 8) set.push(...items)
  const loop = [...set, ...set]
  const duration = Math.max(30, set.length * 5)

  return (
    <div className="about-certificates">
      <div className="admin-section-header">
        <h2 className="about-section-title">Certificates</h2>
        {user && <Link to="/admin/certificates" className="admin-edit-link">Edit</Link>}
      </div>

      {items.length === 0 ? (
        <p className="cert-empty">No certificates yet.</p>
      ) : (
        <div className="cert-marquee">
          <div className="cert-track" style={{ animationDuration: `${duration}s` }}>
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
